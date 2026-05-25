import { DoctorAgent } from "../agents/doctor/agent.js";

async function main() {
  try {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("wizard");
    console.log("Report:", report);
  } catch (error_: any) {
    console.error("Error Stack:", error_.stack);
  }
}

main();
