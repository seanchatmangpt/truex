import { createProxy } from './src/proxy/create-proxy.js';
import { createSandboxContext, registerSandboxInterceptors } from './src/sandbox/sandbox-context.js';

const target = { foo: 42 };
const proxyInterface = createProxy(target);
const sandboxCtx = createSandboxContext(target, {
  restrictedKeys: new Set(['foo']),
});

registerSandboxInterceptors(proxyInterface, sandboxCtx);

let proto = null;
let error = null;
sandboxCtx.call(() => {
  try {
    proto = Object.getPrototypeOf(proxyInterface.proxy);
  } catch (e) {
    error = e;
  }
});

console.log('Proto:', proto);
if (error) {
  console.log('Error message:', error.message);
  console.log('Error stack:', error.stack);
}
