import { BUSINESS } from "./config.ts";

const HOUR = 60 * 60 * 1000;

// Refund share for a customer cancellation: full refund more than 24 hours
// before pickup, half within 24 hours, nothing once pickup time has passed (no-show).
export function refundPercent(pickupAt: Date, now: Date = new Date()): 0 | 50 | 100 {
  const hoursLeft = (pickupAt.getTime() - now.getTime()) / HOUR;
  if (hoursLeft > 24) return 100;
  if (hoursLeft > 0) return 50;
  return 0;
}

export function refundCents(amountCents: number, percent: number): number {
  return Math.round((amountCents * percent) / 100);
}

// Offset of the business time zone from UTC at a given instant, in ms (negative for Seattle).
function zoneOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS.timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - at.getTime();
}

// Turns a Seattle wall-clock date ("2026-10-12") and time ("05:30") into an instant.
export function seattleTimeToDate(date: string, time: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  if (+t[1] > 23 || +t[2] > 59) return null;
  const wall = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  // Reject dates like 2026-13-01 or 2026-02-30 that Date.UTC would roll over.
  if (new Date(wall).toISOString().slice(0, 10) !== date) return null;
  let instant = wall - zoneOffsetMs(new Date(wall));
  // Second pass settles times near a daylight-saving switch.
  instant = wall - zoneOffsetMs(new Date(instant));
  const result = new Date(instant);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function formatPickup(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS.timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

// US phone numbers to E.164 (+12065551234). Returns null if it doesn't look like one.
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
