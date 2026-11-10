"use client";

import { useState } from "react";

export default function AdminCollectionAction({ claimId, itemStatus }) {
  const [status, setStatus] = useState(itemStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function markCollected() {
    if (!window.confirm("Confirm that the student has physically collected this item from the Admin Room?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update collection status.");
      setStatus("COLLECTED");
      setMessage(data.message || "Collection completed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "COLLECTED") {
    return <div><span className="status approved">COLLECTED</span><p className="small">Collection recorded.</p></div>;
  }

  return (
    <div>
      <button disabled={busy} onClick={markCollected}>
        {busy ? "Saving..." : "Mark as collected"}
      </button>
      {message && <p className="small">{message}</p>}
    </div>
  );
}
