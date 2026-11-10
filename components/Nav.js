"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    window.location.href = "/";
  }

  return (
    <nav>
      <Link href="/" className="brand">
        <span>🔎</span>
        Smart Lost &amp; Found
      </Link>

      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/items">Items</Link>

        {user && (
          <>
            <Link href="/report-lost">Report Lost</Link>
            <Link href="/report-found">Report Found</Link>
            <Link href="/matches">Matches</Link>
            <Link href="/notifications">Notifications</Link>
            <Link href="/saved-searches">Saved Searches</Link>
            <Link href="/item-history">My History</Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <Link href="/admin">Admin</Link>
        )}
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <span className="user-name">
              {user.name} <span className="badge">{user.role}</span>
            </span>
            <button className="nav-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link className="nav-register" href="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
