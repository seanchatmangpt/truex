/**
 * @module EntropyAgent
 * @description
 * Gall Classification: Gall S-1 / S0 (Deterministic Admissible Entropy)
 * Purpose: The Entropy Agent implements the TRUEX Entropy Law by providing
 * deterministic variability (seeded randomness) for stress testing. It proves that
 * the operational system survives lawful variability without divergence.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { EntropyGenerator } from '../../src/lib/entropy.js';
import { hash } from '../../packages/truex-core/src/index.js';

/**
 * Agent responsible for generating deterministic entropy for reliable test replay and benchmarks.
 */
export class EntropyAgent {
  /**
   * Generates a deterministic benchmark artifact based on a numerical seed.
   *
   * @param seed - The deterministic seed for the entropy generator.
   * @param count - The number of members to generate, scaling other entities accordingly.
   * @returns An object containing the benchmarking results, including metrics and delta data.
   */
  generateBenchmark(seed: number, count: number = 10): any {
    console.log(`\n🎲 Entropy Agent manufacturing deterministic variability (seed: ${seed})...`);
    const generator = new EntropyGenerator(seed);
    const results = {
      seed,
      timestamp: new Date(0).toISOString(), // Deterministic timestamp as per rule
      metrics: {
        objectsGenerated: 0,
        deltasProduced: 0
      },
      data: [] as any[]
    };

    const members = [];
    for (let i = 0; i < count; i++) {
      const member = generator.generateMember();
      const delta = generator.objectToGraphDelta('Member', member);
      members.push(member);
      results.data.push({ type: 'Member', object: member, delta });
      results.metrics.objectsGenerated++;
      results.metrics.deltasProduced++;
    }

    const rooms = [];
    for (let i = 0; i < Math.ceil(count / 5); i++) {
      const room = generator.generateRoom();
      const delta = generator.objectToGraphDelta('Room', room);
      rooms.push(room);
      results.data.push({ type: 'Room', object: room, delta });
      results.metrics.objectsGenerated++;
      results.metrics.deltasProduced++;
    }

    for (let i = 0; i < count; i++) {
      const member = members[i];
      if (generator['fakerInstance'].number.int({ min: 0, max: 100 }) > 50) {
        const volunteer = generator.generateVolunteer(member.id);
        const delta = generator.objectToGraphDelta('Volunteer', volunteer);
        results.data.push({ type: 'Volunteer', object: volunteer, delta });
        results.metrics.objectsGenerated++;
        results.metrics.deltasProduced++;
      }
    }

    for (let i = 0; i < count; i++) {
      const room = rooms[generator['fakerInstance'].number.int({ min: 0, max: rooms.length - 1 })];
      const member = members[generator['fakerInstance'].number.int({ min: 0, max: members.length - 1 })];
      const event = generator.generateEvent(room.id, member.id);
      const delta = generator.objectToGraphDelta('Event', event);
      results.data.push({ type: 'Event', object: event, delta });
      results.metrics.objectsGenerated++;
      results.metrics.deltasProduced++;
    }

    const reportContent = this.formatMarkdownReport(results);
    this.writeReport(reportContent);

    return results;
  }

  private formatMarkdownReport(results: any): string {
    const inputHash = hash(results.data.map((d: any) => d.delta));
    
    let md = `# Entropy Agent Benchmark Report\n\n`;
    md += `## Configuration\n`;
    md += `- **Seed:** ${results.seed}\n`;
    md += `- **Deterministic Timestamp:** ${results.timestamp}\n`;
    md += `- **Input Hash (Deltas):** \`${inputHash}\`\n\n`;
    
    md += `## Metrics\n`;
    md += `- **Objects Generated:** ${results.metrics.objectsGenerated}\n`;
    md += `- **GraphDeltas Produced:** ${results.metrics.deltasProduced}\n\n`;
    
    md += `## Sample Data (First 5 Deltas)\n`;
    results.data.slice(0, 5).forEach((item: any, idx: number) => {
      md += `### Delta ${idx + 1}: ${item.type}\n`;
      md += `\`\`\`json\n${JSON.stringify(item.delta, null, 2)}\n\`\`\`\n\n`;
    });
    
    md += `## Determinism Proof\n`;
    md += `This report is generated using a fixed seed. Any execution with seed \`${results.seed}\` will produce the exact same Input Hash: \`${inputHash}\`.\n`;
    
    return md;
  }

  private writeReport(content: string): void {
    const reportPath = path.resolve(process.cwd(), 'docs', 'reports', 'benchmark-entropy.md');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, content);
    console.log(`📄 Entropy Report written to ${reportPath}`);
  }
}
