import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { getUser } from "../../../lib/auth";
import { logActivity, createSavedSearchAlerts } from "../../../lib/mongo";
import { calculateMatchScore, categoriesMatch } from "../../../lib/matching";

export async function POST(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    if (!body.location_id || !body.item_name || !body.category || !body.date_found) {
      return NextResponse.json({ error: "Location, item name, category and date found are required." }, { status: 400 });
    }

    await conn.beginTransaction();
    const [insertResult] = await conn.execute(
      `INSERT INTO found_items
       (user_id, location_id, item_name, category, color, brand, description, date_found)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, body.location_id, body.item_name, body.category, body.color || null,
       body.brand || null, body.description || null, body.date_found]
    );
    const foundId = insertResult.insertId;
    const foundItem = {
      item_name: body.item_name,
      category: body.category,
      color: body.color || null,
      brand: body.brand || null,
      description: body.description || null
    };

    // Category narrows the candidates; the remaining details determine each score.
    const [candidateLostItems] = await conn.execute(
      `SELECT l.*
       FROM lost_items l
       WHERE l.status = 'OPEN'
         AND l.user_id <> ?
         AND NOT EXISTS (
           SELECT 1
           FROM matches completed_m
           JOIN claims completed_c ON completed_c.match_id = completed_m.match_id
           JOIN found_items completed_f ON completed_f.found_id = completed_m.found_id
           WHERE completed_m.lost_id = l.lost_id
             AND completed_c.status = 'APPROVED'
             AND completed_f.status = 'COLLECTED'
         )`,
      [user.id]
    );

    let matchesCreated = 0;
    for (const lostItem of candidateLostItems) {
      // Treat common category spelling variants (e.g. cloths/clothing) as equivalent.
      if (!categoriesMatch(lostItem.category, foundItem.category)) continue;
      const score = calculateMatchScore(lostItem, foundItem);
      // Require a meaningful name similarity and at least 60% overall similarity.
      if (score < 0.60) continue;

      await conn.execute(
        `INSERT INTO matches (lost_id, found_id, similarity_score, match_status)
         VALUES (?, ?, ?, 'PENDING')`,
        [lostItem.lost_id, foundId, score]
      );
      matchesCreated += 1;
    }

    await conn.commit();
    await logActivity("FOUND_ITEM_REPORTED", {
      user_id: user.id,
      found_id: foundId,
      entity_type: "FOUND_ITEM",
      entity_id: foundId,
      matches: matchesCreated
    });
    await createSavedSearchAlerts({
      found_id: foundId,
      user_id: user.id,
      location_id: Number(body.location_id),
      item_name: body.item_name,
      category: body.category,
      color: body.color || null,
      brand: body.brand || null,
      description: body.description || null
    });

    return NextResponse.json({
      message: `Found item submitted successfully. ${matchesCreated} possible match(es) created.`
    });
  } catch (error) {
    await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
