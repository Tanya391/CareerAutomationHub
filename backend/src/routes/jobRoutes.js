const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all job routes
router.use(authMiddleware);

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

module.exports = router;
