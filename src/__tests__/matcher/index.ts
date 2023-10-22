import "vitest";

interface CustomMatchers<R = unknown> {
  toBeArrayOfStrings(): R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// stringの配列かどうかを検証するカスタムマッチャー
export function toBeArrayOfStrings(received: unknown[]) {
  const pass =
    Array.isArray(received) &&
    received.every((item) => typeof item === "string");
  if (pass) {
    return {
      message: () => `Expected [${received}] not to be an array of strings`,
      pass: true,
    };
  } else {
    return {
      message: () => `Expected [${received}] to be an array of strings`,
      pass: false,
    };
  }
}
