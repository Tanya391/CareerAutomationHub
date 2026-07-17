const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'career_automation_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for running queries
async function query(sql, params) {
  try {
    // We use pool.query instead of pool.execute here because we build dynamic SQL
    // strings with varying parameters. pool.execute creates a prepared statement
    // which can fail with LIMIT/OFFSET in some MySQL versions and exhausts the cache.
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('MySQL Query Error:', { sql, params, error: error.message });
    throw error;
  }
}

// Function to run database setup (migrations)
async function initializeDatabase() {
  let connection;
  try {
    // Connect without database first to ensure it exists
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    // Create DB if not exists
    const dbName = process.env.DB_NAME || 'career_automation_hub';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" verified/created.`);

    // Now, run the tables schema from schema.sql
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the entire schema script in one go
      await connection.query(schemaSql);
      console.log('Database tables successfully checked/created.');
    } else {
      console.warn('schema.sql not found at', schemaPath, 'Skipping table auto-creation.');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database Initialization Failed:', error.message);
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}

module.exports = {
  pool,
  query,
  initializeDatabase
};
