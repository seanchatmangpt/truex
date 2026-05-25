const fs = require('node:fs');
const path = require('node:path');

const dir = 'examples/reactive';
const files = fs.readdirSync(dir);

function processContent(content) {
  // We need to do regex replacements while avoiding breaking API calls like `createProxy`, `create*Interceptor`, `targetProcessId`

  // Let's do replacements with boundaries where appropriate
  let res = content;

  // 1. Proxyable -> Membrane
  res = res.replace(/\bProxyable\b/g, 'Membrane');
  res = res.replace(/\bproxyable\b/g, 'membrane');

  // 2. Intercept(or|ed|ing|s) -> Hook(ed|ing|s)
  // Be careful with create*Interceptor
  res = res.replace(/([cC]reate[A-Za-z0-9_]*)Interceptor/g, (match) => {
    return match; // skip API calls
  });
  // general replace
  res = res.replace(/\bInterceptor\b/g, 'Hook');
  res = res.replace(/\binterceptor\b/g, 'hook');
  res = res.replace(/\bIntercepted\b/g, 'Hooked');
  res = res.replace(/\bintercepted\b/g, 'hooked');
  res = res.replace(/\bIntercepting\b/g, 'Hooking');
  res = res.replace(/\bintercepting\b/g, 'hooking');
  res = res.replace(/\bIntercepts\b/g, 'Hooks');
  res = res.replace(/\bintercepts\b/g, 'hooks');
  res = res.replace(/\bIntercept\b/g, 'Hook');
  res = res.replace(/\bintercept\b/g, 'hook');

  // 3. Proxy -> Membrane / ConsequenceCell
  // Skip createProxy
  res = res.replace(/\bcreateProxy\b/g, '%%CREATE_PROXY%%');
  res = res.replace(/\bProxy\b/g, 'Membrane');
  res = res.replace(/\bproxy\b/g, 'membrane');
  res = res.replace(/%%CREATE_PROXY%%/g, 'createProxy');

  // 4. Target -> Substrate
  res = res.replace(/\btargetProcessId\b/g, '%%TARGET_PROCESS_ID%%');
  res = res.replace(/\bTarget\b/g, 'Substrate');
  res = res.replace(/\btarget\b/g, 'substrate');
  res = res.replace(/%%TARGET_PROCESS_ID%%/g, 'targetProcessId');

  // 5. Log -> Receipt / Mailbox
  // careful with console.log
  res = res.replace(/console\.log/g, '%%CONSOLE_LOG%%');
  res = res.replace(/\bLog\b/g, 'Receipt');
  res = res.replace(/\blog\b/g, 'receipt');
  res = res.replace(/%%CONSOLE_LOG%%/g, 'console.log');

  // 6. Request -> Attempt (skip request-reply)
  res = res.replace(/request-reply/g, '%%REQ_REP%%');
  res = res.replace(/RequestReply/g, '%%REQ_REPC%%');
  res = res.replace(/\bRequest\b/g, 'Attempt');
  res = res.replace(/\brequest\b/g, 'attempt');
  res = res.replace(/%%REQ_REP%%/g, 'request-reply');
  res = res.replace(/%%REQ_REPC%%/g, 'RequestReply');

  // 7. Accept -> Admit
  res = res.replace(/\bAccept\b/g, 'Admit');
  res = res.replace(/\baccept\b/g, 'admit');
  res = res.replace(/\bAccepted\b/g, 'Admitted');
  res = res.replace(/\baccepted\b/g, 'admitted');

  // 8. Pass -> Admit (careful with Pass/Passes)
  res = res.replace(/\bPass\b/g, 'Admit');
  res = res.replace(/\bpass\b/g, 'admit');
  res = res.replace(/\bPassed\b/g, 'Admitted');
  res = res.replace(/\bpassed\b/g, 'admitted');
  res = res.replace(/\bPasses\b/g, 'Admits');
  res = res.replace(/\bpasses\b/g, 'admits');

  // 9. Reject -> Refuse
  res = res.replace(/\bReject\b/g, 'Refuse');
  res = res.replace(/\breject\b/g, 'refuse');
  res = res.replace(/\bRejected\b/g, 'Refused');
  res = res.replace(/\brejected\b/g, 'refused');

  // 10. Fail -> Refuse
  res = res.replace(/\bFail\b/g, 'Refuse');
  res = res.replace(/\bfail\b/g, 'refuse');
  res = res.replace(/\bFailed\b/g, 'Refused');
  res = res.replace(/\bfailed\b/g, 'refused');
  res = res.replace(/\bFailure\b/g, 'Refusal');
  res = res.replace(/\bfailure\b/g, 'refusal');

  // 11. Transform -> Project
  res = res.replace(/\bTransform\b/g, 'Project');
  res = res.replace(/\btransform\b/g, 'project');
  res = res.replace(/\bTransformer\b/g, 'Projector');
  res = res.replace(/\btransformer\b/g, 'projector');
  res = res.replace(/\bTransformed\b/g, 'Projected');
  res = res.replace(/\btransformed\b/g, 'projected');
  
  // 12. Convert -> Project
  res = res.replace(/\bConvert\b/g, 'Project');
  res = res.replace(/\bconvert\b/g, 'project');
  res = res.replace(/\bConverted\b/g, 'Projected');
  res = res.replace(/\bconverted\b/g, 'projected');
  
  // 13. Balance -> Conserve
  res = res.replace(/\bBalance\b/g, 'Conserve');
  res = res.replace(/\bbalance\b/g, 'conserve');
  res = res.replace(/\bBalanced\b/g, 'Conserved');
  res = res.replace(/\bbalanced\b/g, 'conserved');

  // 14. Complete -> Conserve
  res = res.replace(/\bComplete\b/g, 'Conserve');
  res = res.replace(/\bcomplete\b/g, 'conserve');
  res = res.replace(/\bCompleted\b/g, 'Conserved');
  res = res.replace(/\bcompleted\b/g, 'conserved');

  // 15. Finish -> Promote
  res = res.replace(/\bFinish\b/g, 'Promote');
  res = res.replace(/\bfinish\b/g, 'promote');
  res = res.replace(/\bFinished\b/g, 'Promoted');
  res = res.replace(/\bfinished\b/g, 'promoted');

  // 16. Apply -> Promote
  res = res.replace(/\bApply\b/g, 'Promote');
  res = res.replace(/\bapply\b/g, 'promote');
  res = res.replace(/\bApplied\b/g, 'Promoted');
  res = res.replace(/\bapplied\b/g, 'promoted');

  // 17. Error -> Refusal
  res = res.replace(/console\.error/g, '%%CONSOLE_ERROR%%');
  res = res.replace(/\bError\b/g, 'Refusal');
  res = res.replace(/\berror\b/g, 'refusal');
  res = res.replace(/%%CONSOLE_ERROR%%/g, 'console.error');
  // keep new Error(...)
  res = res.replace(/new Refusal\(/g, 'new Error(');

  // 18. Object-Centric Process Evidence phrases (where log or proxy was used)
  // we did log->receipt, proxy->membrane
  // Ensure we don't break simple words that got mangled.
  return res;
}

for (const file of files) {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = processContent(content);
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${file}`);
    }
  }
}
