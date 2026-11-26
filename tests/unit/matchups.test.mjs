import { describe, expect, it } from "vitest";
import { matchupsFor, TYPES } from "../../scripts/lib/matchups.mjs";

const neutral = () =>
  Object.fromEntries(TYPES.map((a) => [a, Object.fromEntries(TYPES.map((d) => [d, 1]))]));

describe("matchupsFor", () => {
  it("multiplies both defending types and omits 1x", () => {
    const chart = neutral();
    chart.rock.fire = 2;
    chart.rock.flying = 2;
    chart.ground.fire = 2;
    chart.ground.flying = 0;
    chart.water.fire = 2;
    expect(matchupsFor(chart, ["fire", "flying"])).toEqual({ rock: 4, ground: 0, water: 2 });
  });
});
