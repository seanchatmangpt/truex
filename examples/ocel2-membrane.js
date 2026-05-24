import { OcelCollector, createOcelProxy } from '../src/ocel2/index.js'
import fs from 'node:fs'

async function run() {
  const ocel = new OcelCollector()

  // 1. Create a proxyable OCEL membrane for our object
  const churchTarget = {
    id: "church_001",
    name: "Zoe Church",
    services: [],
    latestSermon: undefined
  }
  const church = createOcelProxy(churchTarget, { objectType: "Church", objectId: "church_001" }, ocel)

  // 2. Perform a standard "Action" that is bound to a causality context
  ocel.event(
    {
      activity: "PublishSermon",
      actor: "person_pastor_001",
      objects: [
        { id: "sermon_123", type: "CreativeWork", qualifier: "published" },
        { id: "church_001", type: "Church", qualifier: "context" },
      ],
    },
    () => {
      // The developer writes normal JavaScript
      church.latestSermon = {
        id: "sermon_123",
        name: "The Good Shepherd",
        datePublished: "2026-05-23",
      }
    }
  )

  // 3. Perform a Speculative Action (Counterfactual Simulation)
  console.log("--- Starting Simulation ---")
  const simulation = await ocel.simulate(
    {
      activity: "MoveServiceTime",
      actor: "person_admin_001",
    },
    () => {
      // These changes happen ONLY to a shadow target and shadow OCEL!
      church.services.push("2026-05-24T11:00:00Z")
      church.name = "Zoe Church (Updated)"
    }
  )

  console.log("Is target mutated by simulation? ->", churchTarget.name === "Zoe Church" ? "No, safe!" : "Yes, leaked!")

  // 4. Examine Simulation Trajectory and Decide
  if (simulation.trajectory.valid) {
    console.log("Simulation was valid, committing to reality...")
    simulation.settle()
  } else {
    console.log("Simulation failed, discarding...", simulation.trajectory.result)
    simulation.discard()
  }

  console.log("Final Target Name:", churchTarget.name)

  // 5. Export Envelopes (Ready for Truex cryptographic receipts)
  const finalOcelJson = ocel.exportEnvelope("trace_demo", "span_membrane")
  
  fs.mkdirSync('./examples/out', { recursive: true })
  fs.writeFileSync('./examples/out/ocel2-membrane-export.json', JSON.stringify(finalOcelJson, undefined, 2))
  
  console.log("\nExported Truex OCEL 2.0 Receipt to ./examples/out/ocel2-membrane-export.json")
  console.log("Receipt Hash:", finalOcelJson.receiptHash)
}

await run()
