import { describe, expect, it } from "vitest";
import { EntropyGenerator } from "../src/lib/entropy.js";
import { EntropyAgent } from "../agents/entropy/agent.js";
import { hash } from "../packages/truex-core/src/index.js";

describe("Entropy Agent - Determinism and Variability", () => {
  it("produces identical output for the same seed", () => {
    const generator1 = new EntropyGenerator(12345);
    const generator2 = new EntropyGenerator(12345);

    const member1 = generator1.generateMember();
    const member2 = generator2.generateMember();

    expect(member1).toEqual(member2);
    
    const delta1 = generator1.objectToGraphDelta("Member", member1);
    const delta2 = generator2.objectToGraphDelta("Member", member2);
    
    expect(delta1).toEqual(delta2);
  });

  it("produces different output for different seeds", () => {
    const generator1 = new EntropyGenerator(12345);
    const generator2 = new EntropyGenerator(67890);

    const member1 = generator1.generateMember();
    const member2 = generator2.generateMember();

    expect(member1).not.toEqual(member2);
  });

  it("generates valid Church-like operational objects", () => {
    const generator = new EntropyGenerator(1);
    
    const member = generator.generateMember();
    expect(member.id).toContain("member:");
    expect(member.name).toBeDefined();
    expect(member.email).toContain("@");

    const volunteer = generator.generateVolunteer(member.id);
    expect(volunteer.id).toContain("volunteer:");
    expect(volunteer.memberId).toBe(member.id);

    const room = generator.generateRoom();
    expect(room.id).toContain("room:");
    expect(room.capacity).toBeGreaterThanOrEqual(10);

    const event = generator.generateEvent(room.id, member.id);
    expect(event.id).toContain("event:");
    expect(event.roomId).toBe(room.id);
    expect(event.organizerId).toBe(member.id);
  });

  it("converts objects to GraphDelta correctly", () => {
    const generator = new EntropyGenerator(1);
    const member = generator.generateMember();
    const delta = generator.objectToGraphDelta("Member", member);

    expect(delta.id).toContain("delta:");
    expect(delta.adds.some(q => q.predicate === "rdf:type" && q.object === "church:Member")).toBe(true);
    expect(delta.adds.some(q => q.predicate === "church:name" && q.object === member.name)).toBe(true);
    expect(delta.adds.some(q => q.predicate === "church:email" && q.object === member.email)).toBe(true);
  });

  it("Agent produces deterministic benchmark reports", () => {
    const agent = new EntropyAgent();
    const benchmark1 = agent.generateBenchmark(42, 5);
    const benchmark2 = agent.generateBenchmark(42, 5);

    const hash1 = hash(benchmark1.data.map((d: any) => d.delta));
    const hash2 = hash(benchmark2.data.map((d: any) => d.delta));

    expect(hash1).toBe(hash2);

    const benchmark3 = agent.generateBenchmark(43, 5);
    const hash3 = hash(benchmark3.data.map((d: any) => d.delta));

    expect(hash1).not.toBe(hash3);
  });
});
