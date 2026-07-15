const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.MOCK_PORT || 5001;

// Seed data for jobs
const baseJobs = [
  {
    id: 1,
    title: 'Software Engineer - Backend',
    description: 'We are looking for a Backend Engineer proficient in Node.js, Express, and MySQL. You will build highly scalable APIs and design clean database schemas.',
    location: 'Bangalore, India',
    experience: '1-3 years',
    skills: 'Node.js, Express, MySQL, REST APIs, Git',
    employment_type: 'Full-Time',
    salary: '₹12,00,000 - ₹18,00,000 PA',
    work_mode: 'Hybrid',
    apply_url: 'https://careers.mockcompany.com/jobs/backend-engineer-101'
  },
  {
    id: 2,
    title: 'Frontend Developer - React',
    description: 'Join our UI team to craft beautiful web interfaces. Experience with React.js, Tailwind CSS, and state management (Redux/Context API) is required.',
    location: 'Remote',
    experience: 'Fresher',
    skills: 'React.js, Tailwind CSS, Javascript, HTML, CSS',
    employment_type: 'Full-Time',
    salary: '₹6,00,000 - ₹9,00,000 PA',
    work_mode: 'Remote',
    apply_url: 'https://careers.mockcompany.com/jobs/react-frontend-102'
  },
  {
    id: 3,
    title: 'Full Stack Web Developer Intern',
    description: 'Exciting internship opportunity for students. Work on React frontends and Node.js backends. Learn database querying and cloud hosting.',
    location: 'Mumbai, India',
    experience: 'Internship',
    skills: 'React.js, Node.js, Express, SQL, CSS',
    employment_type: 'Internship',
    salary: '₹25,000/month',
    work_mode: 'Onsite',
    apply_url: 'https://careers.mockcompany.com/jobs/fullstack-intern-103'
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    description: 'Help us automate deployment pipelines. Set up CI/CD, manage AWS infrastructure, Docker containerization, and server monitoring tools.',
    location: 'Bangalore, India',
    experience: '3+ years',
    skills: 'AWS, Docker, CI/CD, Linux, Shell Scripting',
    employment_type: 'Full-Time',
    salary: '₹15,00,000 - ₹22,00,000 PA',
    work_mode: 'Onsite',
    apply_url: 'https://careers.mockcompany.com/jobs/devops-engineer-104'
  },
  {
    id: 5,
    title: 'Data Analyst',
    description: 'Analyze user behavior data to derive business insights. Write advanced SQL queries, build dashboards in Tableau/PowerBI, and perform Python data analysis.',
    location: 'Pune, India',
    experience: '1-2 years',
    skills: 'SQL, Python, Excel, Tableau, Statistics',
    employment_type: 'Full-Time',
    salary: '₹8,00,000 - ₹11,00,000 PA',
    work_mode: 'Hybrid',
    apply_url: 'https://careers.mockcompany.com/jobs/data-analyst-105'
  }
];

// 1. Template: HTML Table Layout (Standard tabular markup)
app.get('/template/table', (req, res) => {
  const rows = baseJobs.filter(j => j.id !== 4).map(job => `
    <tr class="job-row">
      <td class="job-title" data-testid="title">${job.title}</td>
      <td class="job-location" data-testid="location">${job.location}</td>
      <td class="job-mode">${job.work_mode}</td>
      <td class="job-type">${job.employment_type}</td>
      <td class="job-exp">${job.experience}</td>
      <td class="job-salary">${job.salary}</td>
      <td class="job-skills" style="display: none;">${job.skills}</td>
      <td class="job-desc" style="display: none;">${job.description}</td>
      <td>
        <a class="apply-btn" href="${job.apply_url}">Apply Now</a>
      </td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Canva Careers - Table Layout</title>
      <style>
        body { font-family: sans-serif; background-color: #fafafa; padding: 40px; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        th, td { padding: 12px 15px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
        .apply-btn { background-color: #833ab4; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Canva Careers</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Work Mode</th>
            <th>Type</th>
            <th>Experience</th>
            <th>Salary</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `);
});

