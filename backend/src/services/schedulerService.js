const { query } = require('../config/db');
const { scrapeCompanyJobs } = require('./scraperService');
const { calculateMatchScore } = require('./matchingService');
const { sendJobMatchAlert } = require('./emailService');

/**
 * Main coordinator function that executes the full automation cycle:
 * 1. Fetch active companies
 * 2. Crawl jobs using Playwright
 * 3. Match against all user skill preferences
 * 4. Record matches in applications table
 * 5. Send Nodemailer notifications
 */
async function runJobIngestionCycle() {
  console.log('=== [Scheduler] Starting Automation Cycle ===');
  
  try {
    // 1. Fetch active companies
    const activeCompanies = await query('SELECT * FROM companies WHERE is_active = TRUE');
    if (activeCompanies.length === 0) {
      console.log('[Scheduler] No active companies configured for scraping. Skipping crawl.');
    }

    // 2. Scrape each company sequentially
    for (const company of activeCompanies) {
      try {
        await scrapeCompanyJobs(company);
      } catch (err) {
        console.error(`[Scheduler] Scrape execution failed for ${company.company_name}:`, err.message);
      }
    }

    console.log('[Scheduler] Scraping completed. Starting keyword match pipeline...');

    // 3. Process matches for each user
    const users = await query('SELECT * FROM users');
    if (users.length === 0) {
      console.log('[Scheduler] No registered users found. Skipping matching cycle.');
      return { success: true, message: 'Scrape finished. No users to match.' };
    }

    // Get all jobs added in the system
    const allJobs = await query('SELECT * FROM jobs');
    
    let matchesFound = 0;
    let alertsSent = 0;

    for (const user of users) {
      for (const job of allJobs) {
        // Check if user has already processed this job (to prevent duplicate matching and alerts)
        const processed = await query(
          'SELECT id, is_notified FROM applications WHERE user_id = ? AND job_id = ?',
          [user.id, job.id]
        );

        // If user already has this job in their tracker, check if notified
        if (processed.length > 0) {
          // If already saved, skip matching calculation to save CPU
          continue;
        }

        // Calculate score
        const { score, matched, missing } = calculateMatchScore(
          job.skills,
          job.description,
          job.title,
          user.skills_keywords
        );

        // Check if score meets user threshold
        if (score >= user.min_match_score) {
          matchesFound++;
          
          // Save match to applications tracker (Status = 'Saved')
          const insertAppSql = `
            INSERT INTO applications (user_id, job_id, match_score, is_notified, notified_at, status)
            VALUES (?, ?, ?, ?, ?, 'Saved')
            ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
          `;

          // Dispatch email notification
          let isNotified = false;
          let notifiedAt = null;
          let emailPreviewUrl = null;

          try {
            const emailResult = await sendJobMatchAlert(
              user.email,
              user.name,
              job,
              score,
              matched,
              missing
            );
            isNotified = true;
            notifiedAt = new Date();
            alertsSent++;
            if (emailResult && emailResult.previewUrl) {
              emailPreviewUrl = emailResult.previewUrl;
            }
          } catch (mailError) {
            console.error(`[Scheduler] Failed to send email alert to ${user.email}:`, mailError.message);
          }

          // Insert into application tracker
          await query(insertAppSql, [
            user.id,
            job.id,
            score,
            isNotified ? 1 : 0,
            notifiedAt
          ]);

          if (isNotified) {
            console.log(`[Scheduler] Match Found! ${user.name} matched ${job.title} (${score}%). Email Alert sent.${emailPreviewUrl ? ` Preview URL: ${emailPreviewUrl}` : ''}`);
          }
        }
      }
    }

    console.log(`=== [Scheduler] Cycle Finished. Matches processed: ${matchesFound}, Notifications sent: ${alertsSent} ===`);
    return { success: true, matchesFound, alertsSent };

  } catch (error) {
    console.error('[Scheduler] Critical automation cycle error:', error);
    throw error;
  }
}

module.exports = {
  runJobIngestionCycle
};
