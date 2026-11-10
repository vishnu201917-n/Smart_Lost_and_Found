import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { getUser } from "../../../lib/auth";
import { logActivity } from "../../../lib/mongo";

export async function POST(req) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const [result] = await pool.execute(
      `INSERT INTO lost_items
       (user_id, location_id, item_name, category, color, brand, description, date_lost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        body.location_id,
        body.item_name,
        body.category,
        body.color || null,
        body.brand || null,
        body.description || null,
        body.date_lost
      ]
    );

    await logActivity("LOST_ITEM_REPORTED", {
      user_id: user.id,
      lost_id: result.insertId,
      entity_type: "LOST_ITEM",
      entity_id: result.insertId
    });

    return NextResponse.json({
      message: "Lost item submitted successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
