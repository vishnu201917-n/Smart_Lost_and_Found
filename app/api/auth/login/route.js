import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "../../../../lib/db";
import { setSession } from "../../../../lib/auth";
import { logActivity } from "../../../../lib/mongo";

export async function POST(req) {
  try {
    const body = await req.json();

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [body.email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSession(user);

    await logActivity("USER_LOGIN", {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
