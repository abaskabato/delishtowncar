// Square Payments and Refunds over the REST API.
// Docs: https://developer.squareup.com/reference/square/payments-api

const BASE =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

type SquareError = { category: string; code: string; detail?: string };

export class SquarePaymentError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

async function call<T>(endpoint: string, body: unknown): Promise<T> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new SquarePaymentError("Online payment isn't set up yet (SQUARE_ACCESS_TOKEN is missing).");
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { errors?: SquareError[] };
  if (!res.ok || data.errors?.length) {
    const err = data.errors?.[0];
    throw new SquarePaymentError(cardMessage(err), err?.code);
  }
  return data;
}

// Plain-language messages for the card errors customers hit most.
function cardMessage(err?: SquareError): string {
  switch (err?.code) {
    case "CARD_DECLINED":
    case "GENERIC_DECLINE":
      return "Your card was declined. Try another card or contact your bank.";
    case "INSUFFICIENT_FUNDS":
      return "Your card was declined for insufficient funds. Try another card.";
    case "CVV_FAILURE":
      return "The security code (CVV) didn't match. Check it and try again.";
    case "ADDRESS_VERIFICATION_FAILURE":
    case "INVALID_POSTAL_CODE":
      return "The ZIP code didn't match your card. Check it and try again.";
    case "INVALID_EXPIRATION":
    case "CARD_EXPIRED":
      return "The card's expiration date isn't valid. Check it and try again.";
    default:
      return err?.detail ?? "The payment didn't go through. Please try again or call us.";
  }
}

export async function chargeCard(input: {
  sourceId: string;
  idempotencyKey: string;
  amountCents: number;
  bookingId: string;
  note: string;
  email: string;
}): Promise<{ paymentId: string }> {
  const data = await call<{ payment: { id: string; status: string } }>("/v2/payments", {
    source_id: input.sourceId,
    idempotency_key: input.idempotencyKey,
    amount_money: { amount: input.amountCents, currency: "USD" },
    location_id: process.env.SQUARE_LOCATION_ID,
    autocomplete: true,
    reference_id: input.bookingId,
    note: input.note.slice(0, 500),
    buyer_email_address: input.email,
  });
  if (data.payment.status !== "COMPLETED") {
    throw new SquarePaymentError("The payment didn't go through. Please try again or call us.");
  }
  return { paymentId: data.payment.id };
}

export async function refundPayment(input: {
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
  reason: string;
}): Promise<{ refundId: string }> {
  const data = await call<{ refund: { id: string } }>("/v2/refunds", {
    payment_id: input.paymentId,
    idempotency_key: input.idempotencyKey,
    amount_money: { amount: input.amountCents, currency: "USD" },
    reason: input.reason.slice(0, 192),
  });
  return { refundId: data.refund.id };
}
