import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SwarmActuator } from '../../src/manufacturing/swarm-actuator.js';
import { createDeterministicContext } from '../../src/context.js';
import type { DashboardMetrics } from '../../src/manufacturing/visual.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('SwarmActuator', () => {
  let actuator: SwarmActuator;
  const outputPath = path.join(process.cwd(), 'docs', 'v1', 'latest', 'actuations', 'swarm.json');

  beforeEach(() => {
    actuator = new SwarmActuator();
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch {
        // Ignore
      }
    }
  });

  afterEach(() => {
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch {
        // Ignore
      }
    }
  });

  it('should not propose anything if convergence rate is 100%', () => {
    const metrics: DashboardMetrics = {
      throughput: 10,
      lineStops: 0,
      convergenceRate: 1,
      uptime: 1000,
      totalOps: 100
    };

    const proposals = actuator.evaluate(metrics);
    expect(proposals).toHaveLength(0);
    expect(fs.existsSync(outputPath)).toBe(false);
  });

  it('should propose "Launch Auditor Subagent" if convergence rate is below 95%', () => {
    const metrics: DashboardMetrics = {
      throughput: 10,
      lineStops: 0,
      convergenceRate: 0.94,
      uptime: 1000,
      totalOps: 100
    };

    const proposals = actuator.evaluate(metrics);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('Launch Auditor Subagent');
    expect(proposals[0].reason).toContain('94.0%');
    
    expect(fs.existsSync(outputPath)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(proposals[0].id);
  });

  it('should persist and merge proposals across instances', () => {
     const metrics1: DashboardMetrics = {
      throughput: 10,
      lineStops: 0,
      convergenceRate: 0.9,
      uptime: 1000,
      totalOps: 100
    };
    
    actuator.evaluate(metrics1);
    
    // Create a new actuator instance with a different seed to ensure unique IDs
    const actuator2 = new SwarmActuator(createDeterministicContext(888));
    const metrics2: DashboardMetrics = {
      throughput: 10,
      lineStops: 0,
      convergenceRate: 0.85,
      uptime: 2000,
      totalOps: 200
    };
    
    actuator2.evaluate(metrics2);
    
    const saved = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(saved).toHaveLength(2);
    expect(saved[0].metadata.convergenceRate).toBe(0.9);
    expect(saved[1].metadata.convergenceRate).toBe(0.85);
  });
});
