import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TYPES } from "../../scripts/lib/matchups.mjs";

const css = readFileSync("src/styles/tokens.css", "utf8");
const token = (name) => css.match(new RegExp(`--${name}: (#[0-9a-f]{6});`))[1];

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("type badge contrast", () => {
  it.each(TYPES)("%s text meets WCAG AA", (type) => {
    const [, bg, fg] = css.match(
      new RegExp(`\\[data-type="${type}"\\] \\{ --type-bg: (#[0-9a-f]{6}); --type-fg: var\\(--(\\w+)\\)`),
    );
    expect(contrast(bg, token(fg))).toBeGreaterThanOrEqual(4.5);
  });
});
