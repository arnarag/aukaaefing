export const DEFAULT_CALLBACK_PATH = "/leikmenn";

export function safeLocalRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return DEFAULT_CALLBACK_PATH;

  try {
    const base = "https://aukaaefing.local";
    const parsed = new URL(value, base);
    if (parsed.origin !== base) return DEFAULT_CALLBACK_PATH;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_CALLBACK_PATH;
  }
}

export function callbackHasError(search: URLSearchParams, hash: URLSearchParams) {
  return Boolean(search.get("error") || search.get("error_code") || hash.get("error") || hash.get("error_code"));
}

export function callbackEvidence(search: URLSearchParams, hash: URLSearchParams) {
  return {
    code: search.get("code"),
    accessToken: hash.get("access_token"),
  };
}
