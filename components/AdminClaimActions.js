"use client";

import { useState } from "react";

export default function AdminClaimActions({ claimId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");

  async function review(nextStatus) {
    const response = await fetch("/api/admin/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        claim_id: claimId,
        status: nextStatus
      })
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
      setStatus(nextStatus);
    }
  }

  if (status !== "PENDING") {
    return (
      <span className={`status ${status.toLowerCase()}`}>
        {status}
      </span>
    );
  }

  return (
    <div>
      <div className="button-row">
        <button onClick={() => review("APPROVED")}>
          Approve
        </button>
        <button
          className="danger-button"
          onClick={() => review("REJECTED")}
        >
          Reject
        </button>
      </div>
      {message && <p className="small">{message}</p>}
    </div>
  );
}
