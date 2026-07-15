const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const automationRoutes = require('./routes/automationRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Config CORS
app.use(cors());

// Body parser
app.use(express.json());

// Main entry welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Career Automation Hub API!' });
});

// Bind routers
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/automation', automationRoutes);

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
