const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

// Initialize mail transporter (lazy initialization)
async function getTransporter() {
  if (transporter) return transporter;

  // Check if real SMTP credentials are provided in .env
  const isRealSmtp = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isRealSmtp) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Real SMTP Mail Transporter configured.');
  } else {
    // Fallback: Create dynamic test account on Ethereal.email (zero config!)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`Mock Ethereal Mail Transporter created. Credentials: user=${testAccount.user}`);
    } catch (error) {
      console.error('Failed to create Ethereal Mail Account:', error.message);
      // Fallback dummy transporter that just logs
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('--- DUMMY MAIL DISPATCH ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body: ${mailOptions.text}`);
          console.log('---------------------------');
          return { messageId: 'dummy-id', previewUrl: null };
        }
      };
    }
  }

  return transporter;
}

// Send matching job email alert
async function sendJobMatchAlert(userEmail, userName, job, matchScore, matchedSkills, missingSkills) {
  try {
    const client = await getTransporter();
    
    const matchedList = matchedSkills.map(s => `<li style="color: #2e7d32;">✓ ${s}</li>`).join('');
    const missingList = missingSkills.map(s => `<li style="color: #c62828;">✗ ${s}</li>`).join('');

    const mailOptions = {
      from: `"Career Automation Hub" <${process.env.EMAIL_USER || 'no-reply@careerautomation.com'}>`,
      to: userEmail,
      subject: `🔥 New Matching Job Found: ${job.title} at ${job.source} (Match: ${matchScore}%)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #6200ee; text-align: center; margin-top: 0;">New Opportunity Found!</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We found a new job listing matching your preferred skills:</p>
          
          <div style="background-color: #f7f5ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3700b3;">${job.title}</h3>
            <p style="margin: 5px 0;">🏢 <strong>Company:</strong> ${job.source}</p>
            <p style="margin: 5px 0;">📍 <strong>Location:</strong> ${job.location} (${job.work_mode})</p>
            <p style="margin: 5px 0;">💼 <strong>Experience:</strong> ${job.experience}</p>
            <p style="margin: 5px 0;">💰 <strong>Salary:</strong> ${job.salary}</p>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold; color: #6200ee;">🎯 Resume Match: ${matchScore}%</p>
          </div>

          <div style="margin: 20px 0;">
            <strong>Skills Assessment:</strong>
            <ul style="list-style-type: none; padding-left: 0;">
              ${matchedList}
              ${missingList}
            </ul>
          </div>

          <div style="text-align: center; margin: 35px 0 20px 0;">
            <a href="${job.apply_url}" target="_blank" style="background-color: #6200ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Click Here to Apply</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">This is an automated notification from your Career Automation Dashboard. You can update your settings or disable email alerts anytime.</p>
        </div>
      `
    };

    const info = await client.sendMail(mailOptions);
    
    // If Ethereal mail was used, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Sent] Preview URL: ${previewUrl}`);
      return { messageId: info.messageId, previewUrl };
    }

    return { messageId: info.messageId, previewUrl: null };
  } catch (error) {
    console.error('Email Dispatch Failed:', error.message);
    throw error;
  }
}

module.exports = {
  sendJobMatchAlert
};
