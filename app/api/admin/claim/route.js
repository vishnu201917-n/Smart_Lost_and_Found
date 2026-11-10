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
    const status = body.status;

    if (!claimId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "A valid claim and decision are required." },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    let affectedUserId = null;

    try {
      await conn.beginTransaction();

      // Lock the claim and identify the found listing connected to it.
      const [claims] = await conn.execute(
        `SELECT c.claim_id, c.user_id, c.status, m.found_id
         FROM claims c
         JOIN matches m ON m.match_id = c.match_id
         WHERE c.claim_id = ?
         FOR UPDATE`,
        [claimId]
      );

      if (!claims.length) {
        await conn.rollback();
        return NextResponse.json({ error: "Claim not found." }, { status: 404 });
      }

      const claim = claims[0];
      affectedUserId = claim.user_id;

      if (claim.status !== "PENDING") {
        await conn.rollback();
        return NextResponse.json(
          { error: "This claim has already been reviewed." },
          { status: 409 }
        );
      }

      // Keep the stored procedure as the primary claim update path.
      try {
        await conn.query("CALL ProcessClaim(?, ?)", [claimId, status]);
      } catch {
        await conn.execute(
          "UPDATE claims SET status = ? WHERE claim_id = ?",
          [status, claimId]
        );
      }

      // An approved item is no longer available to other students.
      // The owner sees the special collection instruction on the Items page.
      if (status === "APPROVED") {
        await conn.execute(
          "UPDATE found_items SET status = 'CLAIMED' WHERE found_id = ?",
          [claim.found_id]
        );
      }

      const message = status === "APPROVED"
        ? `Your ownership claim #${claimId} was approved. Please collect your item from the campus Admin Room.`
        : `Your ownership claim #${claimId} was rejected by the administrator.`;

      await conn.execute(
        "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        [claim.user_id, message]
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    await logActivity("CLAIM_REVIEWED", {
      admin_id: admin.id,
      claim_id: claimId,
      status,
      affected_user_id: affectedUserId,
      entity_type: "CLAIM",
      entity_id: claimId
    });

    return NextResponse.json({
      message: status === "APPROVED"
        ? "Claim approved. The found item is marked as claimed and the student has been notified to collect it from the Admin Room."
        : "Claim rejected. The student has been notified."
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
