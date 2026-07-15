const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all automation endpoints
router.use(authMiddleware);

router.post('/run', automationController.triggerScraperRun);
router.get('/logs', automationController.getAutomationLogs);

module.exports = router;
