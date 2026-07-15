const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Generate unique SHA-256 hash for job fingerprint
function generateJobHash(companyId, title, location, applyUrl) {
  // Normalize fields to ensure consistency
  const cleanTitle = (title || '').trim().toLowerCase();
  const cleanLocation = (location || '').trim().toLowerCase();
  const cleanUrl = (applyUrl || '').trim().toLowerCase();
  
  const compositeString = `${companyId}:${cleanTitle}:${cleanLocation}:${cleanUrl}`;
  return crypto.createHash('sha256').update(compositeString).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  generateJobHash
};
