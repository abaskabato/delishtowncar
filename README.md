# Delish Town Car

Booking website for Delish Town Car: flat-rate private car service between Seattle House and Sea-Tac Airport.

- **Sedan** $110, up to 3 passengers · **Luxury SUV** $135, up to 6 passengers (each way)
- Customers pay by card through **Square** when they book.
- Cancellation link in every confirmation refunds automatically: full refund more than 24 hours before pickup, 50% within 24 hours, no refund after pickup time (no-show).
- Email alerts (Resend) go to the customer and the owner for every booking and cancellation.
- Text alerts (Twilio) are built but switched off (`TEXTS_ENABLED` in `lib/config.ts`) until US texting registration is done.

Car photos in `public/cars/` are representative stock photos from Pexels (free for commercial use): [sedan](https://www.pexels.com/photo/a-mercedes-benz-s-class-18369292/), [SUV](https://www.pexels.com/photo/black-cadillac-escalade-parked-under-trees-in-fire-zone-23319054/). Replace them with photos of the real cars when available.

Prices, contact details and booking limits live in `lib/config.ts`. The refund rules are in `lib/policy.ts`.

## Run it locally

```bash
docker run -d --name delish-pg -e POSTGRES_PASSWORD=delish -e POSTGRES_DB=delish -p 54329:5432 postgres:17-alpine
cp .env.example .env.local   # then set DATABASE_URL=postgres://postgres:delish@localhost:54329/delish
npm install
npm run dev                  # http://localhost:3000
npm test                     # refund and time-zone rules
```

Without Square keys the site runs, but the payment step says online payment isn't set up. Without Resend or Twilio keys, notifications are skipped and logged.

## Testing payments (Square sandbox)

1. Create an app at developer.squareup.com and copy the **sandbox** Application ID, Access token and Location ID into `.env.local`.
2. Book a ride and pay with Square's test card `4111 1111 1111 1111`, any future expiry, CVV `111`, ZIP `98101`.
3. Open the link on the confirmation page and cancel to test the refund.

## Going live

1. Deploy to Vercel and add a Postgres database (Neon) from the Vercel Marketplace; it sets `DATABASE_URL`.
2. Set the production Square keys and `SQUARE_ENVIRONMENT=production`.
3. Verify the sending domain in Resend and set `RESEND_API_KEY` and `EMAIL_FROM`.
4. Later, for texts: register for US business texting (A2P 10DLC) in Twilio, set the Twilio keys and turn on `TEXTS_ENABLED`.
5. Set `SITE_URL` to the live address.
