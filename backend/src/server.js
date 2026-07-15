const app = require('./app');
const { initializeDatabase, query } = require('./config/db');
const { startScheduler } = require('./cron/scheduler');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MOCK_PORT = process.env.MOCK_PORT || 5001;

async function bootstrap() {
  try {
    // 1. Verify/Create database and tables
    await initializeDatabase();

    // 2. Seed initial companies pointing to our Mock Career pages
    const companies = await query('SELECT COUNT(*) as count FROM companies');
    if (companies[0].count === 0) {
      console.log('Seeding initial mock career targets...');
      
      const seedSql = `
        INSERT INTO companies (company_name, career_url, is_active)
        VALUES (?, ?, ?)
      `;

      await query(seedSql, ['Atlassian', `http://localhost:${MOCK_PORT}/template/json-ld`, true]);
      await query(seedSql, ['Stripe', `http://localhost:${MOCK_PORT}/template/infinite-scroll`, true]);
      await query(seedSql, ['Canva', `http://localhost:${MOCK_PORT}/template/table`, true]);

      console.log('Successfully seeded Atlassian, Stripe, and Canva mock targets.');
    }

    // 3. Start cron scheduler in background
    startScheduler();

    // 4. Start HTTP Server
    app.listen(PORT, () => {
      console.log(`Express API Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
