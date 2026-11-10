"use client";

import { useState } from "react";
import Nav from "../../components/Nav";
import LocationPicker from "../../components/LocationPicker";

export default function ReportItem() {
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    const response = await fetch("/api/found", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.target))
      )
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
      event.target.reset();
    }
  }

  return (
    <>
      <Nav />

      <main>
        <div className="form-card wide-form">
          <p className="eyebrow">ITEM REPORT</p>
          <h1>Report a Found Item</h1>
          <p className="form-intro">
            Provide as many details as possible to help identify the item.
          </p>

          <form onSubmit={submit} className="two-column-form">
            <LocationPicker />

            <label>
              Item Name
              <input name="item_name" placeholder="Example: Black Wallet" required />
            </label>

            <label>
              Category
              <input name="category" placeholder="Example: Accessories" required />
            </label>

            <label>
              Color
              <input name="color" placeholder="Example: Black" />
            </label>

            <label>
              Brand
              <input name="brand" placeholder="Optional brand" />
            </label>

            <label>
              Date Found
              <input name="date_found" type="date" required />
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                placeholder="Add useful identifying details about the item"
              />
            </label>

            <div className="full-width">
              <button>Submit Found Item</button>
            </div>
          </form>

          {message && <p className="success">{message}</p>}
        </div>
      </main>
    </>
  );
}
