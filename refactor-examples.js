const fs = require('node:fs');
const path = require('node:path');

const files = [
  'audit-logger-example.js',
  'capability-security-example.js',
  'contract-context-example.js',
  'invariant-enforcement-example.js',
  'multitenancy-example.js',
  'ocel2-membrane.js',
  'replay-example.js',
  'sandbox-example.js',
  'simulation-example.js',
  'transaction-example.js',
  'truex-capture.js',
  'truex-verify.js',
  'virtual-context-example.js'
].map(f => path.join(__dirname, 'examples', f));

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace variable names
  content = content.replace(/([a-zA-Z0-9_]*)Proxy\b/g, '$1Membrane');
  content = content.replace(/\.proxy\./g, '.membrane.');
  content = content.replace(/([a-zA-Z0-9_]*)Log\b/g, '$1Receipts');
  
  // Exclude proxy API from .membrane
  content = content.replace(/\.membrane\./g, '.proxy.'); // wait, userProxy.proxy...
  
  // Actually, proxy property on Proxyable object is .proxy. It shouldn't be changed if it's the API.
  // The API is `const userProxy = createProxy(user); userProxy.proxy.name`
  // The user proxy is a `Proxyable` which has a `.proxy` getter. Does Truex rename `.proxy` to `.membrane`? The prompt says: "Do NOT break the imported API calls. Functions like createProxy, createAuditGetInterceptor... must remain intact. Only update the business logic representation, comments, variables, and string outputs to match Truex."
  // So `.proxy` getter might remain `.proxy`? No, if we change `userProxy.proxy` to `userMembrane.proxy` that is fine.
  
}
