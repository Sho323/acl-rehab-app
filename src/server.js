const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for React app
}));
app.use(cors());
app.use(express.json({ 
  limit: '1mb'
}));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../mobile/web-build')));

// Routes
const exerciseRoutes = require('./routes/exercises');
const videosRoutes = require('./routes/videos');

// Serve React App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../mobile/web-build', 'index.html'));
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'ACL Rehabilitation Self-Training App',
    version: '2.0.0',
    status: 'OK',
    message: 'Welcome to ACL Self-Training App',
    endpoints: {
      health: '/health',
      exercises: '/api/exercises/*',
      videos: '/api/videos/*',
      ai: '/api/ai/*'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ACL Self-Training App Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/videos', videosRoutes);

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../mobile/web-build', 'index.html'));
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
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format'
    });
  }
  
  // Handle payload too large errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large'
    });
  }
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`ACL Self-Training App server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;