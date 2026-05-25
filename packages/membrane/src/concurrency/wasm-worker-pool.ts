import { Worker } from 'node:worker_threads';

export interface WasmTask {
  tenantId: string;
  algorithm: string;
  payload: any;
}

interface WorkerInfo {
  worker: Worker;
  isBusy: boolean;
  currentResolve?: (val: any) => void;
  currentReject?: (err: any) => void;
}

export class WasmWorkerPool {
  private workers: WorkerInfo[] = [];
  private queue: { task: WasmTask; resolve: (val: any) => void; reject: (err: any) => void }[] = [];

  constructor(private poolSize: number, private workerScriptPath: string) {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScriptPath, {
        execArgv: [...process.execArgv]
      });
      const info: WorkerInfo = {
        worker,
        isBusy: false
      };
      worker.on('message', (result) => this.handleWorkerFinished(info, result));
      worker.on('error', (err) => this.handleWorkerError(info, err));
      this.workers.push(info);
    }
  }

  execute(task: WasmTask): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.dispatchNext();
    });
  }

  terminate(): void {
    for (const info of this.workers) {
      info.worker.terminate();
    }
    this.workers = [];
  }

  private dispatchNext() {
    if (this.queue.length === 0) return;

    // Find the first idle worker
    const idleInfo = this.workers.find(w => !w.isBusy);
    if (!idleInfo) return; // All workers are busy

    const next = this.queue.shift();
    if (!next) return;

    idleInfo.isBusy = true;
    idleInfo.currentResolve = next.resolve;
    idleInfo.currentReject = next.reject;

    idleInfo.worker.postMessage(next.task);
  }

  private handleWorkerFinished(info: WorkerInfo, result: any) {
    info.isBusy = false;
    const resolve = info.currentResolve;
    info.currentResolve = undefined;
    info.currentReject = undefined;

    if (resolve) resolve(result);
    this.dispatchNext();
  }

  private handleWorkerError(info: WorkerInfo, err: any) {
    info.isBusy = false;
    const reject = info.currentReject;
    info.currentResolve = undefined;
    info.currentReject = undefined;

    if (reject) reject(err);

    // Restart worker if crashed
    info.worker.terminate();
    const newWorker = new Worker(this.workerScriptPath, {
      execArgv: [...process.execArgv]
    });
    info.worker = newWorker;
    newWorker.on('message', (res) => this.handleWorkerFinished(info, res));
    newWorker.on('error', (e) => this.handleWorkerError(info, e));

    this.dispatchNext();
  }
}
