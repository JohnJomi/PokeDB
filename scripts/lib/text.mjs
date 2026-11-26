/** Cleans flavour text: soft hyphens, line breaks, form feeds and extra spaces. */
export function cleanText(text) {
  return text
    .replace(/­\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(identifier) {
  return identifier
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
