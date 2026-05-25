const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    if (line.includes('class TelcoLifecycleManager') || line.includes('TelcoLifecycleManager = class')) {
      const parsed = JSON.parse(line);
      console.log(`Found match at step ${parsed.step_index}, type: ${parsed.type}`);
      
      const outPath = `/Users/sac/truex/scratch/manager_found_${index++}.ts`;
      if (parsed.content) {
        fs.writeFileSync(outPath, parsed.content);
        console.log(`Wrote content to ${outPath}`);
      }
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if (tc.args && tc.args.CodeContent) {
            fs.writeFileSync(outPath, tc.args.CodeContent);
            console.log(`Wrote tool call CodeContent to ${outPath}`);
          }
          if (tc.args && tc.args.ReplacementContent) {
            fs.writeFileSync(outPath, tc.args.ReplacementContent);
            console.log(`Wrote tool call ReplacementContent to ${outPath}`);
          }
        }
      }
    }
  }
}

run().catch(console.error);
