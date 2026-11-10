"use client";

import { useState } from "react";

export default function AdminReportActions({ reportId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide(nextStatus) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId, status: nextStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update report.");
      setStatus(nextStatus);
      setMessage("Student notified.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className={`status ${status === "PENDING" ? "pending" : "approved"}`}>{status}</span>
      {status === "PENDING" && (
        <div className="admin-actions">
          <button disabled={busy} onClick={() => decide("APPROVED")}>Approve</button>
          <button className="secondary-button" disabled={busy} onClick={() => decide("REJECTED")}>Reject</button>
        </div>
      )}
      {message && <p className="small">{message}</p>}
    </div>
  );
}
