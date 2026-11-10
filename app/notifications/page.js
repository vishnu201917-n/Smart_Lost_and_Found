import Nav from "../../components/Nav";
import { getUser } from "../../lib/auth";
import { pool } from "../../lib/db";

function notificationType(message = "") {
  const text = message.toLowerCase();
  if (text.includes("rejected")) return { icon: "×", label: "Decision: rejected", className: "notification-rejected" };
  if (text.includes("approved")) return { icon: "✓", label: "Decision: approved", className: "notification-claim" };
  if (text.includes("claim")) return { icon: "•", label: "Claim update", className: "notification-claim" };
  if (text.includes("report")) return { icon: "!", label: "Report update", className: "notification-report" };
  if (text.includes("match")) return { icon: "⌕", label: "New match", className: "notification-match" };
  return { icon: "•", label: "Update", className: "notification-general" };
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default async function Notifications() {
  const user = await getUser();

  if (!user) {
    return (
      <>
        <Nav />
        <main>
          <div className="card centered-card">
            <h2>Please login to view your notifications.</h2>
          </div>
        </main>
      </>
    );
  }

  const [rows] = await pool.execute(
    `SELECT *
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user.id]
  );
  const unreadCount = rows.filter((row) => !row.is_read).length;

  return (
    <>
      <Nav />
      <main>
        <div className="page-heading notification-heading">
          <div>
            <p className="eyebrow">MY ACTIVITY</p>
            <h1>Notifications</h1>
            <p>Stay up to date with matches, claims and item report reviews.</p>
          </div>
          <div className="notification-count">
            <strong>{unreadCount}</strong>
            <span>unread</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card empty-state enhanced-empty">
            <div className="empty-icon">♧</div>
            <h2>You're all caught up</h2>
            <p>New match alerts and administrator decisions will appear here.</p>
          </div>
        ) : (
          <section className="notification-list" aria-label="Your notifications">
            {rows.map((notification) => {
              const type = notificationType(notification.message);
              const unread = !notification.is_read;
              return (
                <article
                  className={`card notification-card-enhanced ${unread ? "is-unread" : ""}`}
                  key={notification.notification_id}
                >
                  <div className={`notification-icon ${type.className}`}>
                    {type.icon}
                  </div>
                  <div className="notification-content">
                    <div className="notification-meta">
                      <span className="notification-type">{type.label}</span>
                      {unread && <span className="unread-pill">New</span>}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <time className="notification-time">
                      {formatDate(notification.created_at)}
                    </time>
                  </div>
                  <span className={`read-indicator ${unread ? "unread" : ""}`}>
                    {unread ? "Unread" : "Read"}
                  </span>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
