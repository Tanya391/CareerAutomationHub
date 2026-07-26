const { initializeDatabase, query } = require('./src/config/db');

async function seedRealCompanies() {
  try {
    await initializeDatabase();
    console.log('Seeding real companies for LLM parsing...');
    
    const seedSql = `
      INSERT INTO companies (company_name, career_url, is_active)
      VALUES (?, ?, ?)
    `;

    // Add Google, Microsoft, and TCS
    await query(seedSql, ['Google', 'https://www.google.com/about/careers/applications/jobs/results/', true]);
    await query(seedSql, ['Microsoft', 'https://jobs.careers.microsoft.com/global/en/search', true]);
    await query(seedSql, ['TCS', 'https://www.tcs.com/careers', true]);

    console.log('Successfully seeded real targets. Run the scheduler to test the LLM parser!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed real companies:', error);
    process.exit(1);
  }
}

seedRealCompanies();
