const { query } = require('../config/db');

// Get jobs list with search, sorting, filtering, and pagination
async function getJobs(req, res) {
  try {
    const {
      search,
      company_id,
      work_mode,
      experience,
      employment_type,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `
      SELECT j.*, c.company_name 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Search filter (searches title, description, skills, company name)
    if (search) {
      sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.skills LIKE ? OR c.company_name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    // Company filter
    if (company_id) {
      sql += ` AND j.company_id = ?`;
      params.push(parseInt(company_id));
    }

    // Work Mode filter
    if (work_mode) {
      sql += ` AND j.work_mode = ?`;
      params.push(work_mode);
    }

    // Employment Type filter
    if (employment_type) {
      sql += ` AND j.employment_type = ?`;
      params.push(employment_type);
    }

    // Experience filter
    if (experience) {
      sql += ` AND j.experience = ?`;
      params.push(experience);
    }

    // Sorting options
    if (sort === 'oldest') {
      sql += ` ORDER BY j.discovered_at ASC`;
    } else if (sort === 'company') {
      sql += ` ORDER BY c.company_name ASC`;
    } else {
      // default: newest
      sql += ` ORDER BY j.discovered_at DESC`;
    }

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const jobs = await query(sql, params);

    // Fetch total count for pagination metadata
    let countSql = `
      SELECT COUNT(*) as total 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countSql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.skills LIKE ? OR c.company_name LIKE ?)`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }
    if (company_id) {
      countSql += ` AND j.company_id = ?`;
      countParams.push(parseInt(company_id));
    }
    if (work_mode) {
      countSql += ` AND j.work_mode = ?`;
      countParams.push(work_mode);
    }
    if (employment_type) {
      countSql += ` AND j.employment_type = ?`;
      countParams.push(employment_type);
    }
    if (experience) {
      countSql += ` AND j.experience = ?`;
      countParams.push(experience);
    }

    const countResult = await query(countSql, countParams);
    const totalJobs = countResult[0].total;

    res.json({
      jobs,
      pagination: {
        total: totalJobs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'Internal server error fetching jobs.' });
  }
}

// Get specific job detail
async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT j.*, c.company_name, c.career_url as company_career_url
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
    `;
    const jobs = await query(sql, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Get Job Detail Error:', error);
    res.status(500).json({ error: 'Internal server error fetching job details.' });
  }
}

module.exports = {
  getJobs,
  getJobById
};
