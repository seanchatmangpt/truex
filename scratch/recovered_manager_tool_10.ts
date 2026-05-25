const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';
const targetPath = '/Users/sac/truex/scratch/recovered-lifecycle-manager.ts';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('class TelcoLifecycleManager')) {
      const parsed = JSON.parse(line);
      
      // Let's check parsed.tool_calls
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          const code = tc.args.CodeContent || tc.args.ReplacementContent || '';
          if (code.includes('class TelcoLifecycleManager') && code.length > 200) {
            fs.writeFileSync(targetPath, code);
            console.log("Wrote tool call code to", targetPath);
            return;
          }
        }
      }

      // Check content
      const content = parsed.content || '';
      if (content.includes('class TelcoLifecycleManager') && content.length > 200) {
        // Strip line numbers if present
        const cleaned = content.split('\n')
          .map(l => {
            const match = l.match(/^\d+:\s?(.*)/);
            return match ? match[1] : l;
          })
          .join('\n');
        fs.writeFileSync(targetPath, cleaned);
        console.log("Wrote parsed content to", targetPath);
        return;
      }
    }
  }
  console.log("No large blocks found.");
}

run().catch(console.error);
