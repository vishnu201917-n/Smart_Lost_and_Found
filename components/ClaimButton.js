"use client";

import { useState } from "react";

export default function ClaimButton({ matchId, disabled = false }) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  async function submitClaim(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const proofDescription = form.get("proof_description");

    const response = await fetch("/api/claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        match_id: matchId,
        proof_description: proofDescription
      })
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
      event.target.reset();
      setShowForm(false);
      window.location.reload();
    }
  }

  if (disabled) {
    return <span className="muted">Claim already submitted</span>;
  }

  return (
    <div className="claim-action">
      {!showForm && (
        <button
          className="secondary-button"
          onClick={() => setShowForm(true)}
        >
          Submit Claim
        </button>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={submitClaim}>
          <textarea
            name="proof_description"
            placeholder="Explain how you can identify or prove ownership of this item."
            required
          />
          <div className="button-row">
            <button type="submit">Submit Claim</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && <p className="small success">{message}</p>}
    </div>
  );
}
