import Nav from "../../components/Nav";
import SavedSearchManager from "../../components/SavedSearchManager";
import { getUser } from "../../lib/auth";
import { pool } from "../../lib/db";

export default async function SavedSearchesPage() {
  const user = await getUser();
  if (!user) return <><Nav /><main><div className="card"><h2>Please login to manage saved searches.</h2></div></main></>;
  const [locations] = await pool.query("SELECT location_id, location_name FROM locations ORDER BY location_name");
  return <><Nav /><main><div className="page-heading"><p className="eyebrow">PERSONAL TOOLS</p><h1>Saved Searches</h1><p>Save the item filters you check frequently.</p></div><SavedSearchManager locations={locations} /></main></>;
}
