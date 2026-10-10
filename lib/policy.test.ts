import { test } from "node:test";
import assert from "node:assert/strict";
import { refundPercent, refundCents, seattleTimeToDate, toE164 } from "./policy.ts";

const pickup = new Date("2026-10-20T12:00:00Z");
const hoursBefore = (h: number) => new Date(pickup.getTime() - h * 3600_000);

test("full refund more than 24 hours before pickup", () => {
  assert.equal(refundPercent(pickup, hoursBefore(48)), 100);
  assert.equal(refundPercent(pickup, hoursBefore(24.01)), 100);
});

test("half refund within 24 hours", () => {
  assert.equal(refundPercent(pickup, hoursBefore(24)), 50);
  assert.equal(refundPercent(pickup, hoursBefore(1)), 50);
});

test("no refund at or after pickup time", () => {
  assert.equal(refundPercent(pickup, hoursBefore(0)), 0);
  assert.equal(refundPercent(pickup, hoursBefore(-2)), 0);
});

test("refund amounts", () => {
  assert.equal(refundCents(11000, 100), 11000);
  assert.equal(refundCents(13500, 50), 6750);
  assert.equal(refundCents(13500, 0), 0);
});

test("Seattle wall time converts across daylight saving", () => {
  // PDT (UTC-7) in summer, PST (UTC-8) in winter.
  assert.equal(seattleTimeToDate("2026-07-01", "05:30")?.toISOString(), "2026-07-01T12:30:00.000Z");
  assert.equal(seattleTimeToDate("2026-12-01", "05:30")?.toISOString(), "2026-12-01T13:30:00.000Z");
  assert.equal(seattleTimeToDate("2026-13-01", "05:30"), null);
  assert.equal(seattleTimeToDate("2026-12-01", "5pm"), null);
});

test("phone numbers", () => {
  assert.equal(toE164("(202) 409-9469"), "+12024099469");
  assert.equal(toE164("1-206-555-0100"), "+12065550100");
  assert.equal(toE164("555-0100"), null);
});
