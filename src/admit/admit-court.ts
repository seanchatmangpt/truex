/**
 * Chicago admit-court — Truex product admission for W3C `shui:`.
 *
 * ECOSYSTEM-SPEC-27.1.1 Gate 1 (sibling row to ggen fence):
 * - Public `shui:` → http://www.w3.org/ns/shacl-ui/ loads and exits 0
 * - Private `truex:` / `gall:` / … remain REFUSED_PRIVATE
 * - Unknown Turtle prefixes remain REFUSED_UNKNOWN
 *
 * Fence reference (ggen): TurtlePrefixStanding ADMITTED / REFUSED_PRIVATE /
 * REFUSED_UNKNOWN. This module is the Truex-side product court, not the ggen
 * allowlist crate.
 */

/** W3C SHACL 1.2 UI namespace (slash IRI). */
export const SHUI_NAMESPACE = "http://www.w3.org/ns/shacl-ui/";
export const SHUI_PREFIX = "shui";

/** Public vocabulary prefixes admitted in Turtle `@prefix` declarations. */
export const ADMITTED_TURTLE_PREFIXES = [
  "rdf",
  "rdfs",
  "owl",
  "xsd",
  "prov",
  "dcat",
  "dcterms",
  "dc",
  "skos",
  "sh",
  "shui",
  "time",
  "spdx",
  "ocel",
  "schema",
  "mcp",
  "ex",
  "mp",
  "vann",
  "foaf",
] as const;

/** Project-private / banned prefix tokens (must remain refused). */
export const REFUSED_PRIVATE_PREFIXES = [
  "gall",
  "ggen",
  "gg",
  "kh",
  "pcst",
  "truex",
  "doc",
  "doctest",
] as const;

/** Typed fence standing for a Turtle `@prefix` name. */
export type TurtlePrefixStanding =
  | "ADMITTED"
  | "REFUSED_PRIVATE"
  | "REFUSED_UNKNOWN";

export function isAdmittedTurtlePrefix(prefix: string): boolean {
  return (ADMITTED_TURTLE_PREFIXES as readonly string[]).includes(prefix);
}

export function isRefusedPrivatePrefix(prefix: string): boolean {
  return (REFUSED_PRIVATE_PREFIXES as readonly string[]).includes(prefix);
}

/** Classify a Turtle prefix under the public / private / unknown fence. */
export function turtlePrefixStanding(prefix: string): TurtlePrefixStanding {
  if (isAdmittedTurtlePrefix(prefix)) return "ADMITTED";
  if (isRefusedPrivatePrefix(prefix)) return "REFUSED_PRIVATE";
  return "REFUSED_UNKNOWN";
}

export function isShuiIri(iri: string): boolean {
  return iri.startsWith(SHUI_NAMESPACE);
}

export interface TurtlePrefixBinding {
  prefix: string;
  iri: string;
  standing: TurtlePrefixStanding;
}

export interface TurtleQuad {
  subject: string;
  predicate: string;
  object: string;
}

export interface AdmitCourtResult {
  ok: boolean;
  exitCode: number;
  standing: TurtlePrefixStanding;
  prefixes: TurtlePrefixBinding[];
  quads: TurtleQuad[];
  reason?: string;
}

const PREFIX_RE =
  /@prefix\s+([A-Za-z_][\w-]*)\s*:\s*<([^>]+)>\s*\./g;

function expandPrefixed(term: string, map: Map<string, string>): string {
  const t = term.trim();
  if (t.startsWith("<") && t.endsWith(">")) return t.slice(1, -1);
  if (t.startsWith('"')) return t;
  const colon = t.indexOf(":");
  if (colon <= 0) return t;
  const prefix = t.slice(0, colon);
  const local = t.slice(colon + 1);
  const base = map.get(prefix);
  if (!base) return t;
  return `${base}${local}`;
}

/**
 * Parse Turtle `@prefix` bindings from a shape graph document.
 * Minimal parser — Chicago court surface, not a full RDF stack.
 */
export function parseTurtlePrefixes(turtle: string): TurtlePrefixBinding[] {
  const bindings: TurtlePrefixBinding[] = [];
  PREFIX_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PREFIX_RE.exec(turtle)) !== null) {
    const prefix = match[1]!;
    const iri = match[2]!;
    bindings.push({
      prefix,
      iri,
      standing: turtlePrefixStanding(prefix),
    });
  }
  return bindings;
}

/**
 * Extract simple `s p o .` and `;`-chained property statements into quads.
 * Sufficient for Gate 1 shape-graph admission proofs.
 */
