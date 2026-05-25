
import { createProxy } from './src/proxy/create-proxy.js';
import { OcelCollector, createOcelProxy } from './src/ocel2/index.js';
import { createTenantContext } from './src/multitenancy/tenant-context.js';
import { createSimulationContext, registerSimulationInterceptors } from './src/simulation/simulation-context.js';
import { createAuditContext, registerAuditInterceptors } from './src/observability/audit-logger.js';
import { writeHeapSnapshot } from 'node:v8';

async function runAudit() {
  console.log('Starting Memory Stability Audit...');

  const collector = new OcelCollector();
  const target = { a: 1, b: 2 };
  
  console.log('Phase 1: OcelCollector and Proxies leak test');
  for (let i = 0; i < 1000; i++) {
    const obj = { id: i };
    const proxy = createOcelProxy(obj, { id: `obj_${i}`, type: 'Test' }, collector);
    // proxy is dropped here, but collector keeps it!
  }
  
  if (global.gc) {
    global.gc();
  }
  console.log(`OcelCollector proxyInterfaces size: ${collector.proxyInterfaces.length}`);

  console.log('Phase 2: TenantContext disposal test');
  const tenants = [];
  for (let i = 0; i < 1000; i++) {
    const tenant = createTenantContext(target, `tenant_${i}`);
    tenants.push(tenant);
  }
  for (const tenant of tenants) {
    tenant.dispose();
  }
  if (global.gc) {
    global.gc();
  }
  // Check TrackableWeakMap size if possible or just rely on heap dump

  console.log('Phase 3: SimulationContext abortion leak test');
  const sim = createSimulationContext(target);
  for (let i = 0; i < 1000; i++) {
    sim.speculate(() => {
      sim.checkpoint();
      target.a = i;
    });
    sim.abort();
  }
  if (global.gc) {
    global.gc();
  }

  console.log('Phase 4: AuditLogger spillover leak test');
  const audit = createAuditContext(target, { 
    maxLogEntries: 10, 
    overflowBehavior: 'sqlite',
    sqlitePath: ':memory:'
  });
  const proxyInterface = createProxy(target);
  registerAuditInterceptors(proxyInterface, audit);
  const auditProxy = proxyInterface.proxy;

  for (let i = 0; i < 1000; i++) {
    auditProxy.a = i;
  }
  
  console.log('Audit complete. Check for leaks.');
  
  // In a real 5-minute loop we would do more, but this should show the issues.
}

runAudit().catch(console.error);
