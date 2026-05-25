const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/sac/.gemini/antigravity-cli/brain/7544b8a9-0888-4407-97e8-19ac58ccfd5a/.system_generated/logs/transcript_full.jsonl';
const targetPath = '/Users/sac/truex/scratch/recovered-primitives-large.ts';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let foundCount = 0;
  fs.writeFileSync(targetPath, ''); // clear it first

  for await (const line of rl) {
    if (line.includes('verifyTelemetryLineage') || line.includes('runUnifiedIntegrationFlow') || line.includes('unified-benchmarks') || line.includes('doctor-wizard-telco-unified')) {
      if (line.includes('readline') || line.includes('search-primitives') || line.includes('extract-unified-benchmarks') || line.includes('recovered-primitives-large.ts')) {
        continue;
      }
      const parsed = JSON.parse(line);
      console.log(`Found candidate at Step ${parsed.step_index}, Type: ${parsed.type}`);
      
      let code = '';
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          code += `\n--- Tool Call in Step ${parsed.step_index} ---\n` + (tc.args.CodeContent || tc.args.ReplacementContent || JSON.stringify(tc.args)) + '\n';
        }
      }
      if (parsed.content) {
        code += `\n--- Content in Step ${parsed.step_index} ---\n` + parsed.content + '\n';
      }
      
      if (code) {
        fs.appendFileSync(targetPath, code);
        foundCount++;
      }
    }
  }
  console.log(`Finished search. Found ${foundCount} matches.`);
}

run().catch(console.error);

