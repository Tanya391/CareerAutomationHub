require('dotenv').config();
const { sendJobMatchAlert } = require('./src/services/emailService');

async function runTest() {
  console.log('Testing Email Service...');
  try {
    const dummyJob = {
      title: 'Senior Software Engineer (Test Email)',
      source: 'Google (Testing Lab)',
      location: 'Remote',
      work_mode: 'Remote',
      experience: '5+ Years',
      salary: '$150,000 - $200,000',
      apply_url: 'https://careers.google.com'
    };
    
    const result = await sendJobMatchAlert(
      process.env.EMAIL_USER, // send to themselves
      'Tanya',
      dummyJob,
      95,
      ['React', 'Node.js', 'Playwright'],
      ['GraphQL']
    );
    console.log('SUCCESS! Email sent successfully.');
    console.log('Result:', result);
  } catch (err) {
    console.error('FAILED to send email.');
    console.error(err);
  }
}

runTest();
