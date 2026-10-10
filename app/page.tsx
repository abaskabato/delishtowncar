import Link from "next/link";
import { BUSINESS, VEHICLES, type VehicleId } from "@/lib/config";
import { formatMoney } from "@/lib/policy";
import { Badge } from "./components/Logo";
import Image from "next/image";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is the price really fixed?",
    a: "Yes. The Sedan is $110 and the Luxury SUV is $135 each way, whatever the time, day or traffic. You see the full price before you pay.",
  },
  {
    q: "What if my flight is late?",
    a: "Give us your flight number when you book. Your driver checks your arrival time and adjusts, at no extra charge.",
  },
  {
    q: "Where do I meet my driver at Sea-Tac?",
    a: "Your driver will call or text you after you land to tell you exactly where to meet.",
  },
  {
    q: "How much luggage can I bring?",
    a: "One large suitcase and one carry-on per passenger. If you have more, choose the Luxury SUV or call us.",
  },
  {
    q: "How far ahead do I need to book?",
    a: `Book online at least 2 hours before pickup. For a sooner ride, call ${BUSINESS.phone}.`,
  },
  {
    q: "How do I cancel?",
    a: "Use the link in your confirmation email, or call or email us. More than 24 hours before pickup you get a full refund, within 24 hours a 50% refund, and no refund for a no-show.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-brand">
              <Badge id="hero" size={150} />
              <p className="pill">Seattle House ⇄ Sea-Tac Airport</p>
            </div>
            <h1>Your private car to Sea-Tac, from your front door.</h1>
            <p className="lead">
              A professional driver, a clean black luxury car and one flat price each way. Book in a minute, pay online.
            </p>
            <ul className="hero-points">
              <li>Flat rate, no surge pricing</li>
              <li>Flight tracking on airport pickups</li>
              <li>Full refund up to 24 hours before</li>
            </ul>
          </div>

          {/* Plain GET form so it works before any JavaScript loads; /book picks up the values. */}
          <form action="/book" className="quick-book" aria-label="Start a booking">
            <h2>Book a ride</h2>
            <div className="segmented" role="radiogroup" aria-label="Direction">
              <label>
                <input type="radio" name="direction" value="to_airport" defaultChecked />
                <span>To Sea-Tac</span>
              </label>
              <label>
                <input type="radio" name="direction" value="from_airport" />
                <span>From Sea-Tac</span>
              </label>
            </div>
            <div className="quick-row">
              <label className="field">
                <span>Date</span>
                <input type="date" name="date" />
              </label>
              <label className="field">
                <span>Time</span>
                <input type="time" name="time" />
              </label>
            </div>
            <label className="field">
              <span>Car</span>
              <select name="vehicle" defaultValue="sedan">
                {(Object.keys(VEHICLES) as VehicleId[]).map((id) => (
                  <option key={id} value={id}>
                    {VEHICLES[id].name} · up to {VEHICLES[id].maxPassengers} · {formatMoney(VEHICLES[id].priceCents)}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary btn-block" type="submit">Continue</button>
            <p className="quick-note">One flat price per ride, each way.</p>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Choose your car</h2>
          <div className="vehicle-grid">
            {(Object.keys(VEHICLES) as VehicleId[]).map((id) => {
              const v = VEHICLES[id];
              return (
                <article key={id} className="vehicle-card">
                  <div className="vehicle-photo">
                    <Image src={v.photo} alt={v.photoAlt} fill sizes="(max-width: 760px) 100vw, 540px" />
                  </div>
                  <div className="vehicle-head">
                    <h3>{v.name}</h3>
                    <span className="price">{formatMoney(v.priceCents)}</span>
                  </div>
                  <p className="vehicle-meta">Up to {v.maxPassengers} passengers · flat rate, each way</p>
                  <p>{v.blurb}</p>
                  <Link href={`/book?vehicle=${id}`} className="btn btn-outline">Book the {v.name}</Link>
                </article>
              );
            })}
          </div>
          <p className="photo-note">Photos show the type of vehicle; your car may differ.</p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">How booking works</h2>
          <ol className="steps">
            <li>
              <h3>Pick your trip</h3>
              <p>To the airport or back home, your car, and your pickup date and time.</p>
            </li>
            <li>
              <h3>Pay securely</h3>
              <p>Pay by card through Square. You get a confirmation email right away.</p>
            </li>
            <li>
              <h3>Ride</h3>
              <p>Your driver contacts you before pickup and meets you on time.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container faq-wrap">
          <h2 className="section-title">Questions</h2>
          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="muted">
            Still have a question? Call <a href={`tel:${BUSINESS.phoneE164}`}>{BUSINESS.phone}</a> or email{" "}
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
