import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

describe("service worker cache isolation", () => {
  it("bypasses cross-origin, API, and authorization-bearing requests", () => {
    expect(source).toContain("url.origin === self.location.origin");
    expect(source).toContain('url.pathname.startsWith("/api/")');
    expect(source).toContain('request.headers.has("authorization")');
    expect(source).toContain("if (!isSameOrigin || isApiRequest || hasAuthorization) return;");
  });

  it("rotates the shell cache and deletes older shell caches", () => {
    expect(source).toContain('const CACHE_PREFIX = "aukaaefing-shell-"');
    expect(source).toContain("caches.delete(key)");
  });
});
