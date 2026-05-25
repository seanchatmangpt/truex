import { run } from '../examples/reactive/message-bus.js';
import { dispatchMessage } from '../packages/membrane/src/hook-otp.gall.js';
console.log("About to run...");
run().then(() => console.log("Run finished"));
