import { timingSafeEqual } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { db, getBooking, type Booking } from "@/lib/db";
import { notifyCancelled } from "@/lib/notify";
import { refundCents, refundPercent } from "@/lib/policy";
import { refundPayment, SquarePaymentError } from "@/lib/square";

// Cancels a booking from the link in the confirmation, refunding by the policy.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/cancel">) {
  const { id } = await ctx.params;
  const { token } = ((await req.json().catch(() => ({}))) ?? {}) as { token?: string };

  const booking = await getBooking(id);
  if (!booking || !token || !sameToken(token, booking.cancel_token)) {
    return Response.json({ error: "This cancel link isn't valid. Please call us." }, { status: 404 });
  }
  if (booking.status === "cancelled") return Response.json({ error: "This ride is already cancelled." }, { status: 409 });
  if (booking.status !== "confirmed" || !booking.square_payment_id) {
    return Response.json({ error: "This booking wasn't paid, so there's nothing to cancel." }, { status: 409 });
  }

  const percent = refundPercent(booking.pickup_at);
  if (percent === 0) {
    return Response.json({ error: "Pickup time has passed, so this ride can't be cancelled online. Please call us." }, { status: 409 });
  }
  const amount = refundCents(booking.amount_cents, percent);

  const sql = await db();
  // Claim the booking first so two clicks can't both refund it.
  const claimed = await sql`update bookings set status = 'cancelled', cancelled_at = now()
                            where id = ${id} and status = 'confirmed' returning id`;
  if (claimed.length === 0) return Response.json({ error: "This ride is already cancelled." }, { status: 409 });

  try {
    const { refundId } = await refundPayment({
      paymentId: booking.square_payment_id,
      amountCents: amount,
      idempotencyKey: `refund-${booking.id}`,
      reason: `Customer cancelled (${percent}% refund)`,
    });
    const [cancelled] = await sql<Booking[]>`
      update bookings set refund_cents = ${amount}, square_refund_id = ${refundId}
      where id = ${id} returning *`;
    after(() => notifyCancelled(cancelled, amount));
    return Response.json({ refundCents: amount, percent });
  } catch (err) {
    await sql`update bookings set status = 'confirmed', cancelled_at = null where id = ${id}`;
    console.error("[cancel] refund error", err);
    const message = err instanceof SquarePaymentError ? err.message : "The refund didn't go through.";
    return Response.json({ error: `${message} Your ride is still booked. Please call us to cancel.` }, { status: 502 });
  }
}

function sameToken(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
