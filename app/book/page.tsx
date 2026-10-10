import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { BUSINESS, VEHICLES, type VehicleId } from "@/lib/config";
import BookingForm from "./BookingForm";

export const metadata: Metadata = { title: "Book a ride | Delish Town Car" };

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">Book a ride</p>
        <h1 className="page-title">Seattle House ⇄ Sea-Tac</h1>
        <Suspense fallback={<div className="form-card hint">Loading the booking form…</div>}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/book">, "searchParams">) {
  await connection(); // render per request so "today" is current
  const { vehicle, direction } = await searchParams;
  const initialVehicle: VehicleId = vehicle === "suv" ? "suv" : "sedan";

  const square = {
    applicationId: process.env.SQUARE_APPLICATION_ID ?? "",
    locationId: process.env.SQUARE_LOCATION_ID ?? "",
    sandbox: process.env.SQUARE_ENVIRONMENT !== "production",
  };
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS.timeZone }).format(new Date());

  return (
    <BookingForm
      vehicles={VEHICLES}
      initialVehicle={initialVehicle}
      initialDirection={direction === "from_airport" ? "from_airport" : "to_airport"}
      today={today}
      square={square}
      phone={BUSINESS.phone}
    />
  );
}
