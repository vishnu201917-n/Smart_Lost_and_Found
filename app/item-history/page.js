import Nav from "../../components/Nav";
import { getUser } from "../../lib/auth";
import { getMongoDb } from "../../lib/mongo";

export default async function ItemHistoryPage() {
  const user = await getUser();
  let events = [];
  let unavailable = false;
  if (user) {
    try {
      const db = await getMongoDb();
      if (db) events = await db.collection("item_history")
        .find({ userId: user.id }).sort({ createdAt: -1 }).limit(100).toArray();
      else unavailable = true;
    } catch (error) {
      console.error("Item history unavailable:", error.message);
      unavailable = true;
    }
  }
  return <><Nav /><main>
    <div className="page-heading"><p className="eyebrow">MONGODB ITEM TIMELINE</p><h1>My Item History</h1><p>A timeline of item reports, matches and claims connected to your account.</p></div>
    {!user ? <div className="card">Please login to view your history.</div> : unavailable ? <div className="card">MongoDB is unavailable. Check your connection string.</div> : !events.length ? <div className="card empty-state"><h2>No item activity yet</h2><p>Your item lifecycle events will appear here as you use the application.</p></div> :
      <section className="card item-timeline">{events.map((event,index)=><article className="timeline-event" key={event._id.toString()}>
        <span className="timeline-marker" />
        <div><strong>{String(event.action).replaceAll("_"," ")}</strong><p>{event.entityType ? `${event.entityType} #${event.entityId}` : event.details?.lost_id ? `Lost item #${event.details.lost_id}` : event.details?.found_id ? `Found item #${event.details.found_id}` : event.details?.claim_id ? `Claim #${event.details.claim_id}` : "Application event"}</p><time>{new Date(event.createdAt).toLocaleString("en-IN")}</time></div>
      </article>)}</section>}
  </main></>;
}
