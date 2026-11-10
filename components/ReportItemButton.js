"use client";

import { useState } from "react";

export default function ReportItemButton({ foundId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ found_id: foundId, reason })
      });
      const data = await response.json();
      setMessage(data.message || data.error || "Unable to submit report.");
      if (response.ok) {
        setReason("");
        setOpen(false);
      }
    } catch {
      setMessage("Could not submit the report. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="report-item-action">
      {!open ? (
        <button type="button" className="secondary-button" onClick={() => setOpen(true)}>Report this item</button>
      ) : (
        <form onSubmit={submit}>
          <label>
            Why are you reporting this listing?
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} required minLength={5} placeholder="Explain the concern (for example: misleading details, duplicate listing, wrong information, or suspicious ownership). Colour mismatch alone is not automatically a reason to report." />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit report"}</button>
          <button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button>
        </form>
      )}
      {message && <p className="small">{message}</p>}
    </div>
  );
}
