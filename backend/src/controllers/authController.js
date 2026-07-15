const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123456!@#';

// Register User
async function register(req, res) {
  try {
    const { name, email, password, skills_keywords, min_match_score } = req.body;

    if (!name || !email || !password || !skills_keywords) {
      return res.status(400).json({ error: 'All fields (name, email, password, skills_keywords) are required.' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const minScore = min_match_score || 70;

    // Insert user
    const insertResult = await query(
      'INSERT INTO users (name, email, password_hash, skills_keywords, min_match_score) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, skills_keywords, minScore]
    );

    const userId = insertResult.insertId;

    // Sign JWT
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, skills_keywords, min_match_score: minScore }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

// Login User
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        skills_keywords: user.skills_keywords,
        min_match_score: user.min_match_score
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

// Get user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const users = await query('SELECT id, name, email, skills_keywords, min_match_score, created_at FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
}

// Update profile / preferences
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, skills_keywords, min_match_score } = req.body;

    // Fetch current user details to fallback
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const currentUser = users[0];
    const newName = name !== undefined ? name : currentUser.name;
    const newSkills = skills_keywords !== undefined ? skills_keywords : currentUser.skills_keywords;
    const newMinScore = min_match_score !== undefined ? min_match_score : currentUser.min_match_score;

    await query(
      'UPDATE users SET name = ?, skills_keywords = ?, min_match_score = ? WHERE id = ?',
      [newName, newSkills, newMinScore, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: newName,
        skills_keywords: newSkills,
        min_match_score: newMinScore
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Internal server error updating profile.' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
