import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth";
import { pool } from "../../../../lib/db";
import { logActivity } from "../../../../lib/mongo";

export async function POST(req) {
  try {
    const admin = await getUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access only." }, { status: 403 });
    }

    const body = await req.json();
    const claimId = Number(body.claim_id);
    if (!claimId) {
      return NextResponse.json({ error: "A valid claim ID is required." }, { status: 400 });
    }

    const conn = await pool.getConnection();
    let collectionEvent = null;

    try {
      await conn.beginTransaction();

      const [rows] = await conn.execute(
        `SELECT c.claim_id, c.user_id AS claimant_id, c.status AS claim_status,
                m.found_id, f.item_name, f.status AS item_status
         FROM claims c
         JOIN matches m ON m.match_id = c.match_id
         JOIN found_items f ON f.found_id = m.found_id
         WHERE c.claim_id = ?
         FOR UPDATE`,
        [claimId]
      );

      if (!rows.length) {
        await conn.rollback();
        return NextResponse.json({ error: "Claim not found." }, { status: 404 });
      }

      const claim = rows[0];
      if (claim.claim_status !== "APPROVED") {
        await conn.rollback();
        return NextResponse.json({ error: "Only approved claims can be marked as collected." }, { status: 409 });
      }
      if (claim.item_status === "COLLECTED") {
        await conn.rollback();
        return NextResponse.json({ error: "This item has already been marked as collected." }, { status: 409 });
      }
      if (claim.item_status !== "CLAIMED") {
        await conn.rollback();
        return NextResponse.json({ error: "This item is not in the approved collection state." }, { status: 409 });
      }

      await conn.execute(
        "UPDATE found_items SET status = 'COLLECTED' WHERE found_id = ?",
        [claim.found_id]
      );
      await conn.execute(
        "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        [claim.claimant_id, `Your ${claim.item_name} has been marked as collected. Thank you for confirming collection from the Admin Room.`]
      );

      collectionEvent = {
        admin_id: admin.id,
        claim_id: claim.claim_id,
        found_id: claim.found_id,
        affected_user_id: claim.claimant_id,
        item_name: claim.item_name,
        entity_type: "FOUND_ITEM",
        entity_id: claim.found_id,
        status: "COLLECTED"
      };

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await logActivity("ITEM_COLLECTED", collectionEvent);

    return NextResponse.json({
      message: "Item marked as collected. It has been removed from active listings and the student has been notified."
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
