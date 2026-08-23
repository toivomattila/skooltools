import { describe, expect, it } from "vitest";
import { validateLaunchUrl } from "./launch";

describe("validateLaunchUrl", () => {
  it("normalizes a public HTTPS URL", () => {
    expect(validateLaunchUrl(" https://Example.com/product#details ")).toEqual({
      ok: true,
      url: "https://example.com/product",
    });
  });

  it("rejects non-HTTPS URLs", () => {
    expect(validateLaunchUrl("http://example.com")).toEqual({
      ok: false,
      error: "Use a direct HTTPS URL.",
    });
  });

  it("rejects credentials and private-looking hosts", () => {
    expect(validateLaunchUrl("https://user:pass@example.com")).toEqual({
      ok: false,
      error: "URLs with usernames or passwords are not allowed.",
    });
    expect(validateLaunchUrl("https://localhost:3000")).toEqual({
      ok: false,
      error: "Use a public website URL, not a local or private address.",
    });
  });
});
