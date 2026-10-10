import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BUSINESS, VEHICLES, routeFor } from "@/lib/config";
import { getBooking } from "@/lib/db";
import { formatMoney, formatPickup, refundCents, refundPercent } from "@/lib/policy";
import CancelButton from "./CancelButton";

export const metadata: Metadata = { title: "Your booking | Delish Town Car", robots: { index: false } };

export default function BookingPage(props: PageProps<"/booking/[id]">) {
  return (
    <Suspense fallback={<section className="section"><div className="container narrow hint">Loading your booking…</div></section>}>
      <BookingDetails {...props} />
    </Suspense>
  );
}

async function BookingDetails({ params, searchParams }: PageProps<"/booking/[id]">) {
  const { id } = await params;
  const { t, new: isNew } = await searchParams;
  const booking = await getBooking(id);
  // The token in the link is what proves this is the customer's own booking.
  if (!booking || typeof t !== "string" || t !== booking.cancel_token || booking.status === "pending" || booking.status === "payment_failed") {
    notFound();
  }

  const dir = routeFor(booking.direction, booking.location, booking.unit);
  const percent = refundPercent(booking.pickup_at);
  const cancelled = booking.status === "cancelled";

  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">{cancelled ? "Cancelled" : isNew ? "Booking confirmed" : "Your booking"}</p>
        <h1 className="page-title">
          {cancelled ? "This ride is cancelled." : isNew ? "You're booked. See you soon." : dir.label}
        </h1>
        {!cancelled && isNew && (
          <p className="lead">
            We emailed your confirmation to {booking.email}. Keep it: it has the link back to this page.
          </p>
        )}
        {cancelled && (
          <p className="lead">
            {booking.refund_cents ? `We refunded ${formatMoney(booking.refund_cents)} to your card.` : "This cancellation had no refund."}
          </p>
        )}

        <div className="form-card">
          <dl className="summary">
            <div><dt>Pickup</dt><dd>{formatPickup(booking.pickup_at)}</dd></div>
            <div><dt>From</dt><dd>{dir.from}</dd></div>
            <div><dt>To</dt><dd>{dir.to}</dd></div>
            <div><dt>Vehicle</dt><dd>{VEHICLES[booking.vehicle].name}</dd></div>
            <div><dt>Passengers</dt><dd>{booking.passengers} · {booking.bags} large {booking.bags === 1 ? "suitcase" : "suitcases"}</dd></div>
            {booking.flight && <div><dt>Flight</dt><dd>{booking.flight}</dd></div>}
            <div><dt>Name</dt><dd>{booking.name}</dd></div>
            <div><dt>Booking number</dt><dd className="mono">{booking.id.slice(0, 8).toUpperCase()}</dd></div>
            <div className="total"><dt>Paid</dt><dd>{formatMoney(booking.amount_cents)}</dd></div>
          </dl>

          {!cancelled &&
            (percent > 0 ? (
              <CancelButton id={booking.id} token={t} refundLabel={`${formatMoney(refundCents(booking.amount_cents, percent))} (${percent}%)`} />
            ) : (
              <p className="hint">Pickup time has passed. To change this booking, call {BUSINESS.phone}.</p>
            ))}
        </div>
        <p className="muted">
          Questions or changes? Call <a href={`tel:${BUSINESS.phoneE164}`}>{BUSINESS.phone}</a> or email{" "}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
        </p>
      </div>
    </section>
  );
}
