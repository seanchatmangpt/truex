/**
 * @module logic-engine
 * @description Minimal first-order logic evaluator (Prolog8 prototype).
 * Supports simple Horn clauses and unification.
 */

export type Term = string | number | boolean | { variable: string };

export interface Atom {
  predicate: string;
  args: Term[];
}

export interface Rule {
  head: Atom;
  body: Atom[];
}

export type Substitution = Map<string, Term>;

export class LogicEngine {
  private rules: Rule[] = [];
  private facts: Atom[] = [];

  addFact(predicate: string, ...args: Term[]) {
    this.facts.push({ predicate, args });
  }

  addRule(head: Atom, body: Atom[]) {
    this.rules.push({ head, body });
  }

  /**
   * Simple Horn clause solver with backtracking and unification.
   */
  query(goal: Atom): boolean {
    const solutions = this.solve(goal, new Map());
    return solutions.length > 0;
  }

  private solve(goal: Atom, sub: Substitution): Substitution[] {
    const results: Substitution[] = [];

    // 1. Try facts
    for (const fact of this.facts) {
      if (fact.predicate === goal.predicate && fact.args.length === goal.args.length) {
        const newSub = this.unify(goal.args, fact.args, new Map(sub));
        if (newSub) {
          results.push(newSub);
        }
      }
    }

    // 2. Try rules
    for (const rule of this.rules) {
      if (rule.head.predicate === goal.predicate && rule.head.args.length === goal.args.length) {
        const headSub = this.unify(goal.args, rule.head.args, new Map(sub));
        if (headSub) {
          let currentSubs = [headSub];
          let possible = true;

          for (const bodyAtom of rule.body) {
            const nextSubs: Substitution[] = [];
            for (const s of currentSubs) {
              const instantiatedBody = this.instantiate(bodyAtom, s);
              const bodySolutions = this.solve(instantiatedBody, s);
              nextSubs.push(...bodySolutions);
            }
            if (nextSubs.length === 0) {
              possible = false;
              break;
            }
            currentSubs = nextSubs;
          }

          if (possible) {
            results.push(...currentSubs);
          }
        }
      }
    }

    return results;
  }

  private unify(args1: Term[], args2: Term[], sub: Substitution): Substitution | null {
    if (args1.length !== args2.length) return null;

    for (let i = 0; i < args1.length; i++) {
      const t1 = this.resolve(args1[i], sub);
      const t2 = this.resolve(args2[i], sub);

      if (this.isVariable(t1)) {
        if (t1.variable !== (t2 as any).variable || !this.isVariable(t2)) {
           sub.set(t1.variable, t2);
        }
      } else if (this.isVariable(t2)) {
        sub.set(t2.variable, t1);
      } else if (JSON.stringify(t1) !== JSON.stringify(t2)) {
        return null;
      }
    }
    return sub;
  }

  private resolve(term: Term, sub: Substitution): Term {
    if (this.isVariable(term)) {
      if (sub.has(term.variable)) {
        return this.resolve(sub.get(term.variable)!, sub);
      }
    }
    return term;
  }

  private instantiate(atom: Atom, sub: Substitution): Atom {
    return {
      predicate: atom.predicate,
      args: atom.args.map(arg => this.resolve(arg, sub))
    };
  }

  private isVariable(term: Term): term is { variable: string } {
    return typeof term === 'object' && term !== null && 'variable' in term;
  }
}
