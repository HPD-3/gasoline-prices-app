const fs = require('fs');
const path = require('path');

// Create api directory
const apiDir = path.join(__dirname, 'api');
try {
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Create fuel.js
  const fuelCode = require('fs').readFileSync(path.join(__dirname, 'fuel-handler.js'), 'utf8');
  fs.writeFileSync(path.join(apiDir, 'fuel.js'), fuelCode);
  console.log('✓ api/fuel.js created');
} catch (err) {
  console.error('Setup error:', err.message);
}
