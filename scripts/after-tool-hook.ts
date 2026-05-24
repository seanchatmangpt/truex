import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function main() {
  // 1. Run observatory
  try {
    // console.log('🔭 Running Observatory...');
    execSync('npm run observatory', { stdio: 'inherit' });
  } catch {
    // console.error('Observatory failed, but continuing to actuation check.');
  }

  // 2. Check for Actuation Proposals
  const actuationPath = path.join(process.cwd(), 'docs', 'v1', 'latest', 'actuations', 'swarm.json');
  
  if (fs.existsSync(actuationPath)) {
    try {
      const content = fs.readFileSync(actuationPath, 'utf8');
      const proposals = JSON.parse(content);
      
      // Filter for high-priority proposals (e.g., those containing "Line Stop" or "Launch Auditor")
      // In this environment, we'll consider all pending proposals as potentially high-priority
      // if they haven't been resolved, but we'll highlight "Line Stop" specifically.
      
      const highPriority = proposals.filter((p: any) => 
        p.type.toLowerCase().includes('line stop') || 
        p.type.toLowerCase().includes('auditor') ||
        p.reason.toLowerCase().includes('violation') ||
        p.confidence > 0.8
      );

      if (highPriority.length > 0) {
        console.log('\n⚠️  [TRUEX ACTUATION ALERT]');
        console.log('High-priority actuation proposals are pending evaluation:');
        highPriority.forEach((p: any) => {
          console.log(`- [${p.type}] ${p.reason} (Confidence: ${p.confidence})`);
        });
        console.log('Please review and act upon these proposals to maintain system integrity.\n');
      }
    } catch {
      // console.error('Failed to read actuation proposals:', error);
    }
  }
}

main().catch(() => process.exit(1));
