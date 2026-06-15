import { vi } from "vitest";

const asyncStorage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    clear: vi.fn((): Promise<void> => {
      asyncStorage.clear();
      return Promise.resolve();
    }),
    getItem: vi.fn((key: string): Promise<string | null> =>
      Promise.resolve(asyncStorage.get(key) ?? null)
    ),
    removeItem: vi.fn((key: string): Promise<void> => {
      asyncStorage.delete(key);
      return Promise.resolve();
    }),
    setItem: vi.fn((key: string, value: string): Promise<void> => {
      asyncStorage.set(key, value);
      return Promise.resolve();
    })
  }
}));

vi.mock("expo-crypto", () => ({
  randomUUID: () => "018f5c25-0678-7c40-a071-054a5a7f2b99",
}));
