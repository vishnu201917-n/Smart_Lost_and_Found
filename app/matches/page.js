import Nav from "../../components/Nav";
import ClaimButton from "../../components/ClaimButton";
import { getUser } from "../../lib/auth";
import { pool } from "../../lib/db";

export default async function Matches() {
  const user = await getUser();

  // Show the current student's own claim decision beside each match.
  // For other users/admins, the general match status remains visible.
  const [rows] = await pool.execute(
    `SELECT
       m.match_id,
       m.similarity_score,
       m.match_status,
       m.created_at,
       l.item_name AS lost_item,
       l.description AS lost_description,
       f.item_name AS found_item,
       f.description AS found_description,
       l.user_id AS lost_owner_id,
       c.claim_id,
       c.status AS claim_status
     FROM matches m
     JOIN lost_items l ON m.lost_id = l.lost_id
     JOIN found_items f ON m.found_id = f.found_id
     LEFT JOIN claims c
       ON c.match_id = m.match_id
       AND c.user_id = ?
     WHERE f.status NOT IN ('COLLECTED', 'UNDER_REVIEW')
       AND NOT EXISTS (
         SELECT 1
         FROM matches completed_m
         JOIN claims completed_c ON completed_c.match_id = completed_m.match_id
         JOIN found_items completed_f ON completed_f.found_id = completed_m.found_id
         WHERE completed_m.lost_id = m.lost_id
           AND completed_c.status = 'APPROVED'
           AND completed_f.status = 'COLLECTED'
       )
     ORDER BY m.created_at DESC`,
    [user?.id ?? 0]
  );

  return (
    <>
      <Nav />
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">MATCH CENTER</p>
            <h1>Possible Matches</h1>
            <p>Review possible matches and track the status of your ownership claims.</p>
          </div>
          <div className="match-summary">
            <span className="summary-dot" />
            {rows.length} {rows.length === 1 ? "match" : "matches"} found
          </div>
        </div>

        {!user && (
          <div className="notice">
            Login to submit a claim for one of your possible matches.
          </div>
        )}

        {rows.length === 0 ? (
          <div className="card empty-state enhanced-empty">
            <div className="empty-icon">⌕</div>
            <h2>No matches yet</h2>
            <p>When a lost item and a found item have matching details, the possible match will appear here.</p>
          </div>
        ) : (
          <div className="match-list">
            {rows.map((match) => {
              const isOwner = user?.role === "STUDENT" && Number(match.lost_owner_id) === Number(user.id);
              const displayStatus = isOwner && match.claim_status
                ? `CLAIM ${match.claim_status}`
                : match.match_status;
              const statusClass = (match.claim_status || match.match_status || "pending").toLowerCase();
              const score = Math.max(0, Math.min(100, Number(match.similarity_score) * 100));

              return (
                <article className="card match-card" key={match.match_id}>
                  <div className="match-card-top">
                    <div>
                      <p className="eyebrow">POSSIBLE ITEM MATCH · #{match.match_id}</p>
                      <h2>{match.lost_item}</h2>
                      <p className="match-subtitle">Lost item matched with a found listing</p>
                    </div>
                    <span className={`status ${statusClass}`}>{displayStatus}</span>
                  </div>

                  {isOwner && (
                    <div className="match-descriptions">
                      <div>
                        <span className="detail-label">YOUR LOST ITEM DESCRIPTION</span>
                        <p>{match.lost_description || "No description was provided for your lost item."}</p>
                      </div>
                      <div>
                        <span className="detail-label">FOUND LISTING DESCRIPTION</span>
                        <p>{match.found_description || "The finder did not provide a description."}</p>
                        <small>Use this as an additional clue. The administrator will still verify your ownership proof before approval.</small>
                      </div>
                    </div>
                  )}
                  <div className="match-details">
                    <div className="match-item">
                      <span className="detail-label">LOST ITEM</span>
                      <strong>{match.lost_item}</strong>
                    </div>
                    <div className="match-connector">↔</div>
                    <div className="match-item">
                      <span className="detail-label">FOUND ITEM</span>
                      <strong>{match.found_item}</strong>
                    </div>
                    <div className="match-score">
                      <div className="score-heading">
                        <span className="detail-label">MATCH SCORE</span>
                        <strong>{score.toFixed(0)}%</strong>
                      </div>
                      <div className="score-track">
                        <span style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  </div>

                  {isOwner ? (
                    <div className="match-card-action">
                      {match.claim_id ? (
                        <div className="claim-status-note">
                          <strong>
                            {match.claim_status === "APPROVED"
                              ? "Your claim was approved"
                              : match.claim_status === "REJECTED"
                                ? "Your claim was rejected"
                                : "Your claim is awaiting review"}
                          </strong>
                          <span>
                            {match.claim_status === "APPROVED"
                              ? "The administrator has confirmed your ownership claim."
                              : match.claim_status === "REJECTED"
                                ? "Please contact the administrator if you need clarification."
                                : "You'll receive a notification when the administrator reviews it."}
                          </span>
                        </div>
                      ) : (
                        <ClaimButton matchId={match.match_id} />
                      )}
                    </div>
                  ) : (
                    <div className="match-card-action muted">
                      {user?.role === "STUDENT"
                        ? "This match belongs to another student's lost-item report."
                        : "Sign in as the lost-item owner to submit a claim."}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
