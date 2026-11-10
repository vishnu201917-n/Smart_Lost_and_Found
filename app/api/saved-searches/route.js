import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth";
import { getMongoDb, logActivity } from "../../../lib/mongo";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please login first." }, { status: 401 });
  try {
    const db = await getMongoDb();
    if (!db) return NextResponse.json({ searches: [], warning: "MongoDB is not configured." });
    const searches = await db.collection("saved_searches")
      .find({ userId: user.id }).sort({ createdAt: -1 }).toArray();
    const alerts = await db.collection("saved_search_alerts")
      .find({ userId: user.id }).sort({ createdAt: -1 }).limit(20).toArray();
    return NextResponse.json({ searches, alerts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please login first." }, { status: 401 });
  try {
    const body = await req.json();
    const search = {
      userId: user.id,
      label: String(body.label || "").trim().slice(0, 80),
      category: String(body.category || "").trim(),
      color: String(body.color || "").trim(),
      keyword: String(body.keyword || "").trim(),
      locationId: body.locationId ? Number(body.locationId) : null,
      createdAt: new Date()
    };
    if (!search.label || !(search.category || search.color || search.keyword || search.locationId)) {
      return NextResponse.json({ error: "Enter a name and at least one search filter." }, { status: 400 });
    }
    const db = await getMongoDb();
    if (!db) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
    const result = await db.collection("saved_searches").insertOne(search);
    await logActivity("SAVED_SEARCH_CREATED", { user_id: user.id, entity_type: "SAVED_SEARCH", entity_id: result.insertedId.toString() });
    return NextResponse.json({ message: "Saved search created.", search: { ...search, _id: result.insertedId } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please login first." }, { status: 401 });
  try {
    const body = await req.json();
    const { ObjectId } = await import("mongodb");
    const db = await getMongoDb();
    const result = await db.collection("saved_searches").deleteOne({
      _id: new ObjectId(String(body.id)),
      userId: user.id
    });
    return NextResponse.json({ message: result.deletedCount ? "Saved search deleted." : "Saved search not found." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
