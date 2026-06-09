import type { SurfaceStorageAdapter } from "./types.js";

export type SurfaceStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function createMemoryStorageAdapter(initial: Record<string, string> = {}): SurfaceStorageAdapter {
  const values = new Map<string, string>(Object.entries(initial));

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

export function createBrowserStorageAdapter(
  localStorageLike: SurfaceStorageLike,
  _sessionStorageLike?: SurfaceStorageLike
): SurfaceStorageAdapter {
  return {
    getItem(key) {
      return localStorageLike.getItem(key);
    },
    setItem(key, value) {
      localStorageLike.setItem(key, value);
    },
    removeItem(key) {
      localStorageLike.removeItem(key);
    }
  };
}
