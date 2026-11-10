
import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth";
import { pool } from "../../../../lib/db";
import { logActivity } from "../../../../lib/mongo";

export async function POST(req) {
  try {
    const admin = await getUser();

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access only." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const reportId = Number(body.report_id);
    const status = body.status;

    if (!reportId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "A valid report and decision are required." },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();

    let activityDetails = null;

    try {
      await conn.beginTransaction();

      const [reports] = await conn.execute(
        `SELECT
           r.report_id,
           r.found_id,
           r.reported_by,
           r.status,
           f.item_name
         FROM reports r
         JOIN found_items f
           ON f.found_id = r.found_id
         WHERE r.report_id = ?
         FOR UPDATE`,
        [reportId]
      );

      if (!reports.length) {
        await conn.rollback();

        return NextResponse.json(
          { error: "Report not found." },
          { status: 404 }
        );
      }

      const report = reports[0];

      if (report.status !== "PENDING") {
        await conn.rollback();

        return NextResponse.json(
          { error: "This report has already been reviewed." },
          { status: 409 }
        );
      }

      // Update the report decision.
      await conn.execute(
        "UPDATE reports SET status = ? WHERE report_id = ?",
        [status, reportId]
      );

      // If approved, hide the suspicious found listing.
      if (status === "APPROVED") {
        await conn.execute(
          `UPDATE found_items
           SET status = 'UNDER_REVIEW'
           WHERE found_id = ?
             AND status <> 'COLLECTED'`,
          [report.found_id]
        );
      }

      // Notify the student who submitted the report.
      const message =
        status === "APPROVED"
          ? `Your report #${reportId} regarding ${report.item_name} was approved. The listing has been hidden for administrator review.`
          : `Your report #${reportId} regarding ${report.item_name} was rejected by the administrator.`;

      await conn.execute(
        "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        [report.reported_by, message]
      );

      activityDetails = {
        admin_id: admin.id,
        report_id: reportId,
        found_id: report.found_id,
        item_name: report.item_name,
        status,
        affected_user_id: report.reported_by,
        entity_type: "REPORT",
        entity_id: reportId
      };

      await conn.commit();

    } catch (error) {
      await conn.rollback();
      throw error;

    } finally {
      conn.release();
    }

    // Record the decision in MongoDB.
    await logActivity(
      "ITEM_REPORT_REVIEWED",
      activityDetails
    );

    return NextResponse.json({
      message:
        status === "APPROVED"
          ? "Report approved. The found listing has been hidden and the student has been notified."
          : "Report rejected. The listing remains available and the student has been notified."
    });

  } catch (error) {
    console.error("Report review error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
