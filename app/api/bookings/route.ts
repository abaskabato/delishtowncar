import { randomBytes } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { VEHICLES, routeFor } from "@/lib/config";
import { db, type Booking } from "@/lib/db";
import { notifyBooked } from "@/lib/notify";
import { formatPickup } from "@/lib/policy";
import { chargeCard, SquarePaymentError } from "@/lib/square";
import { validateBooking } from "@/lib/validate";

// Creates a booking and charges the card in one step.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request." }, { status: 400 });

  const checked = validateBooking(body);
  if (!checked.ok) return Response.json({ error: checked.error }, { status: 400 });
  const b = checked.value;

  const sourceId = typeof body.sourceId === "string" ? body.sourceId : "";
  if (!sourceId) return Response.json({ error: "Enter your card details." }, { status: 400 });

  // Price always comes from the server, never from the form.
  const amountCents = VEHICLES[b.vehicle].priceCents;
  const sql = await db();
  const [booking] = await sql<Booking[]>`
    insert into bookings (cancel_token, direction, location, vehicle, pickup_at, passengers, bags, flight, unit,
                          name, phone, email, notes, sms_opt_in, amount_cents)
    values (${randomBytes(24).toString("base64url")}, ${b.direction}, ${b.location}, ${b.vehicle}, ${b.pickupAt},
            ${b.passengers}, ${b.bags}, ${b.flight}, ${b.unit}, ${b.name}, ${b.phone}, ${b.email},
            ${b.notes}, ${b.smsOptIn}, ${amountCents})
    returning *`;

  try {
    const { paymentId } = await chargeCard({
      sourceId,
      idempotencyKey: booking.id,
      amountCents,
      bookingId: booking.id,
      email: b.email,
      note: `${VEHICLES[b.vehicle].name}, ${routeFor(b.direction, b.location).label}, ${formatPickup(b.pickupAt)}, ${b.name}`,
    });
    const [confirmed] = await sql<Booking[]>`
      update bookings set status = 'confirmed', square_payment_id = ${paymentId}
      where id = ${booking.id} returning *`;

    const manageUrl = `${siteUrl(req)}/booking/${confirmed.id}?t=${confirmed.cancel_token}`;
    after(() => notifyBooked(confirmed, manageUrl));

    return Response.json({ id: confirmed.id, token: confirmed.cancel_token });
  } catch (err) {
    await sql`update bookings set status = 'payment_failed' where id = ${booking.id}`;
    if (err instanceof SquarePaymentError) return Response.json({ error: err.message }, { status: 402 });
    console.error("[bookings] payment error", err);
    return Response.json({ error: "Something went wrong taking the payment. You weren't charged. Please try again or call us." }, { status: 500 });
  }
}

function siteUrl(req: NextRequest): string {
  return process.env.SITE_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;
}
