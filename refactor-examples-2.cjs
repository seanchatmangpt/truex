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

// Words that are part of the Truex API and MUST NOT be changed
const preservedAPIs = new Set([
  'createProxy', 'getProxy', 'registerAuditInterceptors', 'registerCapabilityInterceptors',
  'registerInvariantInterceptors', 'registerTransactionInterceptors', 'registerSimulationInterceptors',
  'registerSandboxInterceptors', 'registerMultitenancyInterceptors', 'registerContractInterceptors',
  'registerVirtualContextInterceptors', 'registerReplayInterceptors',
  'createAuditGetInterceptor', 'createInvariantSetInterceptor',
  'createCapabilityGetInterceptor', 'createCapabilitySetInterceptor', 'createCapabilityDeleteInterceptor', 'createCapabilityCallInterceptor',
  'createOcelProxy'
]);

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn('File not found:', file);
    continue;
  }
  let originalContent = fs.readFileSync(file, 'utf8');
  let content = originalContent;

  // 1. Rewrite specific API-related variable names ending in Proxy
  // We'll replace Proxy with Membrane in variable names like `userProxy`, `accountProxy`, etc.
  content = content.replace(/\b([a-z][a-zA-Z0-9_]*)Proxy\b/g, (match, p1) => {
    if (preservedAPIs.has(match)) return match;
    if (match === 'createProxy' || match === 'getProxy') return match;
    return p1 + 'Membrane';
  });
  
  // 2. Rewrite "Log" -> "Receipts" in variables like auditLog, basicLog
  content = content.replace(/\b([a-z][a-zA-Z0-9_]*)(?:Log|Logs)\b/g, (match, p1) => {
    if (['console', 'Math', 'getAuditLog', 'exportLog', 'getLog'].includes(match) || preservedAPIs.has(match)) return match;
    // Keep standard get/set API names if they exist, else convert
    return p1 + 'Receipts';
  });

  // 3. Process strings and comments for the vocabulary
  // We'll use a replacer that only affects string literals and comments
  const tokenReplacer = (text) => {
    let t = text;
    // Try / Request -> Attempt
    t = t.replace(/\bTry\b/g, 'Attempt');
    t = t.replace(/\bTrying\b/g, 'Attempting');
    t = t.replace(/\btrying\b/g, 'attempting');
    t = t.replace(/\btry to \b/g, 'attempt to ');
    t = t.replace(/\bRequest\b/g, 'Attempt');
    t = t.replace(/\brequest\b/g, 'attempt');
    
    // Accept / Pass -> Admit
    t = t.replace(/\bAccept\b/g, 'Admit');
    t = t.replace(/\bAccepted\b/g, 'Admitted');
    t = t.replace(/\baccept\b/g, 'admit');
    t = t.replace(/\baccepted\b/g, 'admitted');
    t = t.replace(/\bPass(?!es|ing|ed)\b/g, 'Admit'); // Avoid matching Passes, Passing? Let's be careful.
    t = t.replace(/\bPasses\b/g, 'Admits');
    t = t.replace(/\bPassed\b/g, 'Admitted');
    t = t.replace(/\bpass(?!es|ing|ed)\b/g, 'admit');
    t = t.replace(/\bpasses\b/g, 'admits');
    t = t.replace(/\bpassed\b/g, 'admitted');

    // Reject / Fail / Error / Failure -> Refuse / Refusal
    t = t.replace(/\bReject\b/g, 'Refuse');
    t = t.replace(/\bRejected\b/g, 'Refused');
    t = t.replace(/\breject\b/g, 'refuse');
    t = t.replace(/\brejected\b/g, 'refused');
    
    t = t.replace(/\bFail\b/g, 'Refuse');
    t = t.replace(/\bFailed\b/g, 'Refused');
    t = t.replace(/\bfail\b/g, 'refuse');
    t = t.replace(/\bfailed\b/g, 'refused');
    t = t.replace(/\bFails\b/g, 'Refuses');
    t = t.replace(/\bfails\b/g, 'refuses');

    t = t.replace(/\bFailure\b/g, 'Refusal');
    t = t.replace(/\bfailure\b/g, 'refusal');
    
    // Note: Error is a JS class. We only replace it in English text. 
    // We are inside string literals and comments here, so replacing Error is generally safe.
    t = t.replace(/\bError(?!s)\b/g, 'Refusal');
    t = t.replace(/\berror(?!s)\b/g, 'refusal');
    t = t.replace(/\bErrors\b/g, 'Refusals');
    t = t.replace(/\berrors\b/g, 'refusals');

    // Interceptor -> Hook
    t = t.replace(/\bInterceptor\b/g, 'Hook');
    t = t.replace(/\binterceptor\b/g, 'hook');
    t = t.replace(/\bInterceptors\b/g, 'Hooks');
    t = t.replace(/\binterceptors\b/g, 'hooks');

    // Proxy -> Membrane
    t = t.replace(/\bProxy\b/g, 'Membrane');
    t = t.replace(/\bproxy\b/g, 'membrane');
    t = t.replace(/\bProxies\b/g, 'Membranes');
    t = t.replace(/\bproxies\b/g, 'membranes');

    // Target -> Substrate
    t = t.replace(/\bTarget\b/g, 'Substrate');
    t = t.replace(/\btarget\b/g, 'substrate');

    // Log -> Receipt / Mailbox
    t = t.replace(/\bAudit Log\b/g, 'Audit Mailbox');
    t = t.replace(/\baudit log\b/g, 'audit mailbox');
    t = t.replace(/\bLog\b/g, 'Receipt');
    t = t.replace(/\blog\b/g, 'receipt');
    t = t.replace(/\bLogs\b/g, 'Receipts');
    t = t.replace(/\blogs\b/g, 'receipts');
    t = t.replace(/\bLogged\b/g, 'Receipted');
    t = t.replace(/\blogged\b/g, 'receipted');
    t = t.replace(/\bLogging\b/g, 'Receipting');
    t = t.replace(/\blogging\b/g, 'receipting');

    // Transform / Convert -> Project
    t = t.replace(/\bTransform\b/g, 'Project');
    t = t.replace(/\btransform\b/g, 'project');
    t = t.replace(/\bConvert\b/g, 'Project');
    t = t.replace(/\bconvert\b/g, 'project');

    // Balance / Complete -> Conserve
    // Exception: bank account balance. Do not replace "Balance" or "balance" if it refers to account money.
    // Let's only replace Complete -> Conserve
    t = t.replace(/\bComplete\b/g, 'Conserve');
    t = t.replace(/\bcomplete\b/g, 'conserve');
    t = t.replace(/\bCompleted\b/g, 'Conserved');
    t = t.replace(/\bcompleted\b/g, 'conserved');

    // Finish / Apply -> Promote
    t = t.replace(/\bFinish\b/g, 'Promote');
    t = t.replace(/\bfinish\b/g, 'promote');
    t = t.replace(/\bFinished\b/g, 'Promoted');
    t = t.replace(/\bfinished\b/g, 'promoted');
    t = t.replace(/\bApply\b/g, 'Promote');
    t = t.replace(/\bapply\b/g, 'promote');
    t = t.replace(/\bApplied\b/g, 'Promoted');
    t = t.replace(/\bapplied\b/g, 'promoted');

    return t;
  };

  // Replace inside strings and comments
  // regex for strings: /'[^']*'/g or /"[^"]*"/g or /`[^`]*`/g
  // regex for comments: /\/\/.*|\/\*[\s\S]*?\*\//g
  const combinedRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|`[^`\\]*(?:\\.[^`\\]*)*`)/g;
  
  content = content.replace(combinedRegex, (match) => {
    // Also protect API calls in strings, e.g., 'createProxy'
    let replaced = tokenReplacer(match);
    
    // We shouldn't change the exception messages that come from the system, but we don't know them. 
    // We can just apply the replacer.
    return replaced;
  });

  // Re-fix some specific API usages in code that might have been hit:
  // (Not inside strings/comments, but in variables)
  // Revert `.proxy.` to `.membrane.` or vice versa?
  // Wait, `userProxy.proxy` -> `userMembrane.proxy` because the object returned by `createProxy` has a `.proxy` property. We shouldn't change the `.proxy` property access.
  // We renamed `userProxy` to `userMembrane`.
  // Did we rename `userProxy.proxy` to `userMembrane.membrane`? 
  // No, because `.proxy` is not `*Proxy`. But wait, in strings, `proxy` -> `membrane`.
  // Wait, I only applied `tokenReplacer` to STRINGS and COMMENTS. Code is safe!
  
  // What if there is `console.log('Error prevented:', error.message)`?
  // It becomes `console.log('Refusal prevented:', refusal.message)`. Wait, `error` variable isn't changed by tokenReplacer, but string is.
  // Oh, `catch (error)` -> `error.message`. If we want to replace variable `error` with `refusal`, we can do it globally.
  content = content.replace(/\bcatch\s*\(\s*error\s*\)/g, 'catch (refusal)');
  content = content.replace(/\berror\.message\b/g, 'refusal.message');
  content = content.replace(/\berror_\.message\b/g, 'refusal_.message');
  content = content.replace(/\bcatch\s*\(\s*error_\s*\)/g, 'catch (refusal_)');
  
  // Specific Truex Object-Centric Process Evidence phrases:
  // (No explicit replacements, they just naturally flow from proxy->membrane, etc.)

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
}
