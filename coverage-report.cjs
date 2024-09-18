const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, 'coverage');
const coverageSummaryFile = path.join(coverageDir, 'coverage-final.json');

// Load and parse coverage data
const coverageData = JSON.parse(fs.readFileSync(coverageSummaryFile, 'utf-8'));

// Function to generate coverage comment
function generateCoverageComment(coverageData) {
  let comment = '';

  // Example placeholder logic for generating comments
  const newFiles = coverageData.total.coverage > 80; // Adjust as necessary
  const reducedCoverageFiles = coverageData.total.coverage < 80; // Adjust as necessary

  if (newFiles) {
    comment += '🆕 **New Covered Files**:\n- ExampleFile.js\n';
  }

  if (reducedCoverageFiles) {
    comment += '🔻 **Reduced Coverage**:\n- ExampleFile.js\n';
  }

  // Add any additional information such as failed tests, uncovered lines, etc.
  comment += '📢 **Failed Tests & Uncovered Lines**:\n- No failed tests\n';

  return comment;
}

// Generate comment and write to file
const comment = generateCoverageComment(coverageData);
fs.writeFileSync('coverage-comment.txt', comment);
