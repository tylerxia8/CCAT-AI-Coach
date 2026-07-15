import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("health endpoint", () => {
  it("reports application readiness without exposing secrets", async () => {
    const response = GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body).toMatchObject({ status: "ok", services: { application: "ready" } });
    expect(JSON.stringify(body)).not.toContain("SUPABASE_ANON_KEY");
    expect(Number.isNaN(Date.parse(body.checkedAt))).toBe(false);
  });
});
