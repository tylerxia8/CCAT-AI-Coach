import { describe, expect, it } from "vitest";
import { dueTransfers, scheduleTransfer } from "./transfer-store";

describe("delayed transfer", () => {
  it("returns a learned skill after three days", () => {
    const learned = new Date("2026-07-20T12:00:00Z");
    const items = scheduleTransfer([], "logic", learned);
    expect(dueTransfers(items, new Date("2026-07-22T12:00:00Z"))).toHaveLength(0);
    expect(dueTransfers(items, new Date("2026-07-23T12:00:00Z"))).toHaveLength(1);
  });
});
