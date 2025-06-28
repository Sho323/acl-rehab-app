const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exercises');
const progressRoutes = require('./routes/progress');
const videosRoutes = require('./routes/videos');
const aiAnalysisRoutes = require('./routes/ai-analysis');
const medicalCollaborationRoutes = require('./routes/medical-collaboration');
const patientsRoutes = require('./routes/patients');

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ACL Rehab App Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/patient/progress', progressRoutes);
app.use('/api/patient/videos', videosRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/medical-collaboration', medicalCollaborationRoutes);
app.use('/api/patient', patientsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`ACL Rehab App server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;