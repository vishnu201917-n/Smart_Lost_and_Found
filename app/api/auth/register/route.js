import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "../../../../lib/db";
import { logActivity } from "../../../../lib/mongo";

export async function POST(req) {
  try {
    const body = await req.json();

    if (
      !body.name ||
      !body.email ||
      !body.password ||
      body.password.length < 6
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email and password (minimum 6 characters) are required."
        },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(body.password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users
       (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, 'STUDENT')`,
      [
        body.name,
        body.email,
        body.phone || null,
        hash
      ]
    );

    await logActivity("USER_REGISTERED", {
      user_id: result.insertId,
      email: body.email
    });

    return NextResponse.json({
      message: "Registration successful. Please login."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.code === "ER_DUP_ENTRY"
            ? "Email already exists."
            : error.message
      },
      { status: 500 }
    );
  }
}
