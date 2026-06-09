export class SurfaceInFlightLock {
  private locked = false;

  isLocked(): boolean {
    return this.locked;
  }

  tryAcquire(): boolean {
    if (this.locked) {
      return false;
    }

    this.locked = true;
    return true;
  }

  release(): void {
    this.locked = false;
  }
}

export function createInFlightLock(): SurfaceInFlightLock {
  return new SurfaceInFlightLock();
}

export async function withInFlightLock<T>(
  lock: SurfaceInFlightLock,
  work: () => T | Promise<T>
): Promise<T | null> {
  if (!lock.tryAcquire()) {
    return null;
  }

  try {
    return await work();
  } finally {
    lock.release();
  }
}
