function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeCategory(value) {
  const category = normalize(value);
  const aliases = {
    cloths: "clothing",
    clothes: "clothing",
    cloth: "clothing",
    accessory: "accessories",
    electronic: "electronics",
    stationery: "stationery"
  };
  return aliases[category] || category;
}

export function categoriesMatch(a, b) {
  const left = normalizeCategory(a);
  const right = normalizeCategory(b);
  return Boolean(left && right && left === right);
}

export function textSimilarity(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const leftWords = new Set(left.split(" ").filter(Boolean));
  const rightWords = new Set(right.split(" ").filter(Boolean));
  const intersection = [...leftWords].filter((word) => rightWords.has(word)).length;
  const union = new Set([...leftWords, ...rightWords]).size;
  const tokenScore = union ? intersection / union : 0;
  const containsScore = left.includes(right) || right.includes(left) ? 0.85 : 0;
  return Math.max(tokenScore, containsScore);
}

function fieldMatch(a, b) {
  if (!a || !b) return 0;
  return normalize(a) === normalize(b) ? 1 : 0;
}

// Weighted rule-based score: name 40%, category 20%, colour 15%, brand 15%, description 10%.
// A weak item-name similarity is rejected so shared colour/category alone cannot create a match.
export function calculateMatchScore(lost, found) {
  const nameScore = textSimilarity(lost.item_name, found.item_name);
  if (nameScore < 0.5 || !categoriesMatch(lost.category, found.category)) return 0;

  const score =
    nameScore * 0.40 +
    0.20 +
    fieldMatch(lost.color, found.color) * 0.15 +
    fieldMatch(lost.brand, found.brand) * 0.15 +
    textSimilarity(lost.description, found.description) * 0.10;

  return Number(score.toFixed(4));
}
