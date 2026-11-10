import { MongoClient } from "mongodb";

let client;
let clientPromise;

async function getMongoClient() {
  if (!process.env.MONGODB_URI) return null;
  if (!clientPromise) {
    client = client || new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getMongoDb() {
  const connected = await getMongoClient();
  if (!connected) return null;
  return connected.db(process.env.MONGODB_DB || "smart_lost_found_logs");
}

export async function logActivity(action, details = {}) {
  try {
    const db = await getMongoDb();
    if (!db) return;
    const event = {
      action,
      details,
      userId: details.user_id ?? details.affected_user_id ?? null,
      entityType: details.entity_type ?? null,
      entityId: details.entity_id ?? null,
      createdAt: new Date()
    };
    await db.collection("activity_logs").insertOne(event);
    if (["LOST_ITEM_REPORTED", "FOUND_ITEM_REPORTED", "MATCH_CREATED", "CLAIM_SUBMITTED", "CLAIM_REVIEWED", "ITEM_REPORTED_FOR_REVIEW", "ITEM_REPORT_REVIEWED", "ITEM_COLLECTED"].includes(action)) {
      await db.collection("item_history").insertOne({
        ...event,
        historyType: "ITEM_LIFECYCLE"
      });
    }
    if (["CLAIM_REVIEWED", "ITEM_REPORT_REVIEWED", "ITEM_COLLECTED"].includes(action)) {
      await db.collection("admin_audit_logs").insertOne({
        action,
        adminId: details.admin_id ?? null,
        entityType: action === "CLAIM_REVIEWED"
          ? "CLAIM"
          : action === "ITEM_REPORT_REVIEWED"
            ? "REPORT"
            : "FOUND_ITEM",
        entityId: details.claim_id ?? details.report_id ?? details.found_id ?? null,
        decision: details.status ?? null,
        details,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error("MongoDB event recording skipped:", error.message);
  }
}

export async function getActivityAnalytics() {
  const db = await getMongoDb();
  if (!db) return { totalEvents: 0, eventBreakdown: [], dailyActivity: [], recentAudit: [] };
  const logs = db.collection("activity_logs");
  const [totalEvents, eventBreakdown, dailyActivity, recentAudit] = await Promise.all([
    logs.countDocuments(),
    logs.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray(),
    logs.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]).toArray(),
    db.collection("admin_audit_logs").find({}).sort({ createdAt: -1 }).limit(8).toArray()
  ]);
  return { totalEvents, eventBreakdown, dailyActivity, recentAudit };
}

export async function createSavedSearchAlerts(foundItem) {
  try {
    const db = await getMongoDb();
    if (!db) return 0;
    const searches = await db.collection("saved_searches").find({}).toArray();
    let created = 0;
    for (const search of searches) {
      const categoryMatch = !search.category || search.category.toLowerCase() === String(foundItem.category || "").toLowerCase();
      const colorMatch = !search.color || search.color.toLowerCase() === String(foundItem.color || "").toLowerCase();
      const keywordText = `${foundItem.item_name || ""} ${foundItem.description || ""} ${foundItem.brand || ""}`.toLowerCase();
      const keywordMatch = !search.keyword || keywordText.includes(search.keyword.toLowerCase());
      const locationMatch = !search.locationId || Number(search.locationId) === Number(foundItem.location_id);
      if (categoryMatch && colorMatch && keywordMatch && locationMatch) {
        await db.collection("saved_search_alerts").insertOne({
          userId: search.userId,
          searchId: search._id,
          searchLabel: search.label,
          foundItemId: foundItem.found_id,
          itemName: foundItem.item_name,
          category: foundItem.category,
          color: foundItem.color || null,
          locationId: foundItem.location_id,
          createdAt: new Date(),
          read: false
        });
        created += 1;
      }
    }
    return created;
  } catch (error) {
    console.error("Saved-search alert creation skipped:", error.message);
    return 0;
  }
}
