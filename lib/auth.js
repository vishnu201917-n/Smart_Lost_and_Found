import { cookies } from "next/headers";
import crypto from "crypto";

const secret = () =>
  process.env.SESSION_SECRET || "development-secret-change-me";

const sign = (value) =>
  crypto
    .createHmac("sha256", secret())
    .update(value)
    .digest("hex");

export async function setSession(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.user_id,
      name: user.name,
      role: user.role
    })
  ).toString("base64url");

  const value = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set("slf_session", value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });
}

export async function getUser() {
  const cookieStore = await cookies();
  const value = cookieStore.get("slf_session")?.value;

  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || signature !== sign(payload)) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set("slf_session", "", {
    path: "/",
    maxAge: 0
  });
}
