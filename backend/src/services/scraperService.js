const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const { query } = require('../config/db');
const { generateJobHash } = require('../utils/hash');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Scrapes a single company's career page based on its layout pattern.
 * Saves discovered jobs, checks for duplicates, and writes scan_logs.
 */
async function scrapeCompanyJobs(company) {
  const startTime = new Date();
  let jobsFound = 0;
  let jobsAdded = 0;
  let status = 'SUCCESS';
  let errorMessage = null;
  let browser = null;

  console.log(`Starting scrape cycle for company: ${company.company_name} (URL: ${company.career_url})`);

  try {
    // 1. Launch Playwright Headless Browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // Set viewport and default timeouts
    await page.setViewportSize({ width: 1280, height: 800 });
    page.setDefaultTimeout(30000); // 30s timeout for heavier dynamic pages

    // 2. Navigate to Career URL (use domcontentloaded to avoid waiting for endless trackers/analytics to finish)
    await page.goto(company.career_url, { waitUntil: 'domcontentloaded' });

    let rawJobs = [];

    // Determine layout parsing style based on URL or keywords in company_name
    // (In our mock environment, we map Stripe to Scroll, Atlassian to JSON-LD, Canva to Table)
    const url = company.career_url.toLowerCase();
    
    if (url.includes('json-ld')) {
      rawJobs = await parseJsonLdLayout(page);
    } else if (url.includes('infinite-scroll')) {
      rawJobs = await parseInfiniteScrollLayout(page);
    } else if (url.includes('template/table')) {
      // Default to HTML Table structure
      rawJobs = await parseTableLayout(page);
    } else {
      // LLM Parser for custom dynamic real-world sites
      console.log(`[LLM Scraper] Using LLM Parser for ${company.company_name}...`);
      rawJobs = await parseWithLLM(page, company.career_url);
    }

    jobsFound = rawJobs.length;
    console.log(`Scraper found ${jobsFound} jobs on page.`);

    // 3. Process & Save Jobs with SHA-256 Deduplication
    for (const rawJob of rawJobs) {
      // Generate SHA-256 fingerprint hash
      const uniqueHash = generateJobHash(
        company.id,
        rawJob.title,
        rawJob.location,
        rawJob.apply_url
      );

      // We use INSERT IGNORE to skip duplicates at the database level.
      // Alternatively, we can check database count, but INSERT IGNORE is standard and fast in MySQL.
      const insertSql = `
        INSERT IGNORE INTO jobs 
        (company_id, title, description, location, experience, skills, employment_type, salary, work_mode, apply_url, unique_hash, posted_date, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        company.id,
        rawJob.title,
        rawJob.description || 'No description provided.',
        rawJob.location || 'Not specified',
        rawJob.experience || 'Not specified',
        rawJob.skills || '',
        rawJob.employment_type || 'Full-Time',
        rawJob.salary || 'Not disclosed',
        rawJob.work_mode || 'Onsite',
        rawJob.apply_url,
        uniqueHash,
        rawJob.posted_date || new Date(),
        company.company_name
      ];

      const result = await query(insertSql, values);
      
      // In mysql2, insertId is 0 if INSERT IGNORE triggers (or affectedRows is 0 if duplicate)
      if (result && result.affectedRows > 0) {
        jobsAdded++;
      }
    }

    console.log(`Scrape success. Saved ${jobsAdded} new jobs.`);

    // Update company last scan timestamp
    await query('UPDATE companies SET last_scan = CURRENT_TIMESTAMP WHERE id = ?', [company.id]);

  } catch (error) {
    console.error(`Scrape failure for ${company.company_name}:`, error.message);
    status = error.message.includes('timeout') ? 'LAYOUT_CHANGED' : 'FAILED';
    errorMessage = error.stack || error.message;
  } finally {
    if (browser) {
      await browser.close();
    }

    const endTime = new Date();
    
    // Log execution metrics to scan_logs
    await query(
      'INSERT INTO scan_logs (company_id, start_time, end_time, jobs_found, jobs_added, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company.id, startTime, endTime, jobsFound, jobsAdded, status, errorMessage]
    );
  }

  return { jobsFound, jobsAdded, status, errorMessage };
}

// ==========================================
// Parsing Helper: HTML Table Layout
// ==========================================
async function parseTableLayout(page) {
  // Wait for the table rows to render
  await page.waitForSelector('.job-row', { timeout: 5000 });

  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.job-row'));
    return rows.map(row => {
      const titleEl = row.querySelector('.job-title');
      const locationEl = row.querySelector('.job-location');
      const modeEl = row.querySelector('.job-mode');
      const typeEl = row.querySelector('.job-type');
      const expEl = row.querySelector('.job-exp');
      const salaryEl = row.querySelector('.job-salary');
      const skillsEl = row.querySelector('.job-skills');
      const descEl = row.querySelector('.job-desc');
      const applyEl = row.querySelector('.apply-btn');

      return {
        title: titleEl ? titleEl.textContent.trim() : 'Unknown Role',
        location: locationEl ? locationEl.textContent.trim() : 'Onsite',
        work_mode: modeEl ? modeEl.textContent.trim() : 'Onsite',
        employment_type: typeEl ? typeEl.textContent.trim() : 'Full-Time',
        experience: expEl ? expEl.textContent.trim() : 'Fresher',
        salary: salaryEl ? salaryEl.textContent.trim() : 'Not disclosed',
        skills: skillsEl ? skillsEl.textContent.trim() : '',
        description: descEl ? descEl.textContent.trim() : '',
        apply_url: applyEl ? applyEl.href : ''
      };
    });
  });
}

// ==========================================
// Parsing Helper: JSON-LD Structured Data
// ==========================================
async function parseJsonLdLayout(page) {
  // Wait for the JSON-LD script tag or cards to appear
  await page.waitForSelector('script[type="application/ld+json"]', { state: 'attached', timeout: 5000 });

  const ldDataStrings = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    return scripts.map(s => s.textContent.trim());
  });

  const parsedJobs = [];

  for (const ldStr of ldDataStrings) {
    try {
      const data = JSON.parse(ldStr);
      
      // Handle array of items or single item
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item['@type'] === 'JobPosting') {
          // Normalize JSON-LD fields
          const title = item.title;
          const description = item.description;
          const apply_url = item.url || '';
          
          let location = 'Onsite';
          if (item.jobLocation && item.jobLocation.address) {
            location = item.jobLocation.address.addressLocality || 'Onsite';
          }
          
          let salary = 'Not disclosed';
          if (item.baseSalary && item.baseSalary.value) {
            salary = item.baseSalary.value.value || 'Not disclosed';
          }

          let type = 'Full-Time';
          if (item.employmentType === 'INTERN') {
            type = 'Internship';
          }

          // Custom properties stored in mock script
          const experience = (item.customData && item.customData.experience) || 'Fresher';
          const work_mode = (item.customData && item.customData.workMode) || 'Onsite';

          // Extract skills by scraping from description keywords or mock text
          let skills = '';
          const skillsMatch = description.match(/Skills required:\s*([^\n\r]+)/i);
          if (skillsMatch) {
            skills = skillsMatch[1].trim();
          }

          parsedJobs.push({
            title,
            description,
            location,
            work_mode,
            employment_type: type,
            experience,
            salary,
            skills,
            apply_url
          });
        }
      }
    } catch (e) {
      console.error('Error parsing JSON-LD script content:', e.message);
    }
  }

  return parsedJobs;
}

// ==========================================
// Parsing Helper: Dynamic / Infinite Scroll AJAX
// ==========================================
async function parseInfiniteScrollLayout(page) {
  // Wait for dynamic listings container to render first set of jobs
  await page.waitForSelector('.job-item', { timeout: 8000 });

  // Playwright feature: Wait for AJAX load, and click "Load More" button to fetch rest of listings
  const loadMoreBtn = page.locator('#load-more-btn');
  if (await loadMoreBtn.isVisible()) {
    await loadMoreBtn.click();
    // Wait for the total count of listings to increase
    await page.waitForTimeout(1000); // Small wait for UI transition
  }

  // Retrieve details
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.job-item'));
    return cards.map(card => {
      const titleEl = card.querySelector('.title');
      const locEl = card.querySelector('.location');
      const descEl = card.querySelector('.desc');
      const skillsEl = card.querySelector('.skills');
      const linkEl = card.querySelector('.apply-link');

      // Extract metadata text
      const metaText = card.textContent || '';
      
      let work_mode = 'Onsite';
      if (metaText.includes('Mode: Remote')) work_mode = 'Remote';
      else if (metaText.includes('Mode: Hybrid')) work_mode = 'Hybrid';

      let employment_type = 'Full-Time';
      if (metaText.toLowerCase().includes('intern')) employment_type = 'Internship';

      let experience = 'Fresher';
      const expMatch = metaText.match(/Exp:\s*([^\n|]+)/);
      if (expMatch) experience = expMatch[1].trim();

      let salary = 'Not disclosed';
      const salMatch = metaText.match(/Salary:\s*([^\n|]+)/);
      if (salMatch) salary = salMatch[1].trim();

      return {
        title: titleEl ? titleEl.textContent.trim() : 'Role',
        location: locEl ? locEl.textContent.trim() : 'Onsite',
        work_mode,
        employment_type,
        experience,
        salary,
        skills: skillsEl ? skillsEl.textContent.trim() : '',
        description: descEl ? descEl.textContent.trim() : '',
        apply_url: linkEl ? linkEl.href : ''
      };
    });
  });
}

// ==========================================
// Parsing Helper: Gemini AI LLM Parser
// ==========================================
async function parseWithLLM(page, sourceUrl) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[LLM Scraper] GEMINI_API_KEY is missing. Skipping LLM parsing.');
    return [];
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 1. Extract raw visible text from the page
  const pageText = await page.evaluate(() => {
    // Basic cleanup: remove script and style tags to minimize token usage
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(s => s.remove());
    return document.body.innerText.replace(/\n\s*\n/g, '\n').substring(0, 100000); // truncate if too large
  });

  const prompt = `
You are a career page data extractor.
I will provide you with the raw visible text from a company's career webpage.
Your task is to extract all the available job listings and return them as a strict JSON array.
If there are no jobs found, return an empty array [].

The JSON array must contain objects with the following schema:
- title (string): Job title.
- location (string): The location of the job. Defaults to 'Onsite' if unknown.
- work_mode (string): 'Remote', 'Hybrid', or 'Onsite'.
- employment_type (string): 'Full-Time', 'Part-Time', 'Contract', or 'Internship'.
- experience (string): Extracted experience required, or 'Not specified'.
- salary (string): Salary range if present, or 'Not disclosed'.
- skills (string): Extract up to 5 key technical skills mentioned, comma separated.
- description (string): A short 1-3 sentence summary of the job.
- apply_url (string): Set this exactly to: "${sourceUrl}"

Here is the raw text from the webpage:
"""
${pageText}
"""
`;

  let result;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
  } catch (error) {
    console.warn('[LLM Scraper] gemini-1.5-flash failed, trying gemini-pro as fallback...', error.message);
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    // gemini-pro might not support responseMimeType: "application/json" in older versions, so we pass it without it
    result = await fallbackModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + "\n\nCRITICAL: You MUST return ONLY valid JSON." }] }]
    });
  }

  try {
    let responseText = result.response.text();
    // Clean up potential markdown formatting from gemini-pro
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJobs = JSON.parse(responseText);
    
    if (Array.isArray(parsedJobs)) {
      return parsedJobs;
    } else {
      console.warn('[LLM Scraper] LLM did not return an array. Falling back to empty array.');
      return [];
    }
  } catch (error) {
    console.error('[LLM Scraper] Failed to parse with Gemini API:', error.message);
    throw new Error('LLM_PARSE_FAILED');
  }
}

module.exports = {
  scrapeCompanyJobs
};
