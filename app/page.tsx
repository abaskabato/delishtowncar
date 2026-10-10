import Link from "next/link";
import { BUSINESS, VEHICLES, type VehicleId } from "@/lib/config";
import { formatMoney } from "@/lib/policy";
import { Badge } from "./components/Logo";

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
            <p className="eyebrow">Seattle House ⇄ Sea-Tac Airport</p>
            <h1>Your private car to the airport, from your front door.</h1>
            <p className="lead">
              A professional driver, a clean luxury vehicle and one flat price each way. Book in a few minutes and pay online.
            </p>
            <div className="hero-actions">
              <Link href="/book" className="btn btn-light">Book your ride</Link>
              <span className="hero-from">Sedan from <strong>{formatMoney(VEHICLES.sedan.priceCents)}</strong></span>
            </div>
          </div>
          <div className="hero-badge">
            <Badge id="hero" size={360} />
          </div>
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
