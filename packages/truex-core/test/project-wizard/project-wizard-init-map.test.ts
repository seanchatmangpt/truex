import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, ProjectMapper } from '../../src/project-wizard.gall.js';

describe('Project Cell + Topology Mapper Domain (Agent 2)', () => {
  it('should initialize folders and project files idempotently', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-init-map-'));
    const cell = new ProjectCell(tempDir);

    cell.init({
      path: tempDir,
      mission: 'Test Init & Map',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const expectedDirs = [
      '.truex',
      '.truex/receipts',
      '.truex/reports',
      '.truex/checkpoints',
      '.truex/mission',
      'docs',
      'docs/reports',
      'docs/benchmarks',
      'tests'
    ];

    for (const dir of expectedDirs) {
      expect(fs.existsSync(path.join(tempDir, dir))).toBe(true);
    }

    expect(fs.existsSync(path.join(tempDir, '.truex', 'project.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'mission', 'start.json'))).toBe(true);

    // Call init again to verify idempotency
    const prevStart = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'mission', 'start.json'), 'utf8'));
    cell.init({
      path: tempDir,
      mission: 'Test Init & Map Refreshed',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const nextStart = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'mission', 'start.json'), 'utf8'));
    expect(prevStart.startTime).toBe(nextStart.startTime); // Start time preserved

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should build project topology facts and generate C4 maps', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-map-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Mapping',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    // Create a dummy file in a mock src dir
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'app.ts'), '// hello', 'utf8');

    const mapper = new ProjectMapper(cell);
    const { topology, hash: topoHash } = mapper.map();

    expect(topoHash).toBeDefined();
    expect(topology.inventory.source.includes('src/app.ts')).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'reports', 'project-topology.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'docs', 'project-c4-context.mmd'))).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should verify directory topology mapping, binary limits, C4 Mermaid graphs, and traversal guards under v0.1 spec', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-map-v01-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test v0.1 Map Spec',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    // 1. Directory topology mapping and categories classification
    // Create files in various categories
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'core.ts'), '// core code', 'utf8');

    fs.mkdirSync(path.join(tempDir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'scripts', 'build.ts'), '// build script', 'utf8');

    fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'docs', 'readme.md'), '# README', 'utf8');

    // Create a mock binary file
    const binaryData = Buffer.alloc(10);
    binaryData[0] = 0; // null byte indicates binary
    fs.writeFileSync(path.join(tempDir, 'src', 'icon.png'), binaryData);

    // Create a large file
    const largeData = Buffer.alloc(11 * 1024 * 1024); // 11MB > 10MB
    fs.writeFileSync(path.join(tempDir, 'large.txt'), largeData);

    const mapper = new ProjectMapper(cell);
    const { topology } = mapper.map();

    // Verify categories are correctly partitioned (no duplication, scripts excluded from source)
    expect(topology.inventory.source.includes('src/core.ts')).toBe(true);
    expect(topology.inventory.source.includes('scripts/build.ts')).toBe(false); // scripts excluded from source
    expect(topology.inventory.scripts.includes('scripts/build.ts')).toBe(true);
    expect(topology.inventory.docs.includes('docs/readme.md')).toBe(true);
    expect(topology.inventory.binaries.includes('src/icon.png')).toBe(true);
    expect(topology.inventory.largeFiles.includes('large.txt')).toBe(true);

    // 2. Binary and size inspection limits
    // Verify cell.inspectFile fails on binary file
    expect(() => cell.inspectFile('src/icon.png')).toThrow(/Binary inspection limit breached/);
    
    // Verify cell.inspectFile fails on file exceeding 1MB limit
    expect(() => cell.inspectFile('large.txt')).toThrow(/Binary inspection limit breached/);

    // 3. Dynamic C4 Mermaid graphs
    const contextContent = fs.readFileSync(path.join(tempDir, 'docs', 'project-c4-context.mmd'), 'utf8');
    const containerContent = fs.readFileSync(path.join(tempDir, 'docs', 'project-c4-container.mmd'), 'utf8');
    
    // Assert they are not static and contain actual counts/project name
    expect(contextContent).toContain('Project Cell Boundary');
    expect(containerContent).toContain('Source Code (1 files)');
    expect(containerContent).toContain('Binaries (1 files)');
    expect(containerContent).toContain('Large Files (1 files)');

    // 4. Traversal guards
    // Check cell.resolvePath catches traversal
    expect(() => cell.resolvePath('../outside.ts')).toThrow(/Path traversal refused/);
    expect(() => cell.resolvePath('/etc/passwd')).toThrow(/Path traversal refused/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should exhaustively verify binary detection, size limits, dynamic C4 diagrams, and standard/deep traversal guards', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-map-exhaustive-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Exhaustive Verification of Init & Map',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    // 1. Binary Detection Validation
    // A. Binary extension
    fs.mkdirSync(path.join(tempDir, 'bin-ext'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'bin-ext', 'test.wasm'), 'not-actually-binary-but-wasm-ext', 'utf8');

    // B. Text extension but null byte in first 512 bytes (index 100)
    const textWithNullEarly = Buffer.alloc(200, 'a');
    textWithNullEarly.write('prefix text');
    textWithNullEarly[100] = 0; // null byte
    fs.writeFileSync(path.join(tempDir, 'bin-ext', 'null-early.txt'), textWithNullEarly);

    // C. Text extension but null byte after first 512 bytes (index 600)
    const textWithNullLate = Buffer.alloc(1000, 'a');
    textWithNullLate.write('prefix text');
    textWithNullLate[600] = 0; // null byte outside 512 bytes check
    fs.writeFileSync(path.join(tempDir, 'bin-ext', 'null-late.txt'), textWithNullLate);

    // D. Normal text
    fs.writeFileSync(path.join(tempDir, 'bin-ext', 'normal.txt'), 'clean text only', 'utf8');

    const mapper = new ProjectMapper(cell);
    const { topology: topo1 } = mapper.map();

    // Verify binary categorizations
    expect(topo1.inventory.binaries.includes(path.normalize('bin-ext/test.wasm'))).toBe(true);
    expect(topo1.inventory.binaries.includes(path.normalize('bin-ext/null-early.txt'))).toBe(true);
    expect(topo1.inventory.binaries.includes(path.normalize('bin-ext/null-late.txt'))).toBe(false);
    expect(topo1.inventory.binaries.includes(path.normalize('bin-ext/normal.txt'))).toBe(false);

    // Verify inspectFile throws on early null byte binary
    expect(() => cell.inspectFile('bin-ext/null-early.txt')).toThrow(/Binary inspection limit breached: file is binary/);
    // Verify inspectFile permits late null byte because it is not detected as binary
    expect(cell.inspectFile('bin-ext/null-late.txt')).toBeDefined();

    // 2. Size Limits Validation
    // A. Exactly 1MB (1024 * 1024 bytes) - inspectFile limit threshold
    const exact1MB = Buffer.alloc(1024 * 1024, 'a');
    fs.writeFileSync(path.join(tempDir, 'exact-1mb.txt'), exact1MB);
    // Should NOT throw because size is not strictly greater than 1MB
    expect(cell.inspectFile('exact-1mb.txt')).toHaveLength(1024 * 1024);

    // B. Exactly 1MB + 1 byte - inspectFile limit exceeded
    const over1MB = Buffer.alloc(1024 * 1024 + 1, 'a');
    fs.writeFileSync(path.join(tempDir, 'over-1mb.txt'), over1MB);
    expect(() => cell.inspectFile('over-1mb.txt')).toThrow(/Binary inspection limit breached: file exceeds 1MB limit/);

    // C. Exactly 10MB - map limit threshold (not classified as large file)
    const exact10MB = Buffer.alloc(10 * 1024 * 1024, 'a');
    fs.writeFileSync(path.join(tempDir, 'exact-10mb.txt'), exact10MB);
    
    // D. Exactly 10MB + 1 byte - map limit exceeded (classified as large file)
    const over10MB = Buffer.alloc(10 * 1024 * 1024 + 1, 'a');
    fs.writeFileSync(path.join(tempDir, 'over-10mb.txt'), over10MB);

    const { topology: topo2 } = mapper.map();
    expect(topo2.inventory.largeFiles.includes(path.normalize('over-10mb.txt'))).toBe(true);
    expect(topo2.inventory.largeFiles.includes(path.normalize('exact-10mb.txt'))).toBe(false);

    // 3. Dynamic C4 Diagram Generation
    // Create source files to test count updates in Mermaid
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'first.ts'), '// first source', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'src', 'second.ts'), '// second source', 'utf8');

    // Run map to update the diagrams
    mapper.map();

    const containerC4 = fs.readFileSync(path.join(tempDir, 'docs', 'project-c4-container.mmd'), 'utf8');
    // We have:
    // Source: src/first.ts, src/second.ts (2 files)
    // Binaries: bin-ext/test.wasm, bin-ext/null-early.txt (2 files)
    // Large: over-10mb.txt (1 file)
    expect(containerC4).toContain('Source Code (2 files)');
    expect(containerC4).toContain('Binaries (2 files)');
    expect(containerC4).toContain('Large Files (1 files)');

    // 4. Traversal Guards Checks
    // A. Standard Traversal
    expect(() => cell.resolvePath('../outside-file.txt')).toThrow(/Path traversal refused/);
    expect(() => cell.resolvePath('src/../../outside-file.txt')).toThrow(/Path traversal refused/);

    // B. Deep Traversal (multiple steps up)
    expect(() => cell.resolvePath('../../../../etc/passwd')).toThrow(/Path traversal refused/);
    expect(() => cell.resolvePath('src/nested/../../../../etc/passwd')).toThrow(/Path traversal refused/);

    // C. Absolute Path Traversal
    expect(() => cell.resolvePath('/etc/passwd')).toThrow(/Path traversal refused/);
    expect(() => cell.resolvePath(path.resolve(tempDir, '../outside'))).toThrow(/Path traversal refused/);

    // D. Null Byte Traversal
    expect(() => cell.resolvePath('src/core.ts\0outside')).toThrow(/Path traversal refused/);

    // E. Permitted Deep Nested Internal paths
    const allowedPath1 = cell.resolvePath('src/nested/deep/internal.ts');
    expect(allowedPath1).toBe(path.join(tempDir, 'src', 'nested', 'deep', 'internal.ts'));

    const allowedPath2 = cell.resolvePath('.');
    expect(allowedPath2).toBe(tempDir);

    const allowedPath3 = cell.resolvePath('');
    expect(allowedPath3).toBe(tempDir);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
