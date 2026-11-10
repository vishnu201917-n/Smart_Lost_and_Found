import Nav from "../../components/Nav";
import ReportItemButton from "../../components/ReportItemButton";
import { getUser } from "../../lib/auth";
import { pool } from "../../lib/db";

export default async function Items() {
  const user = await getUser();
  const currentUserId = user?.id ?? 0;
  let lost = [];
  let found = [];

  try {
    [lost] = await pool.query(`
      SELECT l.*, lo.location_name
      FROM lost_items l
      JOIN locations lo ON l.location_id = lo.location_id
      WHERE NOT EXISTS (
        SELECT 1
        FROM matches completed_m
        JOIN claims completed_c ON completed_c.match_id = completed_m.match_id
        JOIN found_items completed_f ON completed_f.found_id = completed_m.found_id
        WHERE completed_m.lost_id = l.lost_id
          AND completed_c.status = 'APPROVED'
          AND completed_f.status = 'COLLECTED'
      )
      ORDER BY l.lost_id DESC
    `);

    [found] = await pool.execute(
      `SELECT
         f.*,
         lo.location_name,
         EXISTS (
           SELECT 1
           FROM matches m
           JOIN lost_items l ON l.lost_id = m.lost_id
           JOIN claims c ON c.match_id = m.match_id
           WHERE m.found_id = f.found_id
             AND c.user_id = ?
             AND l.user_id = ?
             AND c.status = 'APPROVED'
         ) AS approved_for_current_user,
         EXISTS (
           SELECT 1
           FROM matches m
           JOIN lost_items l ON l.lost_id = m.lost_id
           JOIN claims c ON c.match_id = m.match_id
           WHERE m.found_id = f.found_id
             AND c.user_id = ?
             AND l.user_id = ?
             AND c.status = 'PENDING'
         ) AS pending_for_current_user
       FROM found_items f
       JOIN locations lo ON f.location_id = lo.location_id
       WHERE f.status NOT IN ('COLLECTED', 'UNDER_REVIEW')
       ORDER BY f.found_id DESC`,
      [currentUserId, currentUserId, currentUserId, currentUserId]
    );
  } catch (error) {
    console.error("Unable to load item directory:", error);
  }

  return (
    <>
      <Nav />
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">ITEM DIRECTORY</p>
            <h1>Lost and Found Items</h1>
            <p>Browse the latest items reported by the community.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <p className="eyebrow">LOST</p>
            <h2>Lost Items</h2>
            {lost.length === 0 ? (
              <p className="empty-state">No lost items have been reported.</p>
            ) : lost.map((item) => (
              <article className="item-row" key={item.lost_id}>
                <strong>{item.item_name}</strong>
                <p>{item.category} · {item.color || "Color not specified"}</p>
                <span className="small">{item.location_name} · {item.status}</span>
              </article>
            ))}
          </section>

          <section className="card">
            <p className="eyebrow">FOUND</p>
            <h2>Found Items</h2>
            {found.length === 0 ? (
              <p className="empty-state">No found items have been reported.</p>
            ) : found.map((item) => {
              const approvedForUser = Boolean(item.approved_for_current_user);
              const pendingForUser = Boolean(item.pending_for_current_user);
              const displayStatus = approvedForUser
                ? "APPROVED — COLLECT FROM ADMIN ROOM"
                : pendingForUser
                  ? "CLAIM UNDER REVIEW"
                  : item.status;

              return (
                <article className="item-row" key={item.found_id}>
                  <strong>{item.item_name}</strong>
                  <p>{item.category} · {item.color || "Color not specified"}</p>
                  <span className="small">
                    {item.location_name} · {displayStatus}
                  </span>

                  {approvedForUser && (
                    <div className="collection-instruction">
                      <strong>Your claim has been approved!</strong>
                      <span>
                        This item is reserved for you. Please visit the campus
                        Admin Room and show your claim approval notification
                        to collect it.
                      </span>
                    </div>
                  )}

                  {pendingForUser && !approvedForUser && (
                    <div className="claim-pending-instruction">
                      Your ownership claim is waiting for administrator review.
                      You will receive a notification when a decision is made.
                    </div>
                  )}

                  {user?.role === "STUDENT"
                    && Number(user.id) !== Number(item.user_id)
                    && item.status !== "CLAIMED"
                    && !approvedForUser
                    && <ReportItemButton foundId={item.found_id} />}
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}
