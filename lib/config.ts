// Business settings shown on the site and used when pricing a booking.

export const BUSINESS = {
  name: "Delish Town Car",
  email: "delish86@gmail.com",
  phone: "(202) 409-9469",
  phoneE164: "+12024099469",
  home: "Seattle House",
  // https://www.seattlehouse.com/ (Denny Triangle)
  homeAddress: "2340 6th Ave, Seattle, WA 98121",
  airport: "Sea-Tac Airport",
  timeZone: "America/Los_Angeles",
};

export type VehicleId = "sedan" | "suv";

export const VEHICLES: Record<VehicleId, { name: string; priceCents: number; maxPassengers: number; blurb: string }> = {
  sedan: {
    name: "Sedan",
    priceCents: 11000,
    maxPassengers: 3,
    blurb: "A quiet, comfortable ride for one to three travelers.",
  },
  suv: {
    name: "Luxury SUV",
    priceCents: 13500,
    maxPassengers: 6,
    blurb: "Room for families and groups of up to six, with space for more luggage.",
  },
};

export type Direction = "to_airport" | "from_airport";

const HOME_STOP = `${BUSINESS.home}, ${BUSINESS.homeAddress}`;

export const DIRECTIONS: Record<Direction, { label: string; from: string; to: string }> = {
  to_airport: { label: "Seattle House to Sea-Tac", from: HOME_STOP, to: BUSINESS.airport },
  from_airport: { label: "Sea-Tac to Seattle House", from: BUSINESS.airport, to: HOME_STOP },
};

// Text messages (Twilio) are off for now; turn on once US texting registration is approved.
export const TEXTS_ENABLED = false;

// Earliest a ride can be booked online, in hours from now.
export const MIN_LEAD_HOURS = 2;
// Furthest ahead a ride can be booked online, in days.
export const MAX_ADVANCE_DAYS = 180;
