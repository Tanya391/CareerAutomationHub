const { query } = require('../config/db');
const { runJobIngestionCycle } = require('../services/schedulerService');

// Manually trigger the scraper & notification pipeline
async function triggerScraperRun(req, res) {
  try {
    console.log('[API] Automation cycle triggered manually by user:', req.user.id);
    
    // Run cycle asynchronously so user doesn't wait for 30 seconds for HTTP response
    // But we return a message indicating it has started.
    // Or we can await it if we want to show instant results!
    // Since it scrapes mock local files, it takes only 3-5 seconds. Let's await it so the UI gets instant confirmation!
    const results = await runJobIngestionCycle();

    res.json({
      message: 'Automation cycle completed successfully.',
      results
    });
  } catch (error) {
    console.error('Manual Scraper Trigger Failed:', error);
    res.status(500).json({ error: 'Failed to run automation cycle: ' + error.message });
  }
}

// Retrieve automation scan history logs
async function getAutomationLogs(req, res) {
  try {
    const sql = `
      SELECT l.*, c.company_name
      FROM scan_logs l
      JOIN companies c ON l.company_id = c.id
      ORDER BY l.start_time DESC
      LIMIT 50
    `;
    const logs = await query(sql);
    res.json(logs);
  } catch (error) {
    console.error('Get Automation Logs Error:', error);
    res.status(500).json({ error: 'Internal server error fetching logs.' });
  }
}

module.exports = {
  triggerScraperRun,
  getAutomationLogs
};
