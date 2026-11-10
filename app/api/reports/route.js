import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth";
import { pool } from "../../../lib/db";
import { logActivity } from "../../../lib/mongo";

export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Please login first." }, { status: 401 });
    if (user.role !== "STUDENT") return NextResponse.json({ error: "Only students can report an item." }, { status: 403 });

    const body = await req.json();
    const foundId = Number(body.found_id);
    const reason = String(body.reason || "").trim();
    if (!foundId || !reason) {
      return NextResponse.json({ error: "Select an item and provide a reason." }, { status: 400 });
    }

    const [items] = await pool.execute(
      "SELECT found_id, user_id FROM found_items WHERE found_id = ?",
      [foundId]
    );
    if (!items.length) return NextResponse.json({ error: "Found item not found." }, { status: 404 });
    if (Number(items[0].user_id) === Number(user.id)) {
      return NextResponse.json({ error: "You cannot report your own found-item listing." }, { status: 403 });
    }

    const [existing] = await pool.execute(
      "SELECT report_id FROM reports WHERE found_id = ? AND reported_by = ? AND status = 'PENDING'",
      [foundId, user.id]
    );
    if (existing.length) {
      return NextResponse.json({ error: "You already have a pending report for this item." }, { status: 409 });
    }

    const [result] = await pool.execute(
      `INSERT INTO reports (found_id, reported_by, reason, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [foundId, user.id, reason]
    );
    await logActivity("ITEM_REPORTED_FOR_REVIEW", {
      user_id: user.id,
      report_id: result.insertId,
      found_id: foundId,
      entity_type: "REPORT",
      entity_id: result.insertId
    });

    return NextResponse.json({ message: "Report submitted. An administrator will review it." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
