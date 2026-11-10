"use client";
import { useEffect, useState } from "react";

export default function SavedSearchManager({ locations = [] }) {
  const [searches, setSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ label: "", category: "", color: "", keyword: "", locationId: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/saved-searches");
    const data = await response.json();
    if (response.ok) { setSearches(data.searches || []); setAlerts(data.alerts || []); }
    else setMessage(data.error || "Could not load saved searches.");
  }
  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/saved-searches", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save search.");
      setForm({ label: "", category: "", color: "", keyword: "", locationId: "" });
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    const response = await fetch("/api/saved-searches", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await response.json();
    setMessage(data.message || data.error || "");
    if (response.ok) load();
  }

  return <section className="card saved-search-panel">
    <p className="eyebrow">PERSONAL SEARCHES</p>
    <h2>Saved searches & alerts</h2>
    <p className="muted">Save filters to reuse them when checking newly reported items.</p>
    <form className="saved-search-form" onSubmit={save}>
      <label>Search name<input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="e.g. Blue electronics" required /></label>
      <label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="e.g. Electronics" /></label>
      <label>Colour<input value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="e.g. Blue" /></label>
      <label>Keyword<input value={form.keyword} onChange={e=>setForm({...form,keyword:e.target.value})} placeholder="e.g. iPhone" /></label>
      <label>Location<select value={form.locationId} onChange={e=>setForm({...form,locationId:e.target.value})}><option value="">Any location</option>{locations.map(x=><option key={x.location_id} value={x.location_id}>{x.location_name} (ID: {x.location_id})</option>)}</select></label>
      <button disabled={busy}>{busy ? "Saving..." : "Save search"}</button>
    </form>
    {message && <p className="small">{message}</p>}
    <div className="saved-search-list">
      {searches.map(s=><article className="saved-search-row" key={s._id}>
        <div><strong>{s.label}</strong><p>{[s.category,s.color,s.keyword,s.locationId ? `Location ID ${s.locationId}` : ""].filter(Boolean).join(" · ")}</p></div>
        <button type="button" className="secondary-button" onClick={()=>remove(s._id)}>Delete</button>
      </article>)}
      {!searches.length && <p className="small">You have not saved any searches yet.</p>}
    </div>
    <h3>Recent matching alerts</h3>
    <div className="saved-search-list">
      {alerts.map(a=><article className="saved-search-row" key={a._id}>
        <div><strong>{a.itemName} may match “{a.searchLabel}”</strong><p>{a.category} · {a.color || "Colour not specified"} · Location ID {a.locationId}</p></div>
        <span className="status pending">NEW MATCH</span>
      </article>)}
      {!alerts.length && <p className="small">No saved-search alerts yet. A matching found-item listing will appear here.</p>}
    </div>
  </section>;
}
