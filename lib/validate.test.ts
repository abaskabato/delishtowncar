import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBooking } from "./validate.ts";

const now = new Date("2026-10-12T17:00:00Z");
const base = {
  direction: "to_airport",
  location: "rainier_square",
  vehicle: "sedan",
  date: "2026-10-20",
  time: "06:00",
  passengers: 2,
  bags: 2,
  name: "Test Rider",
  phone: "(206) 555-0100",
  email: "rider@example.com",
};

test("accepts both pickup buildings", () => {
  for (const location of ["seattle_house", "rainier_square"]) {
    const r = validateBooking({ ...base, location }, now);
    assert.ok(r.ok);
    if (r.ok) assert.equal(r.value.location, location);
  }
});

test("rejects a missing or unknown building", () => {
  for (const location of [undefined, "", "space_needle", "toString"]) {
    const r = validateBooking({ ...base, location }, now);
    assert.deepEqual(r, { ok: false, error: "Choose your pickup building." });
  }
});

test("rejects inherited names for direction and vehicle", () => {
  assert.equal(validateBooking({ ...base, direction: "toString" }, now).ok, false);
  assert.equal(validateBooking({ ...base, vehicle: "constructor" }, now).ok, false);
});
