import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface DoctestBlock {
  filePath: string;
  lang: 'ts' | 'typescript' | 'bash';
  name: string;
  code: string;
  startLine: number;
  endLine: number;
  ignore: boolean;
  isDeferred: boolean;
  generatedFilePath?: string;
  status?: 'passed' | 'failed' | 'skipped' | 'deferred';
  error?: string | null;
}

// Global counters for unique filenames
let tsCounter = 0;
let bashCounter = 0;

function getFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entry = fs.statSync(dir);
  if (entry.isFile()) {
    const ext = path.extname(dir).slice(1);
    if (extensions.includes(ext)) {
      files.push(dir);
    }
    return files;
  }
  
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git' || file === '.generated' || file === 'dist') continue;
      files.push(...getFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file).slice(1);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function extractMarkdownDoctests(filePath: string, content: string): DoctestBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: DoctestBlock[] = [];
  let inBlock = false;
  let blockLang = '';
  let blockAttributes = '';
  let blockLines: { text: string; lineNum: number }[] = [];
  let blockStartLine = -1;
  
  for (const [i, line] of lines.entries()) {
    const lineNum = i + 1;
    
    if (inBlock) {
      if (line.trim() === '```') {
        inBlock = false;
        const code = blockLines.map(l => l.text).join('\n');
        const ignore = code.includes('no-doctest') || code.includes('example-only');
        const isDeferred = code.includes('defer-doctest') || code.includes('deferred') || code.includes('todo-doctest');
        const nameMatch = blockAttributes.match(/name=["']([^"']+)["']/);
        const name = nameMatch ? nameMatch[1] : `${path.basename(filePath)} block ${blocks.length}`;
        
        blocks.push({
          filePath,
          lang: blockLang as 'ts' | 'typescript' | 'bash',
          name,
          code,
          startLine: blockStartLine,
          endLine: lineNum,
          ignore,
          isDeferred
        });
      } else {
        blockLines.push({ text: line, lineNum });
      }
    } else {
      const match = line.match(/^```(ts|typescript|bash)\s+doctest\b(.*)$/);
      if (match) {
        inBlock = true;
        blockLang = match[1];
        blockAttributes = match[2];
        blockStartLine = lineNum;
        blockLines = [];
      }
    }
  }
  return blocks;
}

function extractJsDocDoctests(filePath: string, content: string): DoctestBlock[] {
  const lines = content.split(/\r?\n/);
  const jsDocComments: { startLine: number; lines: { text: string; originalLineNum: number }[] }[] = [];
  let insideJsDoc = false;
  let currentCommentLines: { text: string; originalLineNum: number }[] = [];
  let jsDocStartLine = -1;
  
  for (const [i, line] of lines.entries()) {
    const lineNum = i + 1;
    
    if (insideJsDoc) {
      const endIdx = line.indexOf('*/');
      if (endIdx === -1) {
        currentCommentLines.push({ text: line, originalLineNum: lineNum });
      } else {
        const commentText = line.slice(0, endIdx);
        currentCommentLines.push({ text: commentText, originalLineNum: lineNum });
        jsDocComments.push({ startLine: jsDocStartLine, lines: [...currentCommentLines] });
        insideJsDoc = false;
      }
    } else {
      const startIdx = line.indexOf('/**');
      if (startIdx !== -1) {
        insideJsDoc = true;
        jsDocStartLine = lineNum;
        currentCommentLines = [];
        
        const endIdx = line.indexOf('*/', startIdx + 3);
        if (endIdx === -1) {
          const commentText = line.slice(startIdx + 3);
          currentCommentLines.push({ text: commentText, originalLineNum: lineNum });
        } else {
          const commentText = line.slice(startIdx + 3, endIdx);
          currentCommentLines.push({ text: commentText, originalLineNum: lineNum });
          jsDocComments.push({ startLine: jsDocStartLine, lines: currentCommentLines });
          insideJsDoc = false;
        }
      }
    }
  }
  
  const blocks: DoctestBlock[] = [];
  for (const comment of jsDocComments) {
    const cleanedLines: { text: string; originalLineNum: number }[] = comment.lines.map(l => {
      const cleanText = l.text.replace(/^\s*\*\s?/, '');
      return { text: cleanText, originalLineNum: l.originalLineNum };
    });
    
    let inBlock = false;
    let blockLang = '';
    let blockAttributes = '';
    let blockLines: { text: string; lineNum: number }[] = [];
    let blockStartLine = -1;
    
    for (const cl of cleanedLines) {
      const lineText = cl.text;
      const originalLineNum = cl.originalLineNum;
      
      if (inBlock) {
        if (lineText.trim() === '```') {
          inBlock = false;
          const code = blockLines.map(l => l.text).join('\n');
          const ignore = code.includes('no-doctest') || code.includes('example-only');
          const isDeferred = code.includes('defer-doctest') || code.includes('deferred') || code.includes('todo-doctest');
          const nameMatch = blockAttributes.match(/name=["']([^"']+)["']/);
          const name = nameMatch ? nameMatch[1] : `${path.basename(filePath)} block ${blocks.length}`;
          
          blocks.push({
            filePath,
            lang: blockLang as 'ts' | 'typescript' | 'bash',
            name,
            code,
            startLine: blockStartLine,
            endLine: originalLineNum,
            ignore,
            isDeferred
          });
        } else {
          blockLines.push({ text: lineText, lineNum: originalLineNum });
        }
      } else {
        const match = lineText.match(/^```(ts|typescript|bash)\s+doctest\b(.*)$/);
        if (match) {
          inBlock = true;
          blockLang = match[1];
          blockAttributes = match[2];
          blockStartLine = originalLineNum;
          blockLines = [];
        }
      }
    }
  }
  return blocks;
}

function extractImports(code: string): { imports: string; body: string } {
  const importRegex = /(?:^|\n)(import\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?)/g;
  let imports = '';
  const body = code.replace(importRegex, (match) => {
    imports += match + '\n';
    return '';
  });
  return { imports: imports.trim(), body: body.trim() };
}

function rewriteImportPaths(importsText: string, originalFilePath: string): string {
  const originalFileDir = path.dirname(originalFilePath);
  
  // Rewrite standard imports
  const importRegex = /(import\s+[\s\S]*?from\s+['"])([^'"]+)(['"])/g;
  let rewritten = importsText.replace(importRegex, (match, p1, p2, p3) => {
    if (p2.startsWith('.')) {
      const resolved = path.resolve(originalFileDir, p2);
      let relativeToGen = path.relative('.generated/doctests', resolved);
      if (!relativeToGen.startsWith('.')) {
        relativeToGen = './' + relativeToGen;
      }
      return `${p1}${relativeToGen}${p3}`;
    } else if (p2.startsWith('src/') || p2.startsWith('packages/') || p2.startsWith('examples/')) {
      const resolved = path.resolve(process.cwd(), p2);
      let relativeToGen = path.relative('.generated/doctests', resolved);
      if (!relativeToGen.startsWith('.')) {
        relativeToGen = './' + relativeToGen;
      }
      return `${p1}${relativeToGen}${p3}`;
    }
    return match;
  });
  
  // Rewrite dynamic imports inside code if any
  const dynamicImportRegex = /(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g;
  rewritten = rewritten.replace(dynamicImportRegex, (match, p1, p2, p3) => {
    if (p2.startsWith('.')) {
      const resolved = path.resolve(originalFileDir, p2);
      let relativeToGen = path.relative('.generated/doctests', resolved);
      if (!relativeToGen.startsWith('.')) {
        relativeToGen = './' + relativeToGen;
      }
      return `${p1}${relativeToGen}${p3}`;
    } else if (p2.startsWith('src/') || p2.startsWith('packages/') || p2.startsWith('examples/')) {
      const resolved = path.resolve(process.cwd(), p2);
      let relativeToGen = path.relative('.generated/doctests', resolved);
      if (!relativeToGen.startsWith('.')) {
        relativeToGen = './' + relativeToGen;
      }
      return `${p1}${relativeToGen}${p3}`;
    }
    return match;
  });
  
  return rewritten;
}

function main() {
  console.log('🔍 Scanning workspace for doctests...');
  
  const filesToScan: string[] = [];
  
  if (fs.existsSync('README.md')) filesToScan.push('README.md');
  if (fs.existsSync('walkthrough.md')) filesToScan.push('walkthrough.md');
  
  if (fs.existsSync('docs')) {
    filesToScan.push(...getFiles('docs', ['md']));
  }
  
  if (fs.existsSync('packages')) {
    const pkgsFiles = getFiles('packages', ['ts', 'js']);
    const filteredPkgs = pkgsFiles.filter(file => {
      const parts = file.split(path.sep);
      const srcIdx = parts.indexOf('src');
      return srcIdx > 0 && srcIdx < parts.length - 1;
    });
    filesToScan.push(...filteredPkgs);
  }
  
  if (fs.existsSync('src')) {
    filesToScan.push(...getFiles('src', ['ts', 'js']));
  }
  
  console.log(`Found ${filesToScan.length} files to inspect.`);
  
  const doctests: DoctestBlock[] = [];
  
  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf8');
    let fileBlocks: DoctestBlock[] = [];
    
    fileBlocks = file.endsWith('.md') ? extractMarkdownDoctests(file, content) : extractJsDocDoctests(file, content);
    
    doctests.push(...fileBlocks);
  }
  
  console.log(`Extracted ${doctests.length} total doctest blocks.`);
  
  // Clean old generated files
  if (fs.existsSync('.generated/doctests')) {
    fs.rmSync('.generated/doctests', { recursive: true, force: true });
  }
  fs.mkdirSync('.generated/doctests', { recursive: true });
  
  // Process and generate test files
  let activeCount = 0;
  for (const block of doctests) {
    if (block.ignore) {
      block.status = 'skipped';
      block.error = null;
      continue;
    }
    if (block.isDeferred) {
      block.status = 'deferred';
      block.error = null;
      continue;
    }
    
    // It's active
    block.status = 'failed'; // default in case Vitest fails to run it
    block.error = 'Compilation or Vitest execution failure';
    activeCount++;
    
    const fileBasename = path.basename(block.filePath).replace(/\./g, '_');
    
    if (block.lang === 'ts' || block.lang === 'typescript') {
      const index = tsCounter++;
      const genFileName = `doctest_${fileBasename}_${index}.test.ts`;
      const genFilePath = path.resolve('.generated/doctests', genFileName);
      block.generatedFilePath = genFilePath;
      
      // Separate imports from body
      const { imports, body } = extractImports(block.code);
      const rewrittenImports = rewriteImportPaths(imports, block.filePath);
      
      // Remove any existing vitest imports from rewrittenImports to avoid duplicate import errors
      const cleanedImports = rewrittenImports.replace(/import\s+[\s\S]*?from\s+['"]vitest['"]\s*;?/g, '');
      
      const fileContent = `import { describe, it, expect } from 'vitest';
${cleanedImports}

describe(${JSON.stringify(block.filePath)}, () => {
  it(${JSON.stringify(block.name)}, async () => {
    ${body}
  });
});
`;
      fs.writeFileSync(genFilePath, fileContent, 'utf8');
    } else if (block.lang === 'bash') {
      const index = bashCounter++;
      const genFileName = `doctest_bash_${index}.test.ts`;
      const genFilePath = path.resolve('.generated/doctests', genFileName);
      block.generatedFilePath = genFilePath;
      
      // Parse command and expectations
      let cmd = '';
      let expectedExitCode = 0;
      let expectedStdout: string | null = null;
      let expectedStderr: string | null = null;
      
      const lines = block.code.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('#')) {
          const exitMatch = trimmed.match(/#\s*expect:\s*exit[cC]ode\s+(\d+)/);
          if (exitMatch) expectedExitCode = Number.parseInt(exitMatch[1], 10);
          
          const stdoutMatch = trimmed.match(/#\s*expect:\s*stdout\s+(.+)/);
          if (stdoutMatch) expectedStdout = stdoutMatch[1].replace(/^["']|["']$/g, '');
          
          const stderrMatch = trimmed.match(/#\s*expect:\s*stderr\s+(.+)/);
          if (stderrMatch) expectedStderr = stderrMatch[1].replace(/^["']|["']$/g, '');
        } else {
          if (!cmd) cmd = trimmed;
        }
      }
      
      const fileContent = `import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe(${JSON.stringify(block.filePath)}, () => {
  it(${JSON.stringify(block.name)}, () => {
    const cmd = ${JSON.stringify(cmd)};
    const expectedExitCode = ${expectedExitCode};
    const expectedStdout = ${expectedStdout ? JSON.stringify(expectedStdout) : 'null'};
    const expectedStderr = ${expectedStderr ? JSON.stringify(expectedStderr) : 'null'};
    
    const allowlist = [
      'npx tsx scripts/truex.ts doctor prove hook',
      'npx tsx scripts/truex.ts doctor prove replay',
      'npx tsx scripts/truex.ts doctor prove doctest'
    ];
    
    if (!allowlist.includes(cmd)) {
      throw new Error("Command is not allowlisted: " + cmd);
    }
    
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    
    try {
      stdout = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error: any) {
      exitCode = error.status ?? 1;
      stdout = error.stdout ?? '';
      stderr = error.stderr ?? '';
    }
    
    expect(exitCode).toBe(expectedExitCode);
    if (expectedStdout) {
      expect(stdout).toContain(expectedStdout);
    }
    if (expectedStderr) {
      expect(stderr).toContain(expectedStderr);
    }
  });
});
`;
      fs.writeFileSync(genFilePath, fileContent, 'utf8');
    }
  }
  
  console.log(`Generated ${activeCount} active test files under .generated/doctests/`);
  
  if (activeCount > 0) {
    console.log('🚀 Running test suite via Vitest...');
    try {
      // Create path for vitest json output
      const resultsJsonPath = path.resolve('.generated/doctest-results.json');
      execSync(`npx vitest run .generated/doctests --reporter=json --outputFile=${resultsJsonPath}`, {
        stdio: 'inherit'
      });
    } catch {
      console.log('⚠️ Vitest reported test failures (expected if some doctests fail).');
    }
    
    // Read and parse Vitest results
    const resultsJsonPath = path.resolve('.generated/doctest-results.json');
    if (fs.existsSync(resultsJsonPath)) {
      try {
        const vitestResults = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
        
        for (const suite of vitestResults.testResults) {
          const testFilePath = path.resolve(suite.name);
          const matchingBlock = doctests.find(b => b.generatedFilePath === testFilePath);
          
          if (matchingBlock) {
            const hasFailures = suite.assertionResults.some((r: any) => r.status === 'failed');
            if (hasFailures) {
              matchingBlock.status = 'failed';
              const failures = suite.assertionResults
                .filter((r: any) => r.status === 'failed')
                .map((r: any) => r.failureMessages.join('\n'))
                .join('\n');
              matchingBlock.error = failures || suite.message || 'Unknown test failure';
            } else {
              matchingBlock.status = 'passed';
              matchingBlock.error = null;
            }
          }
        }
      } catch (error_: any) {
        console.error('Error parsing Vitest JSON results:', error_.message);
      }
    } else {
      console.error('Error: Vitest JSON results file not found.');
    }
  } else {
    console.log('No active tests to run.');
  }
  
  // Generate reports
  const summary = {
    total: doctests.length,
    attempted: doctests.filter(d => d.status === 'passed' || d.status === 'failed').length,
    passed: doctests.filter(d => d.status === 'passed').length,
    failed: doctests.filter(d => d.status === 'failed').length,
    skipped: doctests.filter(d => d.status === 'skipped').length,
    deferred: doctests.filter(d => d.status === 'deferred').length
  };
  
  const reportJson = {
    summary,
    results: doctests.map(d => ({
      sourceFile: d.filePath,
      lineStart: d.startLine,
      lineEnd: d.endLine,
      name: d.name,
      type: d.lang,
      status: d.status,
      error: d.error
    }))
  };
  
  const reportDir = 'docs/reports';
  fs.mkdirSync(reportDir, { recursive: true });
  
  fs.writeFileSync(
    path.join(reportDir, 'doctest-examples.report.json'),
    JSON.stringify(reportJson, null, 2),
    'utf8'
  );
  
  let mdContent = `# Doctest Execution Report

## Summary

- **Total**: ${summary.total}
- **Attempted**: ${summary.attempted}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Skipped**: ${summary.skipped}
- **Deferred**: ${summary.deferred}

## Details

| Source File | Lines | Name | Type | Status | Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;
  
  for (const block of doctests) {
    const errorText = block.error ? block.error.replace(/\n/g, '<br>') : '-';
    const statusIcon = block.status === 'passed' ? '✅ passed' : block.status === 'failed' ? '❌ failed' : block.status === 'skipped' ? '⚠️ skipped' : '⏳ deferred';
    mdContent += `| \`${block.filePath}\` | L${block.startLine}-L${block.endLine} | \`${block.name}\` | \`${block.lang}\` | ${statusIcon} | ${errorText} |\n`;
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'doctest-examples.report.md'),
    mdContent,
    'utf8'
  );
  
  console.log(`\n🎉 Doctest verification completed!`);
  console.log(`Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped, ${summary.deferred} deferred.`);
  console.log(`JSON report: docs/reports/doctest-examples.report.json`);
  console.log(`Markdown report: docs/reports/doctest-examples.report.md`);
  
  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
