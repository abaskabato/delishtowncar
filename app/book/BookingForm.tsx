"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DIRECTIONS, TEXTS_ENABLED, type Direction, type VEHICLES, type VehicleId } from "@/lib/config";

type Vehicles = typeof VEHICLES;
type SquareConfig = { applicationId: string; locationId: string; sandbox: boolean };

type SquareCard = {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
  destroy(): Promise<void>;
};
declare global {
  interface Window {
    Square?: { payments(appId: string, locationId: string): { card(): Promise<SquareCard> } };
  }
}

const STEPS = ["Trip", "Your details", "Pay"] as const;

const money = (cents: number) => `$${(cents / 100).toFixed(0)}`;

function loadSquare(sandbox: boolean): Promise<void> {
  if (window.Square) return Promise.resolve();
  const src = sandbox ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js";
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the card form."));
    document.head.appendChild(s);
  });
}

export default function BookingForm(props: {
  vehicles: Vehicles;
  initialVehicle: VehicleId;
  initialDirection: Direction;
  today: string;
  square: SquareConfig;
  phone: string;
}) {
  const { vehicles, square } = props;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    direction: props.initialDirection,
    vehicle: props.initialVehicle,
    date: "",
    time: "",
    passengers: 1,
    bags: 1,
    flight: "",
    unit: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
    smsOptIn: TEXTS_ENABLED,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const vehicle = vehicles[form.vehicle];
  // Switching cars keeps the passenger count within the new car's seats.
  const chooseVehicle = (id: VehicleId) =>
    setForm((f) => {
      const passengers = Math.min(f.passengers, vehicles[id].maxPassengers);
      return { ...f, vehicle: id, passengers, bags: Math.min(f.bags, passengers * 2) };
    });
  const toAirport = form.direction === "to_airport";

  const cardRef = useRef<SquareCard | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const paymentsConfigured = Boolean(square.applicationId && square.locationId);

  useEffect(() => {
    if (step !== 2 || !paymentsConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        await loadSquare(square.sandbox);
        const card = await window.Square!.payments(square.applicationId, square.locationId).card();
        if (cancelled) return card.destroy();
        await card.attach("#card-container");
        cardRef.current = card;
        setCardReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load the card form.");
      }
    })();
    return () => {
      cancelled = true;
      cardRef.current?.destroy();
      cardRef.current = null;
      setCardReady(false);
    };
  }, [step, paymentsConfigured, square]);

  function next(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (step === 0 && !toAirport && !form.flight.trim()) {
      setError("Enter your flight number so we can track your arrival.");
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cardRef.current) return;
    setBusy(true);
    setError("");
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setError(result.errors?.[0]?.message ?? "Check your card details and try again.");
        return;
      }
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sourceId: result.token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again or call us.");
        return;
      }
      router.push(`/booking/${data.id}?t=${encodeURIComponent(data.token)}&new=1`);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const route = DIRECTIONS[form.direction];

  return (
    <div className="booking">
      <ol className="stepper" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "current" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
            <span>{i + 1}</span> {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form onSubmit={next} className="form-card">
          <fieldset>
            <legend>Direction</legend>
            <div className="choice-row">
              {(Object.keys(DIRECTIONS) as Direction[]).map((d) => (
                <label key={d} className={`choice ${form.direction === d ? "selected" : ""}`}>
                  <input type="radio" name="direction" id={`direction-${d}`} checked={form.direction === d} onChange={() => set("direction", d)} />
                  <span className="choice-title">{DIRECTIONS[d].label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Vehicle</legend>
            <div className="choice-row">
              {(Object.keys(vehicles) as VehicleId[]).map((id) => (
                <label key={id} className={`choice ${form.vehicle === id ? "selected" : ""}`}>
                  <input type="radio" name="vehicle" id={`vehicle-${id}`} checked={form.vehicle === id} onChange={() => chooseVehicle(id)} />
                  <span className="choice-photo">
                    <Image src={vehicles[id].photo} alt={vehicles[id].photoAlt} fill sizes="(max-width: 760px) 90vw, 320px" />
                  </span>
                  <span className="choice-title">{vehicles[id].name}</span>
                  <span className="choice-meta">Up to {vehicles[id].maxPassengers} passengers</span>
                  <span className="choice-price">{money(vehicles[id].priceCents)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field-row">
            <label className="field">
              <span>Pickup date</span>
              <input id="date" type="date" required min={props.today} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <label className="field">
              <span>{toAirport ? "Pickup time" : "Flight arrival time"}</span>
              <input id="time" type="time" required value={form.time} onChange={(e) => set("time", e.target.value)} />
            </label>
          </div>
          <p className="hint">Seattle time. {toAirport ? "This is when your driver picks you up at Seattle House, 2340 6th Ave." : "Your driver tracks your flight and meets you after you land."}</p>

          <div className="field-row">
            <label className="field">
              <span>Passengers</span>
              <select id="passengers" value={form.passengers} onChange={(e) => { const n = Number(e.target.value); setForm((f) => ({ ...f, passengers: n, bags: Math.min(f.bags, n * 2) })); }}>
                {Array.from({ length: vehicle.maxPassengers }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Large suitcases</span>
              <select id="bags" value={form.bags} onChange={(e) => set("bags", Number(e.target.value))}>
                {Array.from({ length: form.passengers * 2 + 1 }, (_, i) => i).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Flight number {toAirport && <em>(optional)</em>}</span>
              <input id="flight" placeholder="AS 1234" value={form.flight} required={!toAirport} onChange={(e) => set("flight", e.target.value)} />
            </label>
            <label className="field">
              <span>Apartment / unit <em>(optional)</em></span>
              <input id="unit" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
            </label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit">Continue</button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={next} className="form-card">
          <label className="field">
            <span>Full name</span>
            <input id="name" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Mobile phone</span>
              <input id="phone" type="tel" required autoComplete="tel" placeholder="(206) 555-0100" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Notes for your driver <em>(optional)</em></span>
            <textarea id="notes" rows={3} placeholder="Car seat, extra stop, special luggage…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
          {TEXTS_ENABLED && (
          <label className="check">
            <input id="smsOptIn" type="checkbox" checked={form.smsOptIn} onChange={(e) => set("smsOptIn", e.target.checked)} />
            <span>Text me my booking confirmation and ride updates. Message rates may apply. Reply STOP to opt out.</span>
          </label>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          <div className="button-row">
            <button type="button" className="btn btn-outline" onClick={() => { setError(""); setStep(0); }}>Back</button>
            <button className="btn btn-primary" type="submit">Review &amp; pay</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={pay} className="form-card">
          <dl className="summary">
            <div><dt>Trip</dt><dd>{route.label}</dd></div>
            <div><dt>Pickup</dt><dd>{form.date} at {form.time} (Seattle time)</dd></div>
            <div><dt>Vehicle</dt><dd>{vehicle.name}</dd></div>
            <div><dt>Passengers</dt><dd>{form.passengers} · {form.bags} large {form.bags === 1 ? "suitcase" : "suitcases"}</dd></div>
            {form.flight && <div><dt>Flight</dt><dd>{form.flight.toUpperCase()}</dd></div>}
            <div><dt>Contact</dt><dd>{form.name} · {form.phone} · {form.email}</dd></div>
            <div className="total"><dt>Total</dt><dd>{money(vehicle.priceCents)}</dd></div>
          </dl>

          {paymentsConfigured ? (
            <div id="card-container" className="card-container" />
          ) : (
            <p className="error">Online payment isn&apos;t set up yet. Please call {props.phone} to book.</p>
          )}

          <p className="hint">
            Full refund if you cancel more than 24 hours before pickup, 50% within 24 hours, no refund for a no-show.
          </p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="button-row">
            <button type="button" className="btn btn-outline" onClick={() => { setError(""); setStep(1); }} disabled={busy}>Back</button>
            <button className="btn btn-primary" type="submit" disabled={!cardReady || busy}>
              {busy ? "Paying…" : `Pay ${money(vehicle.priceCents)} and book`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
