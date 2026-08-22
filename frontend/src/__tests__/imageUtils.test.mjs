import test from "node:test";
import assert from "node:assert/strict";

// Test safe image string sanitization
function getSafeImageSrc(src) {
  if (!src || typeof src !== "string") {
    return "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop";
  }
  const trimmed = src.trim();
  if (!trimmed) {
    return "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop";
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop";
    }
  }
  return "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop";
}

test("getSafeImageSrc Sanitization Tests", async (t) => {
  await t.test("Returns valid absolute HTTPS URL", () => {
    const url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzLah";
    assert.strictEqual(getSafeImageSrc(url), url);
  });

  await t.test("Returns valid base64 data URI", () => {
    const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";
    assert.strictEqual(getSafeImageSrc(dataUri), dataUri);
  });

  await t.test("Returns valid local relative path", () => {
    const local = "/jerseys/retro_barca.png";
    assert.strictEqual(getSafeImageSrc(local), local);
  });

  await t.test("Safely handles error strings without throwing", () => {
    const errorString = "## Error Type Runtime Error Invalid src prop";
    const result = getSafeImageSrc(errorString);
    assert.ok(result.startsWith("https://images.unsplash.com/"));
  });

  await t.test("Safely handles null/undefined and empty strings", () => {
    assert.ok(getSafeImageSrc(null).startsWith("https://images.unsplash.com/"));
    assert.ok(getSafeImageSrc(undefined).startsWith("https://images.unsplash.com/"));
    assert.ok(getSafeImageSrc("   ").startsWith("https://images.unsplash.com/"));
  });
});
