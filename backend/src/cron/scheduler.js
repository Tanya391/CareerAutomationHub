const cron = require('node-cron');
const { runJobIngestionCycle } = require('../services/schedulerService');

// Store cron job instance
let cronJob = null;

function startScheduler() {
  console.log('[Scheduler] Initializing cron job...');

  // Run cycle on startup so the database immediately populates mock data
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Executing immediate startup scrape/match cycle...');
      await runJobIngestionCycle();
    } catch (err) {
      console.error('[Scheduler] Startup ingestion failed:', err.message);
    }
  }, 3000); // 3 seconds delay to let mock server start up

  // Schedule to run every 30 minutes
  // Cron format: '*/30 * * * *'
  cronJob = cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] Cron trigger: Starting periodic ingestion...');
    try {
      await runJobIngestionCycle();
    } catch (err) {
      console.error('[Scheduler] Periodic periodic ingestion failed:', err.message);
    }
  });

  console.log('[Scheduler] Background clock active. Periodic interval set to: Every 30 minutes.');
}

function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    console.log('[Scheduler] Background clock suspended.');
  }
}

module.exports = {
  startScheduler,
  stopScheduler
};
