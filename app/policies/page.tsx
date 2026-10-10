import type { Metadata } from "next";
import { BUSINESS, TEXTS_ENABLED } from "@/lib/config";
import { CHAT_ENABLED } from "../components/TawkChat";

export const metadata: Metadata = { title: "Policies | Delish Town Car" };

export default function Policies() {
  return (
    <section className="section">
      <div className="container prose">
        <h1>Policies</h1>

        <h2 id="cancellation">Cancellation and refunds</h2>
        <ul>
          <li><strong>More than 24 hours before pickup:</strong> full refund.</li>
          <li><strong>Within 24 hours of pickup:</strong> 50% refund.</li>
          <li><strong>No-show:</strong> no refund if you aren&apos;t at the pickup point at the booked time.</li>
          <li><strong>If we cancel</strong> because of weather, a vehicle problem or anything else on our side, you get a full refund.</li>
        </ul>
        <p>
          To cancel, use the link in your confirmation email, call {BUSINESS.phone} or email {BUSINESS.email}. Refunds go back to
          the card you paid with and usually show up in 5 to 10 business days.
        </p>

        <h2 id="booking">Booking and payment</h2>
        <p>
          Rides are paid in full by card when you book. Prices are flat per ride, each way: Sedan $110 for up to 3 passengers and
          Luxury SUV $135 for up to 6 passengers. Each passenger may bring one large suitcase and one carry-on. Please be ready at
          the pickup point at your booked time.
        </p>

        <h2 id="privacy">Privacy</h2>
        <p>
          When you book, we collect your name, phone number, email, trip details and flight number. We use them only to run your
          ride and contact you about it. Card details are handled by Square and never stored by us.{TEXTS_ENABLED && " If you opt in to texts, we send booking and ride updates; reply STOP to opt out."} {CHAT_ENABLED && " Our website chat is run by tawk.to; messages you send there are stored by tawk.to so we can reply."} We share your name and pickup details only with your driver. We
          don&apos;t sell your information. To have your data deleted, email {BUSINESS.email}.
        </p>

        <h2 id="terms">Terms</h2>
        <p>
          We aren&apos;t responsible for delays caused by traffic, weather, road closures or other events outside our control. We
          may change prices or service with notice; a booking that&apos;s already paid keeps its price.
        </p>
      </div>
    </section>
  );
}
