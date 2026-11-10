"use client";

import { useState } from "react";
import Nav from "../../components/Nav";

export default function Register() {
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target));

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 700);
    }
  }

  return (
    <>
      <Nav />

      <main>
        <div className="form-card">
          <p className="eyebrow">JOIN THE COMMUNITY</p>
          <h1>Create Student Account</h1>
          <p className="form-intro">
            Create an account to report items and follow possible matches.
          </p>

          <form onSubmit={submit}>
            <label>
              Full Name
              <input name="name" placeholder="Enter your full name" required />
            </label>

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
              Phone
              <input name="phone" placeholder="Optional phone number" />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button>Create Account</button>
          </form>

          {message && <p className="success">{message}</p>}

          <p className="small">
            New registrations are student accounts. Administrator accounts are
            assigned by the project administrator.
          </p>
        </div>
      </main>
    </>
  );
}
