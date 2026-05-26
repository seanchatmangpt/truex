import { describe, it, expect } from 'vitest';
import { VowMembrane } from '../src/index.js';

describe('The 8 Vow (Absolute Closure)', () => {
  it('should advance through all 8 states to reach Rest', () => {
    const vow = new VowMembrane('MAL:3:10');
    expect(vow.getState()).toBe('Source');

    // 1 -> 2 (Pattern)
    vow.advance('a'.repeat(64));
    expect(vow.getState()).toBe('Pattern');

    // 2 -> 3 (Field)
    vow.advance('field-alpha');
    expect(vow.getState()).toBe('Field');

    // 3 -> 4 (Motion)
    vow.advance('route-omega');
    expect(vow.getState()).toBe('Motion');

    // 4 -> 5 (Receiver)
    vow.advance('receiver-gamma');
    expect(vow.getState()).toBe('Receiver');

    // 5 -> 6 (Fruit)
    vow.advance(100);
    expect(vow.getState()).toBe('Fruit');

    // 6 -> 7 (Receipt)
    vow.advance('b'.repeat(64));
    expect(vow.getState()).toBe('Receipt');

    // 7 -> 8 (Rest)
    vow.advance(1);
    expect(vow.getState()).toBe('Rest');

    // Terminal check
    expect(() => vow.advance(1)).toThrow("Vow already reached Rest (Perfection)");
    
    const record = vow.getRecord();
    expect(record.source_id).toBe('MAL:3:10');
    expect(record.fruit_quantity).toBe(100);
    expect(record.replay_seq).toBe(1);
  });

  it('should refuse out-of-order or invalid closure conditions', () => {
    const vow = new VowMembrane('GEN:1:1');
    
    // Attempt empty field
    vow.advance('c'.repeat(64)); // Source -> Pattern
    expect(() => vow.advance('')).toThrow("field_id is empty");
    
    // Attempt zero fruit
    vow.advance('field-1'); // Pattern -> Field
    vow.advance('route-1'); // Field -> Motion
    vow.advance('receiver-1'); // Motion -> Receiver
    expect(() => vow.advance(0)).toThrow("fruit_quantity is zero or negative");
  });
});
