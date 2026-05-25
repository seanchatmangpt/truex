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
    if (line.includes('export class TelcoLifecycleManager') && (line.includes('write_to_file') || line.includes('replace_file_content') || line.includes('VIEW_FILE'))) {
      const parsed = JSON.parse(line);
      console.log("Found entry with type:", parsed.type);
      if (parsed.content) {
        fs.writeFileSync(targetPath, parsed.content);
        console.log("Wrote entry content to", targetPath);
        return;
      }
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if (tc.args && tc.args.CodeContent) {
            fs.writeFileSync(targetPath, tc.args.CodeContent);
            console.log("Wrote tool call CodeContent to", targetPath);
            return;
          }
          if (tc.args && tc.args.ReplacementContent) {
            fs.writeFileSync(targetPath, tc.args.ReplacementContent);
            console.log("Wrote tool call ReplacementContent to", targetPath);
            return;
          }
        }
      }
    }
  }
  console.log("Could not find entries with export class TelcoLifecycleManager");
}

run().catch(console.error);
