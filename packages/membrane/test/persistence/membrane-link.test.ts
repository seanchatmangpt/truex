import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createProxy } from "../../src/membrane.js";
import { createMembraneLink } from "../../src/persistence/membrane-link.js";

describe("MembraneLink - Persistence Atomic Link", () => {
  it("commits both proxy state and sqlite state on success", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);

    const target: any = { count: 0 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    link.execute(() => {
      proxyInterface.proxy.count = 1;
      db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "one");
    });

    // Verify proxy state updated
    expect(target.count).toBe(1);
    
    // Verify sqlite state updated
    const row = db.prepare("SELECT val FROM test WHERE id = '1'").get() as { val: string };
    expect(row.val).toBe("one");

    db.close();
  });

  it("rolls back both proxy state and sqlite state on explicit failure", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);

    const target: any = { count: 0 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    expect(() => {
      link.execute(() => {
        proxyInterface.proxy.count = 1;
        db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "one");
        throw new Error("Failure");
      });
    }).toThrow("Failure");

    // Verify proxy state rolled back
    expect(target.count).toBe(0);
    
    // Verify sqlite state rolled back
    const row = db.prepare("SELECT val FROM test WHERE id = '1'").get();
    expect(row).toBeUndefined();

    db.close();
  });

  it("rolls back proxy state if sqlite operation fails (e.g. constraint violation)", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);
    // Pre-insert to cause UNIQUE constraint failure
    db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "original");

    const target: any = { count: 0 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    expect(() => {
      link.execute(() => {
        // Change proxy state
        proxyInterface.proxy.count = 1;
        // Attempt duplicate insert which will fail
        db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "duplicate");
      });
    }).toThrow(/UNIQUE constraint failed/);

    // Verify proxy state rolled back due to sqlite error
    expect(target.count).toBe(0);
    
    db.close();
  });

  it("handles multiple proxy mutations and rolls them all back", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);

    const target: any = { a: 1, b: 2, c: 3 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    expect(() => {
      link.execute(() => {
        proxyInterface.proxy.a = 10;
        proxyInterface.proxy.b = 20;
        delete proxyInterface.proxy.c;
        proxyInterface.proxy.d = 40;
        
        throw new Error("Abort");
      });
    }).toThrow("Abort");

    expect(target.a).toBe(1);
    expect(target.b).toBe(2);
    expect(target.c).toBe(3);
    expect(target.d).toBeUndefined();

    db.close();
  });

  it("supports nested transactions if the database and membrane support it", () => {
    // Note: better-sqlite3 uses SAVEPOINT for nested transactions
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);

    const target: any = { count: 0 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    link.execute(() => {
      proxyInterface.proxy.count = 1;
      
      // Nested execution
      link.execute(() => {
        proxyInterface.proxy.count = 2;
        db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "nested");
      });
    });

    expect(target.count).toBe(2);
    const row = db.prepare("SELECT val FROM test WHERE id = '1'").get() as { val: string };
    expect(row.val).toBe("nested");

    db.close();
  });

  it("rolls back everything if a nested transaction fails", () => {
    const db = new Database(":memory:");
    db.exec(`CREATE TABLE test (id TEXT PRIMARY KEY, val TEXT)`);

    const target: any = { count: 0 };
    const proxyInterface = createProxy(target);
    const link = createMembraneLink(db, proxyInterface, target);

    expect(() => {
      link.execute(() => {
        proxyInterface.proxy.count = 1;
        
        // Nested execution that fails
        link.execute(() => {
          proxyInterface.proxy.count = 2;
          db.prepare("INSERT INTO test (id, val) VALUES (?, ?)").run("1", "nested");
          throw new Error("Nested Failure");
        });
      });
    }).toThrow("Nested Failure");

    // Both should be rolled back to original state (0)
    expect(target.count).toBe(0);
    const row = db.prepare("SELECT val FROM test WHERE id = '1'").get();
    expect(row).toBeUndefined();

    db.close();
  });
});
