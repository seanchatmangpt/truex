const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';
const targetPath = '/Users/sac/truex/scratch/recovered-primitives.ts';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('case "unified-benchmarks":') || line.includes("case 'unified-benchmarks':") || line.includes('case "doctor-wizard-telco-unified":')) {
      if (line.includes('readline') || line.includes('extract-unified-benchmarks') || line.includes('recovered-primitives')) {
        continue;
      }
      const parsed = JSON.parse(line);
      if (parsed.type === 'GREP_SEARCH' || parsed.type === 'RUN_COMMAND') {
        continue;
      }
      console.log(`Found candidate at Step ${parsed.step_index}, Type: ${parsed.type}`);
      
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          const code = tc.args.CodeContent || tc.args.ReplacementContent || '';
          if (code.includes('case "unified-benchmarks":') || code.includes('case "doctor-wizard-telco-unified":')) {
            fs.writeFileSync(targetPath, code);
            console.log("Wrote code to", targetPath);
            return;
          }
        }
      }
      
      if (parsed.content && (parsed.content.includes('case "unified-benchmarks":') || parsed.content.includes('case "doctor-wizard-telco-unified":'))) {
        fs.writeFileSync(targetPath, parsed.content);
        console.log("Wrote content to", targetPath);
        return;
      }
    }
  }
  console.log("No candidate found.");
}

run().catch(console.error);
