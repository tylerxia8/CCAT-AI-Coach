import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "./security-headers";

describe("security headers", () => {
  it("prevents framing, plugins, and cross-origin form submission", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("form-action 'self'");
  });

  it("allows only the configured persistence service for external connections", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
    expect(CONTENT_SECURITY_POLICY).not.toContain("connect-src *");
  });

  it("includes anti-sniffing, referrer, permissions, and opener protections", () => {
    const headers = new Map(SECURITY_HEADERS.map((header) => [header.key, header.value]));
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});
