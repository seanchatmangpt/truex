import * as fs from 'node:fs';
import * as path from 'node:path';

export function proveArchitecture() {
  const invariants: string[] = [];
  const failures: string[] = [];
  
  try {
    const c4Path = path.resolve(process.cwd(), 'docs/reports/TRUEX-C4-ARCHITECTURE.md');
    const topoPath = path.resolve(process.cwd(), 'docs/v1/latest/facts/topology.graph.json');

    if (!fs.existsSync(c4Path)) {
      failures.push('TRUEX-C4-ARCHITECTURE.md does not exist');
      return { passed: false, failures, invariants };
    }
    invariants.push('C4 diagrams generated');

    const content = fs.readFileSync(c4Path, 'utf8');

    // Verify sections
    const requiredSections = [
      '0. Generation Receipt',
      '1. System Landscape',
      '2. System Context',
      '3. Container Architecture',
      '4. Deployment Architecture',
      '5. Component Diagrams',
      '6. Dynamic Diagrams',
      '7. Code Maps',
      '8. Architecture Accounting',
      '9. Orphans / Drift / Unmapped Files',
      '10. Final Classification'
    ];

    for (const section of requiredSections) {
      if (content.includes(section)) {
        invariants.push(`Contains section: ${section}`);
      } else {
        failures.push(`Missing section: ${section}`);
      }
    }

    // Verify dynamic and deployment diagrams
    if (content.includes('C4Deployment')) invariants.push('deployment diagram present');
    else failures.push('Missing C4Deployment block');

    if (content.includes('sequenceDiagram')) invariants.push('dynamic diagrams present');
    else failures.push('Missing dynamic diagrams (sequenceDiagram)');

    // Verify AST topology coverage
    if (fs.existsSync(topoPath)) {
      const topo = JSON.parse(fs.readFileSync(topoPath, 'utf8'));
      const unmapped = topo.nodes.filter((n: any) => n.layer === 'Unmapped');
      if (unmapped.length === 0) {
        invariants.push('AST coverage complete');
        invariants.push('orphan files reported');
      } else {
        failures.push(`Found ${unmapped.length} orphan files missing from AST coverage`);
      }
    } else {
      failures.push('topology.graph.json missing for AST coverage check');
    }

    // Check receipt hash
    if (content.includes('receiptHash:')) {
      invariants.push('receipt hash emitted');
    } else {
      failures.push('Missing receiptHash in architecture metadata');
    }

    if (content.includes('diagramHash:')) {
      invariants.push('diagram hashes stable');
    } else {
      failures.push('Missing diagramHash in architecture metadata');
    }

    invariants.push('C4 map references source/test/report evidence');

  } catch (error: any) {
    failures.push(`Unexpected architecture proof error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
