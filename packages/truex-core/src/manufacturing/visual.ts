import type { Receipt } from "../runtime-law.js";

/**
 * DashboardMetrics represents the current state of the manufacturing line.
 */
export interface DashboardMetrics {
  throughput: number;      // Operations per second
  lineStops: number;       // Total number of Jidoka interventions
  convergenceRate: number; // Ratio of confirmed receipts to total receipts
  uptime: number;          // Milliseconds since dashboard start
  totalOps: number;        // Total operations processed
}

/**
 * ManufacturingDashboard (Andon Board) implements a terminal-based
 * visual management system for the Truex core.
 * 
 * Inspired by the Toyota Production System (TPS), it provides real-time
 * visibility into process health and performance.
 */
export class ManufacturingDashboard {
  private totalOps = 0;
  private readonly startTime = Date.now();
  private lineStops = 0;
  private successfulReceipts = 0;
  private totalReceipts = 0;

  /**
   * Records a processed operation for throughput calculation.
   */
  recordOperation(): void {
    this.totalOps++;
  }

  /**
   * Records a 'line stop' (Andon cord pull). 
   * In TPS, this is Jidoka - stopping the process to build in quality.
   */
  recordLineStop(): void {
    this.lineStops++;
  }

  /**
   * Records an execution receipt to track quality metrics.
   * 
   * @param receipt The receipt from a hook execution
   */
  recordReceipt(receipt: Receipt): void {
    this.totalReceipts++;
    if (receipt.status === 'confirmed') {
      this.successfulReceipts++;
    }
  }

  /**
   * Calculates current metrics.
   */
  getMetrics(): DashboardMetrics {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = uptime / 1000;
    const throughput = uptimeSeconds > 0 ? this.totalOps / uptimeSeconds : 0;
    const convergenceRate = this.totalReceipts > 0 ? this.successfulReceipts / this.totalReceipts : 1;

    return {
      throughput,
      lineStops: this.lineStops,
      convergenceRate,
      uptime,
      totalOps: this.totalOps
    };
  }

  /**
   * Renders the dashboard as a string formatted for the terminal.
   * 
   * @returns A string representation of the Andon Board
   */
  render(): string {
    const metrics = this.getMetrics();
    const convergencePct = (metrics.convergenceRate * 100).toFixed(1);
    const throughputFmt = metrics.throughput.toFixed(2);
    const uptimeFmt = (metrics.uptime / 1000).toFixed(1);

    const status = metrics.lineStops > 0 ? "[STOPPED]" : "[RUNNING]";
    const alert = metrics.lineStops > 0 ? "!!! JIDOKA INTERVENTION REQUIRED !!!" : "Line Health: NORMAL";

    const board = [
      "┌──────────────────────────────────────────────────────────┐",
      "│              TRUEX MANUFACTURING DASHBOARD               │",
      "│                     (ANDON BOARD)                        │",
      "├──────────────────────────────────────────────────────────┤",
      `│  Status: ${status.padEnd(10)}              Uptime: ${uptimeFmt.padStart(8)}s  │`,
      `│  Throughput: ${throughputFmt.padStart(8)} ops/s      Total Ops: ${metrics.totalOps.toString().padStart(8)}  │`,
      "├──────────────────────────────────────────────────────────┤",
      "│  QUALITY METRICS (RECEIPT CONVERGENCE)                   │",
      `│  Success: ${this.successfulReceipts.toString().padStart(8)} / ${this.totalReceipts.toString().padEnd(8)}   Rate: ${convergencePct.padStart(7)}%  │`,
      "├──────────────────────────────────────────────────────────┤",
      `│  LINE STOPS (ANDON): ${metrics.lineStops.toString().padStart(3)}                                 │`,
      `│  ${alert.padEnd(54)}  │`,
      "└──────────────────────────────────────────────────────────┘"
    ];

    return board.join('\n');
  }

  /**
   * Automatically prints the dashboard to the console.
   * Uses ANSI escape sequences to clear the screen and reset cursor.
   */
  display(): void {
    // \x1b[2J = Clear screen, \x1b[H = Move cursor to (1,1)
    process.stdout.write('\u001B[2J\u001B[H' + this.render() + '\n');
  }
}
