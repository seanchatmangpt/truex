
const fs = require('fs');
const path = require('path');

const reportsDir = 'docs/reports/project-status';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));

const tierNames = {
  0: 'Physics',
  1: 'Geometry',
  2: 'Membrane',
  3: 'Environment',
  4: 'Execution',
  5: 'Manufacturing',
  6: 'Projection'
};

const results = [];

files.forEach(file => {
  const filePath = path.join(reportsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fileResults = {
    file,
    brokenLinks: [],
    tierMismatches: [],
    gallClassification: null
  };

  // Check Gall Classification
  const gallMatch = content.match(/Gall Classification:?\s*([^\n]+)/i);
  if (gallMatch) {
    fileResults.gallClassification = gallMatch[1].trim();
  }

  // Check links
  const links = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const link of links) {
    const url = link[2];
    if (url.startsWith('./') || url.startsWith('../')) {
      const linkPath = path.resolve(reportsDir, url);
      if (!fs.existsSync(linkPath)) {
        fileResults.brokenLinks.push({ text: link[1], url });
      }
    }
  }

  // Check tier references
  const tierRefs = content.matchAll(/Tier\s*([0-6])/gi);
  for (const ref of tierRefs) {
    const tierNum = ref[1];
    const expectedName = tierNames[tierNum];
    // Look for the name nearby (within 30 chars)
    const index = ref.index;
    const context = content.substring(Math.max(0, index - 50), Math.min(content.length, index + 50));
    if (!context.toLowerCase().includes(expectedName.toLowerCase())) {
       // This is a weak check, but let's see what it finds
       fileResults.tierMismatches.push({ ref: ref[0], context: context.trim() });
    }
  }

  results.push(fileResults);
});

console.log(JSON.stringify(results, null, 2));
