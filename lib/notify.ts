// Email through Resend and text messages through Twilio.
// Each one is skipped (with a log line) when its keys aren't set, so a booking
// never fails because a notification couldn't be sent.
import { BUSINESS, TEXTS_ENABLED, VEHICLES, routeFor } from "./config.ts";
import type { Booking } from "./db.ts";
import { formatMoney, formatPickup, toE164 } from "./policy.ts";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[notify] email skipped (RESEND_API_KEY / EMAIL_FROM not set): "${subject}" to ${to}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, reply_to: BUSINESS.email }),
  });
  if (!res.ok) console.error(`[notify] email failed (${res.status}): ${await res.text()}`);
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!TEXTS_ENABLED) return;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const toNumber = toE164(to);
  if (!sid || !token || !from) {
    console.warn(`[notify] text skipped (Twilio keys not set): to ${to}`);
    return;
  }
  if (!toNumber) {
    console.warn(`[notify] text skipped (not a US number): ${to}`);
    return;
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: toNumber, From: from, Body: body }),
  });
  if (!res.ok) console.error(`[notify] text failed (${res.status}): ${await res.text()}`);
}

function ownerEmail(): string {
  return process.env.OWNER_EMAIL ?? BUSINESS.email;
}
function ownerPhone(): string {
  return process.env.OWNER_PHONE ?? BUSINESS.phoneE164;
}

function tripRows(b: Booking): [string, string][] {
  const dir = routeFor(b.direction, b.location, b.unit);
  return [
    ["Pickup", formatPickup(b.pickup_at)],
    ["From", dir.from],
    ["To", dir.to],
    ["Vehicle", VEHICLES[b.vehicle].name],
    ["Passengers", String(b.passengers)],
    ["Large bags", String(b.bags)],
    ...(b.flight ? ([["Flight", b.flight]] as [string, string][]) : []),
    ["Name", b.name],
    ["Phone", b.phone],
    ["Email", b.email],
    ...(b.notes ? ([["Notes", b.notes]] as [string, string][]) : []),
  ];
}

function layout(title: string, intro: string, rows: [string, string][], footer: string): string {
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#8a7a5f;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1b1712">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;background:#f3ecdd">
  <div style="font-size:22px;letter-spacing:4px;color:#8a6a22;font-weight:bold">DELISH</div>
  <div style="font-size:11px;letter-spacing:5px;color:#8e1b26;border-top:1px solid #8e1b26;padding-top:4px;margin-bottom:24px">TOWN CAR</div>
  <h1 style="font-size:20px;color:#1b1712;margin:0 0 8px">${esc(title)}</h1>
  <p style="font-family:Arial,sans-serif;font-size:14px;color:#3b332a;line-height:1.5">${intro}</p>
  <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;margin:16px 0">${table}</table>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#3b332a;line-height:1.5">${footer}</p>
  <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a7a5f">${esc(BUSINESS.name)} · ${esc(BUSINESS.phone)} · ${esc(BUSINESS.email)}</p>
</div>`;
}

export async function notifyBooked(b: Booking, manageUrl: string): Promise<void> {
  const when = formatPickup(b.pickup_at);
  const total = formatMoney(b.amount_cents);
  const route = routeFor(b.direction, b.location).label;

  const customerHtml = layout(
    "Your ride is booked",
    `Thanks, ${esc(b.name.split(" ")[0])}. We charged <strong>${total}</strong> to your card. Your driver will contact you before pickup.`,
    [...tripRows(b), ["Paid", total]],
    `Need to cancel? Use this link: <a href="${esc(manageUrl)}">${esc(manageUrl)}</a><br>
     Full refund if you cancel more than 24 hours before pickup, 50% within 24 hours, no refund for a no-show.`,
  );
  const ownerHtml = layout(`New booking: ${when}`, `${esc(route)}, paid ${total}.`, tripRows(b), `Booking page: ${esc(manageUrl)}`);

  await Promise.allSettled([
    sendEmail(b.email, `Booked: ${route}, ${when}`, customerHtml),
    sendEmail(ownerEmail(), `New booking: ${when} (${VEHICLES[b.vehicle].name})`, ownerHtml),
    sendSms(
      ownerPhone(),
      `New Delish booking: ${route}, ${when}. ${VEHICLES[b.vehicle].name}, ${b.passengers} pax${b.flight ? `, flight ${b.flight}` : ""}. ${b.name} ${b.phone}. Paid ${total}.`,
    ),
    b.sms_opt_in
      ? sendSms(b.phone, `Delish Town Car: your ride is booked for ${when} (${route}). Manage or cancel: ${manageUrl}`)
      : Promise.resolve(),
  ]);
}

export async function notifyCancelled(b: Booking, refundCents: number): Promise<void> {
  const when = formatPickup(b.pickup_at);
  const refund = formatMoney(refundCents);
  const route = routeFor(b.direction, b.location).label;
  const refundLine =
    refundCents > 0
      ? `We refunded <strong>${refund}</strong> to your card. It usually shows up in 5 to 10 business days.`
      : "This cancellation wasn't eligible for a refund.";

  await Promise.allSettled([
    sendEmail(b.email, `Cancelled: ${route}, ${when}`, layout("Your ride is cancelled", refundLine, tripRows(b), "Questions? Reply to this email or call us.")),
    sendEmail(
      ownerEmail(),
      `Cancelled: ${when} (${VEHICLES[b.vehicle].name})`,
      layout(`Booking cancelled: ${when}`, `Refunded ${refund} of ${formatMoney(b.amount_cents)}.`, tripRows(b), ""),
    ),
    sendSms(ownerPhone(), `Delish booking CANCELLED: ${route}, ${when}. ${b.name} ${b.phone}. Refunded ${refund}.`),
    b.sms_opt_in
      ? sendSms(b.phone, `Delish Town Car: your ride on ${when} is cancelled. Refund: ${refund}.`)
      : Promise.resolve(),
  ]);
}
