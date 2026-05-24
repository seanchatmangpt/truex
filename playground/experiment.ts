import { createProxy } from "../src/index.js";

// Mock OCEL event store
const ocelEvents: any[] = [];

// Create a target object that represents some application state
const orderState = {
  orderId: "ORD-123",
  status: "CREATED",
  totalAmount: 100,
  customerName: "Alice",
};

// Create a proxy using Proxyable
const { proxy, defineSetInterceptor } = createProxy(orderState);

// Define an interceptor that listens for any state mutation
defineSetInterceptor((target, prop, value) => {
  const oldValue = target[prop];
  
  // Only track if the value actually changed
  if (oldValue !== value) {
    // Generate an OCEL-like event automatically!
    ocelEvents.push({
      eventID: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      activity: `Update ${String(prop)}`,
      timestamp: new Date().toISOString(),
      vmap: {
        [String(prop)]: value,
        previousValue: oldValue
      },
      omap: [
        { id: target.orderId, type: "Order" }
      ]
    });
  }
  
  // Proceed with the actual mutation
  target[prop] = value;
  return true;
});

console.log("Initial state:", orderState);

console.log("\n--- Simulating App Mutations ---");
proxy.status = "APPROVED";
proxy.totalAmount = 120;
proxy.status = "SHIPPED";

console.log("\n--- Generated OCEL Events ---");
console.log(JSON.stringify(ocelEvents, null, 2));
