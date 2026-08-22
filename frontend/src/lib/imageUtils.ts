/**
 * Validates and sanitizes image source URLs to prevent Next.js image parsing crashes.
 */
export function getSafeImageSrc(src?: string | null, fallback = "/images/barca-jersey.svg"): string {
  if (!src || typeof src !== "string") {
    return fallback;
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return fallback;
  }

  // Allow internal public paths
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Allow base64 data URIs
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  // Check valid HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return trimmed;
      }
    } catch {
      return fallback;
    }
  }

  // If someone pasted an error or invalid text string
  return fallback;
}
