import { describe, expect, it } from "vitest";

import { pickRandom, randomIntInclusive, shuffleList } from "./random";

describe("shared/random", () => {
  it("generates deterministic integers with injected randomness", () => {
    expect(randomIntInclusive(2, 5, () => 0)).toBe(2);
    expect(randomIntInclusive(2, 5, () => 0.999)).toBe(5);
  });

  it("picks and shuffles deterministically", () => {
    expect(pickRandom(["a", "b", "c"], () => 0.999)).toBe("c");
    expect(shuffleList(["a", "b", "c"], () => 0.999)).toEqual(["a", "b", "c"]);
  });
});
