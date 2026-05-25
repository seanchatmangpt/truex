import { describe, it, expect } from 'vitest';
import { LogicEngine } from '../src/lib/logic-engine.js';
import { createProxy } from '../../../src/proxy/create-proxy.js';
import { createCapabilityContext, registerCapabilityInterceptors } from '../../../src/security/capability-acl.js';

describe('LogicEngine Integration', () => {
  it('should delegate canWrite decisions to logic engine', () => {
    const engine = new LogicEngine();

    // admissible(Op) :- has_capability(Op), follows_sequence(Op)
    engine.addRule(
      { predicate: 'admissible', args: [{ variable: 'Op' }] },
      [
        { predicate: 'has_capability', args: [{ variable: 'Op' }] },
        { predicate: 'follows_sequence', args: [{ variable: 'Op' }] }
      ]
    );

    // Facts
    engine.addFact('has_capability', 'secret');
    engine.addFact('follows_sequence', 'secret');
    engine.addFact('has_capability', 'other');
    // follows_sequence('other') is MISSING

    const target = { secret: 'hidden', other: 'public', normal: 'base' };
    const proxyInterface = createProxy(target);
    
    const capCtx = createCapabilityContext(target, {
      canRead: new Set(['secret', 'other', 'normal']),
      canWrite: new Set(['normal']), // Only 'normal' is explicitly writable
      logicEngine: engine
    });

    registerCapabilityInterceptors(proxyInterface, capCtx);

    const proxy = proxyInterface.proxy;

    capCtx.call(() => {
      // Allowed via explicit canWrite
      proxy.normal = 'updated';
      expect(target.normal).toBe('updated');

      // Allowed via logic engine rule
      proxy.secret = 'revealed';
      expect(target.secret).toBe('revealed');

      // Denied because follows_sequence('other') is missing
      expect(() => {
        proxy.other = 'changed';
      }).toThrowError(/trap returned falsish/);
      expect(target.other).toBe('public');
    });
  });

  it('should support complex multi-variable checks', () => {
      const engine = new LogicEngine();
      
      // can_edit(User, Obj) :- is_owner(User, Obj)
      // can_edit(User, Obj) :- is_admin(User)
      engine.addRule(
          { predicate: 'can_edit', args: [{variable: 'User'}, {variable: 'Obj'}] },
          [{ predicate: 'is_owner', args: [{variable: 'User'}, {variable: 'Obj'}] }]
      );
      engine.addRule(
          { predicate: 'can_edit', args: [{variable: 'User'}, {variable: 'Obj'}] },
          [{ predicate: 'is_admin', args: [{variable: 'User'}] }]
      );
      
      engine.addFact('is_owner', 'alice', 'doc1');
      engine.addFact('is_admin', 'bob');
      
      expect(engine.query({ predicate: 'can_edit', args: ['alice', 'doc1'] })).toBe(true);
      expect(engine.query({ predicate: 'can_edit', args: ['bob', 'doc1'] })).toBe(true);
      expect(engine.query({ predicate: 'can_edit', args: ['charlie', 'doc1'] })).toBe(false);
  });
});
