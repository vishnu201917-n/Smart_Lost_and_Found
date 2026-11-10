import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth";
import { pool } from "../../../lib/db";
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

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit claims." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const matchId = Number(body.match_id);
    const proof = body.proof_description?.trim();

    if (!matchId || !proof) {
      return NextResponse.json(
        { error: "Match and proof description are required." },
        { status: 400 }
      );
    }

    // A student can claim only a match connected to their own lost item.
    const [matches] = await pool.execute(
      `SELECT m.match_id
       FROM matches m
       JOIN lost_items l ON m.lost_id = l.lost_id
       WHERE m.match_id = ? AND l.user_id = ?`,
      [matchId, user.id]
    );

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "You can only claim matches for your own lost items." },
        { status: 403 }
      );
    }

    const [existing] = await pool.execute(
      "SELECT claim_id FROM claims WHERE match_id = ? AND user_id = ?",
      [matchId, user.id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "You have already submitted a claim for this match." },
        { status: 409 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO claims
       (match_id, user_id, proof_description, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [matchId, user.id, proof]
    );

    await logActivity("CLAIM_SUBMITTED", {
      user_id: user.id,
      claim_id: result.insertId,
      match_id: matchId,
      entity_type: "CLAIM",
      entity_id: result.insertId
    });

    return NextResponse.json({
      message: "Claim submitted successfully. An administrator will review it."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
