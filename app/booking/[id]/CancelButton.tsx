"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ id, token, refundLabel }: { id: string; token: string; refundLabel: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "The cancellation didn't go through. Please call us.");
        return;
      }
      router.replace(`/booking/${id}?t=${encodeURIComponent(token)}`);
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <div className="cancel-box">
        <p className="hint">If you cancel now, you get back {refundLabel}.</p>
        <button className="btn btn-outline" onClick={() => setConfirming(true)}>Cancel this ride</button>
      </div>
    );
  }

  return (
    <div className="cancel-box confirm">
      <p>Cancel this ride and refund {refundLabel} to your card? This can&apos;t be undone.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="button-row">
        <button className="btn btn-outline" onClick={() => setConfirming(false)} disabled={busy}>Keep my ride</button>
        <button className="btn btn-danger" onClick={cancel} disabled={busy}>{busy ? "Cancelling…" : "Yes, cancel"}</button>
      </div>
    </div>
  );
}
