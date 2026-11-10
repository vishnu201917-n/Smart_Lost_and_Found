import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const [locations] = await pool.execute(
      "SELECT location_id, location_name FROM locations ORDER BY location_id"
    );

    return NextResponse.json({ locations });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load campus locations. Please try again." },
      { status: 500 }
    );
  }
}
