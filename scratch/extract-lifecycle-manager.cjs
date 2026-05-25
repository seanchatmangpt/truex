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
    if (line.includes('class TelcoLifecycleManager')) {
      const parsed = JSON.parse(line);
      console.log(`Step ${parsed.step_index}, type: ${parsed.type}, line length: ${line.length}`);
      
      // Check content
      const content = parsed.content || '';
      if (content.includes('class TelcoLifecycleManager') && content.length > 500) {
        const outPath = `/Users/sac/truex/scratch/recovered_manager_content_${index++}.ts`;
        fs.writeFileSync(outPath, content);
        console.log(`  Wrote content to ${outPath}`);
      }

      // Check tool_calls
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          const code = tc.args.CodeContent || tc.args.ReplacementContent || '';
          if (code.includes('class TelcoLifecycleManager') && code.length > 500) {
            const outPath = `/Users/sac/truex/scratch/recovered_manager_tool_${index++}.ts`;
            fs.writeFileSync(outPath, code);
            console.log(`  Wrote tool call code to ${outPath}`);
          }
        }
      }
    }
  }
}

run().catch(console.error);
