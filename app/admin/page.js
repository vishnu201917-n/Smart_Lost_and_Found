import Nav from "../../components/Nav";
import AdminClaimActions from "../../components/AdminClaimActions";
import AdminReportActions from "../../components/AdminReportActions";
import AdminCollectionAction from "../../components/AdminCollectionAction";
import { getUser } from "../../lib/auth";
import { pool } from "../../lib/db";
import MongoAnalytics from "../../components/MongoAnalytics";

export default async function Admin() {
  const user = await getUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <>
        <Nav />
        <main>
          <div className="card centered-card">
            <p className="eyebrow">RESTRICTED AREA</p>
            <h2>Admin access only</h2>
            <p>Please login with an administrator account to manage claims.</p>
          </div>
        </main>
      </>
    );
  }

  const [claims] = await pool.query(`
    SELECT
      c.*,
      u.name,
      l.item_name AS lost_item,
      f.item_name AS found_item
    FROM claims c
    JOIN users u ON c.user_id = u.user_id
    JOIN matches m ON c.match_id = m.match_id
    JOIN lost_items l ON m.lost_id = l.lost_id
    JOIN found_items f ON m.found_id = f.found_id
    ORDER BY c.created_at DESC
  `);

  const [reports] = await pool.query(`
    SELECT
      r.*,
      f.item_name,
      u.name AS reporter
    FROM reports r
    JOIN found_items f ON r.found_id = f.found_id
    JOIN users u ON r.reported_by = u.user_id
    ORDER BY r.created_at DESC
  `);

  const [collections] = await pool.query(`
    SELECT c.claim_id, c.status AS claim_status,
           f.found_id, f.item_name, f.status AS item_status,
           u.name AS student_name
    FROM claims c
    JOIN matches m ON c.match_id = m.match_id
    JOIN found_items f ON m.found_id = f.found_id
    JOIN users u ON c.user_id = u.user_id
    WHERE c.status = 'APPROVED'
      AND f.status IN ('CLAIMED', 'COLLECTED')
    ORDER BY c.created_at DESC
  `);

  return (
    <>
      <Nav />

      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">ADMIN PANEL</p>
            <h1>Manage Claims and Reports</h1>
            <p>Review ownership claims and monitor reports submitted by users.</p>
          </div>
        </div>

        <MongoAnalytics />

        <section className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">HANDOVER TRACKING</p>
              <h2>Collection Management</h2>
              <p className="small">After a student physically collects an approved item from the Admin Room, record the handover here.</p>
            </div>
          </div>
          {collections.length === 0 ? (
            <p className="empty-state">No approved items are waiting for collection.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Student</th>
                    <th>Claim ID</th>
                    <th>Collection status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((item) => (
                    <tr key={item.claim_id}>
                      <td>{item.item_name}</td>
                      <td>{item.student_name}</td>
                      <td>#{item.claim_id}</td>
                      <td><span className={`status ${item.item_status === "COLLECTED" ? "approved" : "pending"}`}>{item.item_status}</span></td>
                      <td><AdminCollectionAction claimId={item.claim_id} itemStatus={item.item_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="admin-summary">
          <div className="summary-card">
            <span>{claims.filter((claim) => claim.status === "PENDING").length}</span>
            <p>Pending Claims</p>
          </div>
          <div className="summary-card">
            <span>{reports.filter((report) => report.status === "PENDING").length}</span>
            <p>Pending Reports</p>
          </div>
        </div>

        <section className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">CLAIMS</p>
              <h2>Ownership Verification</h2>
            </div>
          </div>

          {claims.length === 0 ? (
            <p className="empty-state">No claims have been submitted yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Match</th>
                    <th>Proof</th>
                    <th>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.claim_id}>
                      <td>{claim.name}</td>
                      <td>
                        {claim.lost_item} ↔ {claim.found_item}
                      </td>
                      <td>{claim.proof_description}</td>
                      <td>
                        <AdminClaimActions
                          claimId={claim.claim_id}
                          currentStatus={claim.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">REPORTS</p>
              <h2>Reported Items</h2>
            </div>
          </div>

          {reports.length === 0 ? (
            <p className="empty-state">No reports have been submitted yet.</p>
          ) : (
            <div className="report-list">
              {reports.map((report) => (
                <article className="report-row" key={report.report_id}>
                  <div>
                    <strong>{report.item_name}</strong>
                    <p>Reported by {report.reporter}</p>
                  </div>
                  <div>
                    <p>{report.reason}</p>
                    <AdminReportActions reportId={report.report_id} currentStatus={report.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
