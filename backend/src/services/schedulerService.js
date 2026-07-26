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
async function runJobIngestionCycle(targetCompanyId = null) {
  console.log('=== [Scheduler] Starting Automation Cycle ===');
  
  try {
    // 1. Fetch active companies
    let sql = 'SELECT * FROM companies WHERE is_active = TRUE';
    let params = [];
    if (targetCompanyId) {
      sql += ' AND id = ?';
      params.push(targetCompanyId);
      console.log(`[Scheduler] Targeted scrape for company ID: ${targetCompanyId}`);
    }

    const activeCompanies = await query(sql, params);
    if (activeCompanies.length === 0) {
      console.log('[Scheduler] No active companies configured/found for scraping. Skipping crawl.');
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

    // Get jobs discovered in the last 24 hours to keep the matching set bounded.
    // This prevents memory blowout as the jobs table grows over time.
    const allJobs = await query(
      "SELECT * FROM jobs WHERE discovered_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );
    
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

          // Insert the application record FIRST so the job is always tracked,
          // even if the subsequent email send fails.
          const insertAppSql = `
            INSERT INTO applications (user_id, job_id, match_score, is_notified, notified_at, status)
            VALUES (?, ?, ?, ?, ?, 'Saved')
            ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)
          `;
          await query(insertAppSql, [user.id, job.id, score, 0, null]);

          // Now attempt to dispatch email notification
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

            // Update the row to mark it as notified
            await query(
              'UPDATE applications SET is_notified = 1, notified_at = ? WHERE user_id = ? AND job_id = ?',
              [notifiedAt, user.id, job.id]
            );

            console.log(`[Scheduler] Match Found! ${user.name} matched ${job.title} (${score}%). Email Alert sent.${emailPreviewUrl ? ` Preview URL: ${emailPreviewUrl}` : ''}`);
          } catch (mailError) {
            console.error(`[Scheduler] Failed to send email alert to ${user.email}:`, mailError.message);
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
