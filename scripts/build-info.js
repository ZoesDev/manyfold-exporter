const fs = require('fs');
const { execSync } = require('child_process');

// Generate version information
const versionInfo = {
  version: require('../package.json').version, // Get the version from package.json
  commit: execSync('git rev-parse --short HEAD').toString().trim(), // Short Git commit hash
  branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(), // Current branch name
  buildDate: new Date().toISOString(), // Current timestamp
};

// Write the version info to a JSON file
fs.writeFileSync('./build-info.json', JSON.stringify(versionInfo, null, 2), 'utf8');
console.log('✅ Build info generated:');
console.log(versionInfo);
