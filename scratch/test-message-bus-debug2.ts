import { run } from '../examples/reactive/message-bus.js';
run().then(res => console.log("Done", res)).catch(error_ => console.log("Error", error_));
