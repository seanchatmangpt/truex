// Explicit Resource Management polyfill for environments without Symbol.dispose
if (typeof (Symbol as any).dispose === 'undefined') {
  (Symbol as any).dispose = Symbol('Symbol.dispose');
}

/**
 * Global FinalizationRegistry to act as a fallback safety net for WASM handles.
 * If V8 garbage collects a JS wrapper object whose handle was not explicitly disposed,
 * this registry triggers and invokes wasm.delete_object(handle) in the background.
 */
export const wasmCleanupRegistry = new FinalizationRegistry(
  (cleanup: { handle: string; wasm: any }) => {
    try {
      if (typeof cleanup.wasm.delete_object === 'function') {
        cleanup.wasm.delete_object(cleanup.handle);
      }
    } catch {
      // Best effort cleanup during GC phase, ignore errors
    }
  }
);

/**
 * Wrapper class managing the lifecycle of a WebAssembly heap-allocated object.
 * Implements the Disposable protocol to support 'using' statement scopes.
 */
export class WasmResource implements Disposable {
  private disposed = false;

  constructor(
    public readonly handle: string,
    private readonly wasm: any
  ) {
    // Register this wrapper instance with the finalizer safety net
    wasmCleanupRegistry.register(this, { handle, wasm }, this);
  }

  /**
   * Explicitly frees the WASM memory held by this handle.
   */
  [Symbol.dispose](): void {
    if (this.disposed) return;
    this.disposed = true;

    // Unregister from the finalizer registry since we are manually cleaning it up
    wasmCleanupRegistry.unregister(this);

    if (this.handle && !this.handle.startsWith('virtual_')) {
      try {
        if (typeof this.wasm.delete_object === 'function') {
          this.wasm.delete_object(this.handle);
        }
      } catch (e) {
        console.warn(`[WASM Cleanup] Failed to delete handle ${this.handle}:`, e);
      }
    }
  }

  /**
   * Retrieve whether this object has already been disposed.
   */
  isDisposed(): boolean {
    return this.disposed;
  }
}
