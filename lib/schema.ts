// Bookings table. Applied automatically on first use (see lib/db.ts).
export const SCHEMA = `
create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  cancel_token      text not null,
  -- pending (card not charged yet) | confirmed | cancelled | payment_failed
  status            text not null default 'pending',
  direction         text not null check (direction in ('to_airport', 'from_airport')),
  vehicle           text not null check (vehicle in ('sedan', 'suv')),
  pickup_at         timestamptz not null,
  passengers        int not null,
  bags              int not null,
  flight            text,
  unit              text,
  name              text not null,
  phone             text not null,
  email             text not null,
  notes             text,
  sms_opt_in        boolean not null default false,
  amount_cents      int not null,
  square_payment_id text,
  refund_cents      int,
  square_refund_id  text,
  created_at        timestamptz not null default now(),
  cancelled_at      timestamptz
);

create index if not exists bookings_pickup_at_idx on bookings (pickup_at);
`;
