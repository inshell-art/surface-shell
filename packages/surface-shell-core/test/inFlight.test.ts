import { describe, expect, it } from "vitest";
import { createInFlightLock } from "../src/index.js";

describe("inFlight", () => {
  it("acquires and releases a lock", () => {
    const lock = createInFlightLock();
    expect(lock.isLocked()).toBe(false);
    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);
    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });
});
