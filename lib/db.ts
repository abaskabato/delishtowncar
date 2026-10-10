import postgres from "postgres";
import { SCHEMA } from "./schema.ts";
import type { Direction, LocationId, VehicleId } from "./config.ts";

export type Booking = {
  id: string;
  cancel_token: string;
  status: "pending" | "confirmed" | "cancelled" | "payment_failed";
  direction: Direction;
  location: LocationId;
  vehicle: VehicleId;
  pickup_at: Date;
  passengers: number;
  bags: number;
  flight: string | null;
  unit: string | null;
  name: string;
  phone: string;
  email: string;
  notes: string | null;
  sms_opt_in: boolean;
  amount_cents: number;
  square_payment_id: string | null;
  refund_cents: number | null;
  square_refund_id: string | null;
  created_at: Date;
  cancelled_at: Date | null;
};

const globalForDb = globalThis as unknown as { sql?: postgres.Sql; schemaReady?: Promise<unknown> };

function client(): postgres.Sql {
  if (!globalForDb.sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.sql = postgres(url, { max: 5, prepare: false });
  }
  return globalForDb.sql;
}

// Returns the client after making sure the bookings table exists.
export async function db(): Promise<postgres.Sql> {
  const sql = client();
  globalForDb.schemaReady ??= sql.unsafe(SCHEMA);
  await globalForDb.schemaReady;
  return sql;
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = await db();
  const rows = await sql<Booking[]>`select * from bookings where id = ${id}`;
  return rows[0] ?? null;
}
