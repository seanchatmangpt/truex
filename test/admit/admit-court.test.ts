/**
 * Chicago court: Truex product admit for W3C SHACL 1.2 `shui:`.
 *
 * ECOSYSTEM-SPEC-27.1.1 Gate 1 / Truex fence alignment — AAA, no mocks.
 * Falsifier: `pnpm exec vitest run test/admit/admit-court.test.ts`
 * CLI: `pnpm exec tsx src/admit/admit-court.ts` → exit 0
 *
 * Claims proven here:
 * 1. `shui:` binds to `http://www.w3.org/ns/shacl-ui/` (slash IRI).
 * 2. Public `shui:` prefixes ADMIT; load of shui: shape graph → exit 0.
 * 3. Private `truex:` remains REFUSED_PRIVATE.
 * 4. Unknown Turtle prefixes are REFUSED_UNKNOWN (not silently admitted).
 */

import { describe, expect, it } from "vitest";
import {
  ADMITTED_TURTLE_PREFIXES,
  SHUI_NAMESPACE,
  SHUI_PREFIX,
  SHUI_SHAPE_GRAPH,
  isAdmittedTurtlePrefix,
  isRefusedPrivatePrefix,
  isShuiIri,
  loadAdmittedShapeGraph,
  runAdmitCourt,
  turtlePrefixStanding,
} from "../../src/admit/admit-court.js";

describe("admit-court / TurtlePrefixStanding", () => {
  it("shui namespace is W3C shacl-ui slash IRI", () => {
    // Arrange
    const expected = "http://www.w3.org/ns/shacl-ui/";

    // Act / Assert
    expect(SHUI_NAMESPACE).toBe(expected);
    expect(SHUI_PREFIX).toBe("shui");
    expect(SHUI_NAMESPACE.endsWith("#")).toBe(false);
  });

  it("public shui: prefixes admit; private truex: refused", () => {
    // Arrange / Act
    const shuiStanding = turtlePrefixStanding("shui");
    const truexStanding = turtlePrefixStanding("truex");

    // Assert — admission
    expect(shuiStanding).toBe("ADMITTED");
    expect(isAdmittedTurtlePrefix("shui")).toBe(true);
    expect(ADMITTED_TURTLE_PREFIXES.includes("shui")).toBe(true);
    expect(isAdmittedTurtlePrefix("sh")).toBe(true);

    // Assert — private tokens stay refused
    expect(truexStanding).toBe("REFUSED_PRIVATE");
    for (const banned of ["truex", "gall", "gg", "kh", "pcst"] as const) {
      expect(isRefusedPrivatePrefix(banned)).toBe(true);
      expect(isAdmittedTurtlePrefix(banned)).toBe(false);
      expect(turtlePrefixStanding(banned)).toBe("REFUSED_PRIVATE");
    }
  });

  it("unknown turtle prefix is REFUSED_UNKNOWN", () => {
    // Arrange
    const unknowns = ["acme", "dash", "foobarbaz", "privateish"];

    // Act / Assert
    for (const prefix of unknowns) {
      expect(turtlePrefixStanding(prefix)).toBe("REFUSED_UNKNOWN");
      expect(isAdmittedTurtlePrefix(prefix)).toBe(false);
      expect(isRefusedPrivatePrefix(prefix)).toBe(false);
    }
  });
});

describe("admit-court / shui shape graph load", () => {
  it("loads shui:-prefixed shape graph and exits 0", () => {
    // Arrange / Act
    const result = runAdmitCourt(SHUI_SHAPE_GRAPH);

    // Assert
    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.standing).toBe("ADMITTED");
    expect(result.prefixes.some((p) => p.prefix === "shui")).toBe(true);
    expect(
      result.prefixes.find((p) => p.prefix === "shui")?.iri,
    ).toBe(SHUI_NAMESPACE);

    const shuiPredicates = result.quads.filter((q) =>
      isShuiIri(q.predicate),
    );
    expect(shuiPredicates.length).toBeGreaterThan(0);
    expect(
      shuiPredicates.some((q) => q.predicate === `${SHUI_NAMESPACE}editor`),
    ).toBe(true);
    expect(
      shuiPredicates.some((q) => q.predicate === `${SHUI_NAMESPACE}parentGroup`),
    ).toBe(true);
  });

  it("refuses private truex: shape graph with REFUSED_PRIVATE", () => {
    // Arrange
    const turtle = `@prefix truex: <http://truex.local/ns#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
truex:Thing a truex:Type .
`;

    // Act
    const result = loadAdmittedShapeGraph(turtle);

    // Assert
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.standing).toBe("REFUSED_PRIVATE");
    expect(result.reason).toMatch(/truex/);
  });

  it("refuses unknown prefix shape graph with REFUSED_UNKNOWN", () => {
    // Arrange
    const turtle = `@prefix acme: <http://acme.example/ns#> .
acme:Thing a acme:Type .
`;

    // Act
    const result = loadAdmittedShapeGraph(turtle);

    // Assert
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.standing).toBe("REFUSED_UNKNOWN");
    expect(result.reason).toMatch(/acme/);
  });
});
