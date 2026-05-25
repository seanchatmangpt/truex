import { ProjectCell } from "../packages/membrane/src/project-wizard.gall.ts";

try {
  console.log("Creating ProjectCell with null byte...");
  new ProjectCell("/some/path\0");
  console.log("Success (unexpected!)");
} catch (error_: any) {
  console.log("Caught expected error:", error_.message);
}
