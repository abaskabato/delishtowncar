import { DIRECTIONS, LOCATIONS, TEXTS_ENABLED, MAX_ADVANCE_DAYS, MIN_LEAD_HOURS, VEHICLES, type Direction, type LocationId, type VehicleId } from "./config.ts";
import { seattleTimeToDate, toE164 } from "./policy.ts";

export type BookingInput = {
  direction: Direction;
  location: LocationId;
  vehicle: VehicleId;
  pickupAt: Date;
  passengers: number;
  bags: number;
  flight: string | null;
  unit: string | null;
  name: string;
  phone: string;
  email: string;
  notes: string | null;
  smsOptIn: boolean;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Checks a booking request from the form. Returns the cleaned booking or a
// message that tells the customer what to fix.
export function validateBooking(raw: Record<string, unknown>, now: Date = new Date()): { ok: true; value: BookingInput } | { ok: false; error: string } {
  const direction = raw.direction as Direction;
  if (!Object.hasOwn(DIRECTIONS, direction)) return { ok: false, error: "Choose a trip direction." };

  const location = raw.location as LocationId;
  if (typeof location !== "string" || !Object.hasOwn(LOCATIONS, location)) return { ok: false, error: "Choose your pickup building." };

  const vehicle = raw.vehicle as VehicleId;
  if (!Object.hasOwn(VEHICLES, vehicle)) return { ok: false, error: "Choose a vehicle." };
  const max = VEHICLES[vehicle].maxPassengers;

  const pickupAt = seattleTimeToDate(str(raw.date, 10), str(raw.time, 5));
  if (!pickupAt) return { ok: false, error: "Enter a pickup date and time." };
  const hoursAhead = (pickupAt.getTime() - now.getTime()) / 3_600_000;
  if (hoursAhead < MIN_LEAD_HOURS)
    return { ok: false, error: `Online bookings need at least ${MIN_LEAD_HOURS} hours' notice. For a sooner ride, please call us.` };
  if (hoursAhead > MAX_ADVANCE_DAYS * 24) return { ok: false, error: `Rides can be booked up to ${MAX_ADVANCE_DAYS} days ahead.` };

  const passengers = Number(raw.passengers);
  if (!Number.isInteger(passengers) || passengers < 1) return { ok: false, error: "Enter the number of passengers." };
  if (passengers > max)
    return { ok: false, error: `The ${VEHICLES[vehicle].name} seats up to ${max}. Choose the Luxury SUV for larger groups.` };

  const bags = Number(raw.bags);
  if (!Number.isInteger(bags) || bags < 0) return { ok: false, error: "Enter the number of large bags." };
  if (bags > passengers * 2) return { ok: false, error: "That's more luggage than we can carry. Please call us to arrange it." };

  const flight = str(raw.flight, 12).toUpperCase().replace(/\s+/g, "") || null;
  if (direction === "from_airport" && !flight) return { ok: false, error: "Enter your flight number so we can track your arrival." };

  const name = str(raw.name, 80);
  if (name.length < 2) return { ok: false, error: "Enter your name." };
  const phone = str(raw.phone, 30);
  if (!toE164(phone)) return { ok: false, error: "Enter a 10-digit US phone number." };
  const email = str(raw.email, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };

  return {
    ok: true,
    value: {
      direction,
      location,
      vehicle,
      pickupAt,
      passengers,
      bags,
      flight,
      unit: str(raw.unit, 20) || null,
      name,
      phone,
      email,
      notes: str(raw.notes, 500) || null,
      smsOptIn: TEXTS_ENABLED && raw.smsOptIn === true,
    },
  };
}
