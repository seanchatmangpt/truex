const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/ffa6df52-ae86-4b81-af5b-add1e356c496/.system_generated/logs/transcript_full.jsonl';
const targetPath = '/Users/sac/truex/scratch/recovered-membrane-db.ts';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('class TelcoMembrane')) {
      const parsed = JSON.parse(line);
      if (parsed.type === 'GREP_SEARCH' || parsed.type === 'RUN_COMMAND') {
        continue;
      }
      
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          const code = tc.args.CodeContent || tc.args.ReplacementContent || '';
          if (code.includes('class TelcoMembrane') && code.length > 500) {
            fs.writeFileSync(targetPath, code);
            console.log(`Wrote tool call code at step ${parsed.step_index} to ${targetPath}`);
            return;
          }
        }
      }
      
      if (parsed.content && parsed.content.includes('class TelcoMembrane') && parsed.content.length > 500) {
        fs.writeFileSync(targetPath, parsed.content);
        console.log(`Wrote content at step ${parsed.step_index} to ${targetPath}`);
        return;
      }
    }
  }
  console.log("No clean candidate found.");
}

run().catch(console.error);
