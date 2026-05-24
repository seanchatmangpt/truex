import { proveWizard } from "../skills/wizard/proofs.js";

try {
  const result = proveWizard();
  console.log("Result:", result);
} catch (error: any) {
  console.error("Error Stack:", error.stack);
}
