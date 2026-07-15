const { query } = require('../config/db');

// Get all applications for the logged-in user
async function getApplications(req, res) {
  try {
    const userId = req.user.id;

    // Join applications with jobs and companies to get complete details
    const sql = `
      SELECT 
        a.id as application_id,
        a.user_id,
        a.job_id,
        a.match_score,
        a.is_notified,
        a.notified_at,
        a.status,
        a.saved_at,
        a.updated_at,
        j.title as job_title,
        j.location as job_location,
        j.experience as job_experience,
        j.employment_type,
        j.work_mode,
        j.salary,
        j.skills as job_skills,
        j.apply_url,
        c.company_name,
        c.id as company_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.updated_at DESC
    `;

    const applications = await query(sql, [userId]);
    res.json(applications);
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ error: 'Internal server error fetching applications.' });
  }
}

// Track a job manually
async function createApplication(req, res) {
  try {
    const userId = req.user.id;
    const { job_id, status } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    // Verify job exists
    const jobs = await query('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Calculate match score manually for the user if it wasn't pre-calculated
    const user = await query('SELECT skills_keywords FROM users WHERE id = ?', [userId]);
    const job = jobs[0];
    
    // We import matchingService lazily to avoid circular dependencies
    const { calculateMatchScore } = require('../services/matchingService');
    const { score } = calculateMatchScore(job.skills, job.description, job.title, user[0].skills_keywords);

    const initialStatus = status || 'Saved';

    const insertSql = `
      INSERT INTO applications (user_id, job_id, match_score, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `;
    
    const result = await query(insertSql, [userId, job_id, score, initialStatus]);

    res.status(201).json({
      message: 'Job tracked successfully',
      application: {
        id: result.insertId || null,
        user_id: userId,
        job_id,
        match_score: score,
        status: initialStatus
      }
    });
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ error: 'Internal server error tracking job.' });
  }
}

// Update application status / notes
async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;

    // Verify application belongs to the user
    const app = await query('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, userId]);
    if (app.length === 0) {
      return res.status(404).json({ error: 'Application not found or access denied.' });
    }

    const current = app[0];
    const newStatus = status !== undefined ? status : current.status;
    const newNotes = notes !== undefined ? notes : current.notes;

    const updateSql = `
      UPDATE applications
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await query(updateSql, [newStatus, newNotes, id]);

    res.json({
      message: 'Application tracker updated',
      application: {
        id: parseInt(id),
        status: newStatus,
        notes: newNotes
      }
    });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ error: 'Internal server error updating tracker.' });
  }
}

module.exports = {
  getApplications,
  createApplication,
  updateApplication
};
