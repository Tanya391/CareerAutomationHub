const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all application routes
router.use(authMiddleware);

router.get('/', applicationController.getApplications);
router.post('/', applicationController.createApplication);
router.put('/:id', applicationController.updateApplication);

module.exports = router;
