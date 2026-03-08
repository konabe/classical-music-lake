import { expect } from "vitest";

expect.extend({
  toBeUUID(received: string) {
    const pass =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(received);
    return {
      pass,
      message: () => `expected ${received} to${this.isNot ? " not" : ""} be a valid UUID`,
    };
  },
});