// 2. Template: JSON-LD Schema Layout
app.get('/template/json-ld', (req, res) => {
  // Select a subset of jobs
  const targetJobs = [baseJobs[0], baseJobs[1], baseJobs[4]];
  
  // Format each job in JSON-LD structure
  const jsonLdBlocks = targetJobs.map(job => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description + ' Skills required: ' + job.skills,
    'datePosted': '2026-07-15',
    'validThrough': '2026-12-31',
    'employmentType': job.employment_type === 'Internship' ? 'INTERN' : 'FULL_TIME',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': 'Atlassian'
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressCountry': 'IN'
      }
    },
    'baseSalary': {
      '@type': 'MonetaryAmount',
      'currency': 'INR',
      'value': {
        '@type': 'QuantitativeValue',
        'value': job.salary
      }
    },
    'url': job.apply_url,
    'customData': {
      'experience': job.experience,
      'workMode': job.work_mode
    }
  }));

  const scriptTags = jsonLdBlocks.map(block => `
    <script type="application/ld+json">
      ${JSON.stringify(block, null, 2)}
    </script>
  `).join('\n');

  // The UI is a modern list, but Playwright will parse the JSON-LD blocks!
  const uiList = targetJobs.map(job => `
    <div class="card">
      <h3>${job.title}</h3>
      <p>📍 ${job.location} | 💼 ${job.work_mode} | ⏱️ ${job.employment_type}</p>
      <a href="${job.apply_url}">Apply Now</a>
    </div>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Atlassian Careers - JSON-LD Metadata</title>
      ${scriptTags}
      <style>
        body { font-family: sans-serif; background-color: #f0f2f5; padding: 40px; max-width: 800px; margin: 0 auto; }
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        h3 { margin-top: 0; color: #0052CC; }
        a { color: #0052CC; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Atlassian Careers</h1>
      <p>This page embeds structured JSON-LD data for search crawlers.</p>
      <div class="jobs-list">
        ${uiList}
      </div>
    </body>
    </html>
  `);
});

// 3. Template: Dynamic Infinite Scroll / AJAX Layout
app.get('/template/infinite-scroll', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Stripe Careers - Dynamic AJAX Layout</title>
      <style>
        body { font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        .job-item { border-left: 4px solid #635bff; padding: 15px; margin: 15px 0; background: #f8f9fa; }
        .loading { color: #666; font-style: italic; }
        button { background: #635bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Stripe Career Opportunities</h1>
      <div id="jobs-container">
        <p class="loading" id="loading-text">Loading jobs dynamically via AJAX...</p>
      </div>
      <button id="load-more-btn" style="display:none;">Load More Jobs</button>

      <script>
        // Simulate network latency of 1 second
        setTimeout(() => {
          fetch('/api/mock-jobs')
            .then(res => res.json())
            .then(jobs => {
              const container = document.getElementById('jobs-container');
              container.innerHTML = ''; // Clear loading text
              
              // Load first 3 jobs
              renderJobs(jobs.slice(0, 3));
              
              const btn = document.getElementById('load-more-btn');
              btn.style.display = 'block';
              
              btn.addEventListener('click', () => {
                // Load remaining jobs when clicked
                renderJobs(jobs.slice(3));
                btn.style.display = 'none';
              });
            });
        }, 1200);

        function renderJobs(jobList) {
          const container = document.getElementById('jobs-container');
          jobList.forEach(job => {
            const div = document.createElement('div');
            div.className = 'job-item';
            div.innerHTML = \`
              <h2 class="title">\${job.title}</h2>
              <p><strong>Location:</strong> <span class="location">\${job.location}</span> | <strong>Mode:</strong> \${job.work_mode}</p>
              <p class="desc">\${job.description}</p>
              <p><strong>Skills:</strong> <span class="skills">\${job.skills}</span></p>
              <p><strong>Salary:</strong> \${job.salary} | <strong>Exp:</strong> \${job.experience}</p>
              <a class="apply-link" href="\${job.apply_url}">Apply on Stripe Portal</a>
            \`;
            container.appendChild(div);
          });
        }
      </script>
    </body>
    </html>
  `);
});

// JSON API returning list of jobs
app.get('/api/mock-jobs', (req, res) => {
  res.json(baseJobs);
});

app.listen(PORT, () => {
  console.log(`Mock Careers Server running at http://localhost:${PORT}`);
});
