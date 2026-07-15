const { query } = require('../config/db');

// List all companies
async function getCompanies(req, res) {
  try {
    const companies = await query('SELECT * FROM companies ORDER BY company_name ASC');
    res.json(companies);
  } catch (error) {
    console.error('Get Companies Error:', error);
    res.status(500).json({ error: 'Internal server error fetching companies.' });
  }
}

// Add a company
async function addCompany(req, res) {
  try {
    const { company_name, career_url, is_active } = req.body;

    if (!company_name || !career_url) {
      return res.status(400).json({ error: 'Company Name and Career URL are required.' });
    }

    // Check if company already exists
    const existing = await query('SELECT id FROM companies WHERE company_name = ?', [company_name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Company name already exists.' });
    }

    const activeStatus = is_active !== undefined ? is_active : true;

    const result = await query(
      'INSERT INTO companies (company_name, career_url, is_active) VALUES (?, ?, ?)',
      [company_name, career_url, activeStatus]
    );

    res.status(201).json({
      message: 'Company added successfully',
      company: {
        id: result.insertId,
        company_name,
        career_url,
        is_active: activeStatus
      }
    });
  } catch (error) {
    console.error('Add Company Error:', error);
    res.status(500).json({ error: 'Internal server error adding company.' });
  }
}

// Update a company (name, url, or is_active toggle)
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { company_name, career_url, is_active } = req.body;

    // Check if company exists
    const company = await query('SELECT * FROM companies WHERE id = ?', [id]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const current = company[0];
    const newName = company_name !== undefined ? company_name : current.company_name;
    const newUrl = career_url !== undefined ? career_url : current.career_url;
    const newActive = is_active !== undefined ? is_active : current.is_active;

    await query(
      'UPDATE companies SET company_name = ?, career_url = ?, is_active = ? WHERE id = ?',
      [newName, newUrl, newActive, id]
    );

    res.json({
      message: 'Company updated successfully',
      company: {
        id: parseInt(id),
        company_name: newName,
        career_url: newUrl,
        is_active: newActive
      }
    });
  } catch (error) {
    console.error('Update Company Error:', error);
    res.status(500).json({ error: 'Internal server error updating company.' });
  }
}

// Delete a company
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;

    const company = await query('SELECT id FROM companies WHERE id = ?', [id]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    await query('DELETE FROM companies WHERE id = ?', [id]);

    res.json({ message: 'Company and associated jobs/logs deleted successfully.' });
  } catch (error) {
    console.error('Delete Company Error:', error);
    res.status(500).json({ error: 'Internal server error deleting company.' });
  }
}

module.exports = {
  getCompanies,
  addCompany,
  updateCompany,
  deleteCompany
};
