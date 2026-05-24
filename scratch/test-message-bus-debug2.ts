import { run } from '../examples/reactive/message-bus.js';
run().then(res => console.log("Done", res)).catch(e => console.log("Error", e));
