// Business settings shown on the site and used when pricing a booking.

export const BUSINESS = {
  name: "Delish Town Car",
  email: "delish86@gmail.com",
  phone: "(202) 409-9469",
  phoneE164: "+12024099469",
  airport: "Sea-Tac Airport",
  timeZone: "America/Los_Angeles",
};

export type VehicleId = "sedan" | "suv";

// Photos are representative stock images (Pexels license), not Delish's own cars.
// Sources are listed in README.md.
export const VEHICLES: Record<
  VehicleId,
  { name: string; priceCents: number; maxPassengers: number; blurb: string; photo: string; photoAlt: string }
> = {
  sedan: {
    name: "Sedan",
    priceCents: 11000,
    maxPassengers: 3,
    blurb: "A quiet, comfortable ride for one to three travelers.",
    photo: "/cars/sedan.webp",
    photoAlt: "Black luxury sedan",
  },
  suv: {
    name: "Luxury SUV",
    priceCents: 13500,
    maxPassengers: 6,
    blurb: "Room for families and groups of up to six, with space for more luggage.",
    photo: "/cars/suv.webp",
    photoAlt: "Black luxury SUV",
  },
};

export type Direction = "to_airport" | "from_airport";

export const DIRECTIONS: Record<Direction, { label: string }> = {
  to_airport: { label: "To Sea-Tac Airport" },
  from_airport: { label: "From Sea-Tac Airport" },
};

// Apartment buildings Delish picks up from and drops off at. Same flat prices for each.
export type LocationId = "seattle_house" | "rainier_square";

export const LOCATIONS: Record<LocationId, { name: string; short: string; address: string; area: string; website: string }> = {
  seattle_house: {
    name: "Seattle House",
    short: "Seattle House",
    address: "2340 6th Ave, Seattle, WA 98121",
    area: "Denny Triangle",
    website: "https://www.seattlehouse.com/",
  },
  rainier_square: {
    name: "The Residences @ Rainier Square",
    short: "Rainier Square",
    address: "1340 4th Ave, Seattle, WA 98101",
    area: "Downtown Seattle",
    website: "https://liverainiersquare.com/",
  },
};

export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Where a ride starts and ends, written out for pages and emails.
export function routeFor(
  direction: Direction,
  location: LocationId,
  unit?: string | null,
): { label: string; from: string; to: string } {
  const home = LOCATIONS[location];
  const stop = `${home.name}, ${home.address}${unit ? `, unit ${unit}` : ""}`;
  return direction === "to_airport"
    ? { label: `${home.short} to Sea-Tac`, from: stop, to: BUSINESS.airport }
    : { label: `Sea-Tac to ${home.short}`, from: BUSINESS.airport, to: stop };
}

// Text messages (Twilio) are off for now; turn on once US texting registration is approved.
export const TEXTS_ENABLED = false;

// Earliest a ride can be booked online, in hours from now.
export const MIN_LEAD_HOURS = 2;
// Furthest ahead a ride can be booked online, in days.
export const MAX_ADVANCE_DAYS = 180;
