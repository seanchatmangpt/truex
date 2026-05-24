const originalTarget = { x: 5 };
const proxy = new Proxy(originalTarget, {
  set(t, prop, value, rx) {
    console.log("PROXY SET CALLED");
    t[prop] = value;
    return true;
  }
});

const speculativeState = { x: 5 };

console.log("Calling Reflect.set without receiver...");
const result = Reflect.set(speculativeState, 'x', 50); // No receiver argument!
console.log("Reflect.set result:", result);
console.log("originalTarget:", originalTarget);
console.log("speculativeState:", speculativeState);
