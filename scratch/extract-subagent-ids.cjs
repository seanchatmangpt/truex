const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('invoke_subagent')) {
      const parsed = JSON.parse(line);
      console.log(`Step ${parsed.step_index}:`);
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if (tc.name === 'invoke_subagent') {
            console.log(JSON.stringify(tc.args, null, 2));
          }
        }
      }
    }
  }
}

run().catch(console.error);
