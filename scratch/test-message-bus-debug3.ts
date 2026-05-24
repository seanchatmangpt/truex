import { run } from '../examples/reactive/message-bus.js';
import { dispatchMessage } from '../packages/truex-core/src/hook-otp.gall.js';
console.log("About to run...");
run().then(() => console.log("Run finished"));
