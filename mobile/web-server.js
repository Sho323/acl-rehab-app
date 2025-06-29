const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

// Static files
app.use(express.static(path.join(__dirname, 'web-build')));

// Basic API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'ACL Rehab App API is working!', timestamp: new Date() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ACL Rehab App running at:`);
  console.log(`  Local: http://localhost:${port}`);
  console.log(`  Network: http://192.168.3.186:${port}`);
  console.log(`  Mobile: スマートフォンから http://192.168.3.186:${port} にアクセス`);
});