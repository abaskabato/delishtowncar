import Link from "next/link";
import { BUSINESS, LOCATIONS, LOCATION_IDS, VEHICLES, mapsUrl, type VehicleId } from "@/lib/config";
import { formatMoney } from "@/lib/policy";
import HeroLogoWatcher from "./components/HeroLogoWatcher";
import { Badge } from "./components/Logo";
import Image from "next/image";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Where do you pick up?",
    a: `From ${LOCATIONS.seattle_house.name} (${LOCATIONS.seattle_house.address}) and ${LOCATIONS.rainier_square.name} (${LOCATIONS.rainier_square.address}). Choose your building when you book.`,
  },
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
            <div className="hero-brand" id="hero-brand">
              <Badge id="hero" size={150} />
              <HeroLogoWatcher targetId="hero-brand" />
              <p className="pill">Seattle House · Rainier Square ⇄ Sea-Tac</p>
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
            <label className="field">
              <span>Your building</span>
              <select name="location" defaultValue="seattle_house">
                {LOCATION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {LOCATIONS[id].short} · {LOCATIONS[id].address.split(",")[0]}
                  </option>
                ))}
              </select>
            </label>
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

      <section className="section section-tight" id="pickup-locations">
        <div className="container">
          <h2 className="section-title">Pickup locations</h2>
          <p className="section-lead">We pick you up at your building and bring you back there from Sea-Tac. Same flat price from both.</p>
          <div className="location-grid">
            {LOCATION_IDS.map((id) => {
              const loc = LOCATIONS[id];
              return (
                <article key={id} className="location-card">
                  <span className="location-pin" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
                  </span>
                  <div className="location-body">
                    <p className="location-area">{loc.area}</p>
                    <h3>{loc.name}</h3>
                    <p className="location-address">{loc.address}</p>
                    <div className="location-actions">
                      <Link href={`/book?location=${id}`} className="btn btn-primary btn-small">Book from here</Link>
                      <a href={mapsUrl(loc.address)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-small">View map</a>
                    </div>
                  </div>
                </article>
              );
            })}
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
