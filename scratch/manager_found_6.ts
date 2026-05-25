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
    if (line.includes('telco.gall.ts')) {
      const parsed = JSON.parse(line);
      
      // Look for tool calls that modified this file
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args.TargetFile && tc.args.TargetFile.includes('telco.gall.ts')) {
            const outPath = `/Users/sac/truex/scratch/telco_write_${index++}.ts`;
            fs.writeFileSync(outPath, tc.args.CodeContent);
            console.log(`Found write_to_file tool call: Wrote to ${outPath}`);
          }
          if (tc.name === 'replace_file_content' && tc.args.TargetFile && tc.args.TargetFile.includes('telco.gall.ts')) {
            const outPath = `/Users/sac/truex/scratch/telco_replace_${index++}.ts`;
            fs.writeFileSync(outPath, JSON.stringify(tc.args, null, 2));
            console.log(`Found replace_file_content tool call: Wrote metadata to ${outPath}`);
          }
        }
      }
      
      // Also check SYSTEM responses or MODEL responses containing content
      if (parsed.content && (parsed.content.includes('class TelcoLifecycleManager') || parsed.content.includes('class TelcoMembrane'))) {
        if (parsed.content.includes('Total Lines:')) {
          const outPath = `/Users/sac/truex/scratch/telco_view_${index++}.ts`;
          fs.writeFileSync(outPath, parsed.content);
          console.log(`Found VIEW_FILE: Wrote content to ${outPath}`);
        }
      }
    }
  }
}

run().catch(console.error);
