"use client";

import { useState } from "react";
import Nav from "../../components/Nav";

export default function Login() {
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target));

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/";
    } else {
      setMessage(data.error || "Login failed.");
    }
  }

  return (
    <>
      <Nav />

      <main>
        <div className="form-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Login</h1>
          <p className="form-intro">
            Access your reports, matches, and notifications.
          </p>

          <form onSubmit={submit}>
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </label>

            <button>Login</button>
          </form>

          {message && <p className="error">{message}</p>}
        </div>
      </main>
    </>
  );
}
