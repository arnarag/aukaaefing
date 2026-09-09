import { describe, expect, it } from "vitest";
import { callbackEvidence, callbackHasError, safeLocalRedirect } from "./callback-utils";

describe("auth callback helpers", () => {
  it("allows local callback destinations and rejects external or executable redirects", () => {
    expect(safeLocalRedirect("/stillingar")).toBe("/stillingar");
    expect(safeLocalRedirect("/heim?from=auth")).toBe("/heim?from=auth");
    expect(safeLocalRedirect("https://example.com")).toBe("/leikmenn");
    expect(safeLocalRedirect("//example.com")).toBe("/leikmenn");
    expect(safeLocalRedirect("javascript:alert(1)")).toBe("/leikmenn");
  });

  it("treats callback errors as failures and requires callback evidence", () => {
    const search = new URLSearchParams("error=access_denied&code=ignored");
    const hash = new URLSearchParams();
    expect(callbackHasError(search, hash)).toBe(true);

    const goodSearch = new URLSearchParams("code=pkce-code");
    expect(callbackHasError(goodSearch, hash)).toBe(false);
    expect(callbackEvidence(goodSearch, hash)).toEqual({ code: "pkce-code", accessToken: null });

    const implicitHash = new URLSearchParams("access_token=token-123");
    expect(callbackEvidence(new URLSearchParams(), implicitHash)).toEqual({ code: null, accessToken: "token-123" });
  });
});