export function parseTurtleQuads(
  turtle: string,
  map: Map<string, string>,
): TurtleQuad[] {
  const body = turtle.replace(PREFIX_RE, "").trim();
  const quads: TurtleQuad[] = [];
  const statements = body.split(/\.\s*(?=[A-Za-z_<\s])/).map((s) => s.trim()).filter(Boolean);

  for (const statement of statements) {
    const chunks = statement.split(/\s*;\s*/).map((c) => c.trim()).filter(Boolean);
    if (chunks.length === 0) continue;

    const head = chunks[0]!.split(/\s+/).filter(Boolean);
    if (head.length < 3) continue;

    const subject = expandPrefixed(head[0]!, map);
    let predicate = expandPrefixed(head[1]!, map);
    let object = expandPrefixed(head.slice(2).join(" "), map);
    quads.push({ subject, predicate, object });

    for (let i = 1; i < chunks.length; i++) {
      const parts = chunks[i]!.split(/\s+/).filter(Boolean);
      if (parts.length < 2) continue;
      predicate = expandPrefixed(parts[0]!, map);
      object = expandPrefixed(parts.slice(1).join(" "), map);
      quads.push({ subject, predicate, object });
    }
  }

  return quads;
}

/**
 * Load a Turtle shape graph under the Truex admit fence.
 *
 * - All declared prefixes must be ADMITTED (else refuse with non-zero exit).
 * - `shui:` must bind to the W3C SHACL UI slash namespace when present.
 * - Successful load of an admitted `shui:`-bearing graph → exit 0.
 */
export function loadAdmittedShapeGraph(turtle: string): AdmitCourtResult {
  const prefixes = parseTurtlePrefixes(turtle);
  if (prefixes.length === 0) {
    return {
      ok: false,
      exitCode: 2,
      standing: "REFUSED_UNKNOWN",
      prefixes,
      quads: [],
      reason: "no @prefix declarations in shape graph",
    };
  }

  for (const binding of prefixes) {
    if (binding.standing !== "ADMITTED") {
      return {
        ok: false,
        exitCode: 1,
        standing: binding.standing,
        prefixes,
        quads: [],
        reason: `prefix ${binding.prefix}: refused (${binding.standing})`,
      };
    }
    if (binding.prefix === SHUI_PREFIX && binding.iri !== SHUI_NAMESPACE) {
      return {
        ok: false,
        exitCode: 1,
        standing: "REFUSED_UNKNOWN",
        prefixes,
        quads: [],
        reason: `shui: must bind to ${SHUI_NAMESPACE}, got ${binding.iri}`,
      };
    }
  }

  const map = new Map(prefixes.map((p) => [p.prefix, p.iri]));
  const quads = parseTurtleQuads(turtle, map);
  const hasShui = prefixes.some((p) => p.prefix === SHUI_PREFIX);

  return {
    ok: true,
    exitCode: 0,
    standing: "ADMITTED",
    prefixes,
    quads,
    reason: hasShui
      ? "shui:-prefixed shape graph admitted"
      : "admitted public prefixes (no shui: in this graph)",
  };
}

/** Canonical minimal SHACL UI shape graph for Gate 1 product admit. */
export const SHUI_SHAPE_GRAPH = `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix shui: <http://www.w3.org/ns/shacl-ui/> .
@prefix ex: <http://example.org/ns#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:PersonShape
  a sh:NodeShape ;
  sh:property ex:nameProp .

ex:nameProp
  a sh:PropertyShape ;
  sh:path ex:name ;
  shui:editor shui:Editor ;
  shui:viewer shui:Viewer ;
  shui:parentGroup ex:IdentityGroup .

ex:IdentityGroup
  a sh:PropertyGroup ;
  rdfs:label "Identity" .
`;

/**
 * Run the Gate 1 admit-court against the canonical shui: shape graph.
 * Returns process exit code (0 = admitted).
 */
export function runAdmitCourt(
  turtle: string = SHUI_SHAPE_GRAPH,
): AdmitCourtResult {
  return loadAdmittedShapeGraph(turtle);
}

/** CLI entry: print standing JSON and exit with court exitCode. */
export function admitCourtMain(argv: string[] = process.argv.slice(2)): number {
  const turtle = argv.includes("--refuse-truex")
    ? `@prefix truex: <http://truex.local/ns#> .
truex:Thing a truex:Type .
`
    : argv.includes("--refuse-unknown")
      ? `@prefix acme: <http://acme.example/ns#> .
acme:Thing a acme:Type .
`
      : SHUI_SHAPE_GRAPH;

  const result = runAdmitCourt(turtle);
  const payload = {
    tip: "admit-court",
    exit: result.exitCode,
    standing: result.standing,
    ok: result.ok,
    reason: result.reason,
    prefixes: result.prefixes.map((p) => ({
      prefix: p.prefix,
      iri: p.iri,
      standing: p.standing,
    })),
    quadCount: result.quads.length,
  };
  console.log(JSON.stringify(payload, null, 2));
  return result.exitCode;
}

const isDirectRun =
  typeof process !== "undefined" &&
  Boolean(process.argv[1]) &&
  /admit-court\.(ts|js|mjs|cjs)$/.test(
    process.argv[1]!.replace(/\\/g, "/"),
  );

if (isDirectRun) {
  process.exit(admitCourtMain());
}
