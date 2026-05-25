const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('packages/membrane/src/telco.gall.ts') && line.includes('Total Lines: 446')) {
      console.log("Found line matching!");
      const parsed = JSON.parse(line);
      console.log(parsed.content);
    }
  }
}

run().catch(console.error);
