import fs from 'node:fs';
import path from 'node:path';

export interface EmitterMetadata {
  name: string;
  description: string;
  outputPath: string;
}

export abstract class FactEmitter {
  /**
   * Returns metadata about this emitter.
   */
  abstract getMetadata(): EmitterMetadata;

  /**
   * Collects and returns the facts.
   */
  protected abstract collectFacts(): Promise<any> | any;

  /**
   * Validates the facts. Returns true if valid, or throws an error/returns false if not.
   */
  public validate(facts: any): boolean {
    if (facts === undefined || facts === null) return false;
    return true;
  }

  /**
   * Formats the facts for output. Default is JSON with metadata.
   */
  protected format(facts: any): string {
    const metadata = this.getMetadata();
    
    // If facts is already a string (e.g. for diagrams), return it as is
    if (typeof facts === 'string') {
      return facts;
    }

    const output = {
      ...facts,
      _metadata: {
        emitter: metadata.name,
        description: metadata.description,
        timestamp: new Date().toISOString()
      }
    };

    return JSON.stringify(output, null, 2);
  }

  /**
   * Orchestrates the emission process: collect, validate, and write to disk.
   */
  public async emit(): Promise<any> {
    const metadata = this.getMetadata();
    console.log(`🔍 [${metadata.name}] Extracting facts...`);
    
    const facts = await this.collectFacts();
    
    if (!this.validate(facts)) {
      throw new Error(`Validation failed for emitter: ${metadata.name}`);
    }

    const outputContent = this.format(facts);

    const fullOutputPath = path.resolve(process.cwd(), metadata.outputPath);
    const outputDir = path.dirname(fullOutputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(fullOutputPath, outputContent);
    console.log(`✅ [${metadata.name}] Facts emitted to ${metadata.outputPath}`);
    
    return facts;
  }
}
