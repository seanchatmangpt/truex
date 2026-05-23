export type TruexContext = {
  seed: number;
  clock: () => number;
  uuid: () => string;
};

/**
 * Creates a deterministic operational context using a seeded Mulberry32 PRNG.
 * Ensures that clock calls and UUID generation are completely reproducible.
 */
export function createDeterministicContext(seed: number): TruexContext {
  let state = seed >>> 0;

  // Mulberry32 generator
  const nextRand = (): number => {
    let t = (state += 0x6d_2b_79_f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };

  const nextBytes = (len: number): Uint8Array => {
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = Math.floor(nextRand() * 256);
    }
    return bytes;
  };

  const uuid = (): string => {
    const b = nextBytes(16);
    // Set UUID v4 variant/version bits
    b[6]! = (b[6]! & 0x0f) | 0x40; // Version 4
    b[8]! = (b[8]! & 0x3f) | 0x80; // Variant 10xx
    
    return [
      bytesToHex(b.subarray(0, 4)),
      bytesToHex(b.subarray(4, 6)),
      bytesToHex(b.subarray(6, 8)),
      bytesToHex(b.subarray(8, 10)),
      bytesToHex(b.subarray(10, 16))
    ].join('-');
  };

  let timeState = 1_716_480_000_000; // Fixed deterministic start epoch (May 23 2024)
  const clock = (): number => {
    timeState += 1; // Increment by 1ms for each read
    return timeState;
  };

  return {
    seed,
    clock,
    uuid,
  };
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
