"use client";

import { useEffect, useState } from "react";

export default function LocationPicker() {
  const [locations, setLocations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/locations")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load locations.");
        return data.locations || [];
      })
      .then((rows) => {
        if (active) setLocations(rows);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="full-width location-picker">
      <div className="location-picker-heading">
        <div>
          <strong>Choose a campus location</strong>
          <p className="small">Select the place where the item was lost or found.</p>
        </div>
        <span className="location-count">
          {loading ? "Loading…" : `${locations.length} available`}
        </span>
      </div>

      {loading ? (
        <p className="muted">Loading campus locations…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : locations.length === 0 ? (
        <p className="empty-state">
          No locations are available yet. Ask the administrator to add locations
          to the locations table in MySQL.
        </p>
      ) : (
        <>
          <div className="location-list" role="group" aria-label="Available locations">
            {locations.map((location) => (
              <button
                type="button"
                key={location.location_id}
                className={`location-option ${String(selectedId) === String(location.location_id) ? "selected" : ""}`}
                aria-pressed={String(selectedId) === String(location.location_id)}
                onClick={() => setSelectedId(String(location.location_id))}
              >
                <span className="location-id">ID {location.location_id}</span>
                <span className="location-name">{location.location_name}</span>
                {String(selectedId) === String(location.location_id) && (
                  <span className="location-selected">Selected</span>
                )}
              </button>
            ))}
          </div>
          <input type="hidden" name="location_id" value={selectedId} />
          {!selectedId && <p className="small muted">Choose one location to continue.</p>}
        </>
      )}
    </div>
  );
}
