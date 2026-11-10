"use client";
import { useEffect, useState } from "react";

export default function MongoAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/analytics").then(r=>r.json()).then(d=>{
      if (d.error) setError(d.error); else setData(d);
    }).catch(()=>setError("Could not load MongoDB analytics."));
  }, []);
  return <section className="card mongo-analytics">
    <p className="eyebrow">MONGODB AGGREGATION</p>
    <h2>Activity Analytics</h2>
    {error && <p className="small">{error}</p>}
    {!data && !error && <p className="small">Loading analytics...</p>}
    {data && <>
      <div className="summary-card"><span>{data.totalEvents}</span><p>Total recorded events</p></div>
      <h3>Event breakdown</h3>
      {data.eventBreakdown.length ? <div className="analytics-bars">{data.eventBreakdown.map(x=><div className="analytics-bar-row" key={x._id}><span>{x._id}</span><strong>{x.count}</strong><div><i style={{width:`${Math.max(5,x.count/Math.max(...data.eventBreakdown.map(y=>y.count))*100)}%`}} /></div></div>)}</div> : <p className="small">No activity events recorded yet.</p>}
      <h3>Daily activity (last 7 days)</h3>
      <div className="analytics-days">{data.dailyActivity.map(x=><div key={x._id}><strong>{x.count}</strong><span>{x._id.slice(5)}</span></div>)}</div>
      <h3>Recent admin audit events</h3>
      {data.recentAudit.length ? data.recentAudit.map((x,i)=><p className="audit-row" key={i}>{x.action} · {x.entityType} #{x.entityId} · {x.decision}</p>) : <p className="small">No admin decisions logged yet.</p>}
    </>}
  </section>;
}
