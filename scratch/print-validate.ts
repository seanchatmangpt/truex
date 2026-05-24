import { ProjectCell } from "../packages/truex-core/src/project-wizard.gall.ts";

try {
  console.log("Creating ProjectCell with null byte...");
  new ProjectCell("/some/path\0");
  console.log("Success (unexpected!)");
} catch (e: any) {
  console.log("Caught expected error:", e.message);
}
