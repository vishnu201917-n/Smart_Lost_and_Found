import Link from "next/link";
import Nav from "../components/Nav";

export default function Home() {
  return (
    <>
      <Nav />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">CAMPUS COMMUNITY</p>
            <h1>Smart Lost and Found</h1>
            <p className="hero-text">
              A simple way to report lost belongings, share found items,
              discover possible matches, and help belongings find their way
              back to their owners.
            </p>

            <div className="hero-actions">
              <Link className="primary-link" href="/report-lost">
                Report a Lost Item
              </Link>
              <Link className="secondary-link" href="/items">
                Browse Items
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-icon">🔎</div>
            <div className="visual-card">
              <span>LOST ITEM</span>
              <strong>Possible match found</strong>
              <small>Helping owners reconnect with belongings</small>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">HOW IT WORKS</p>
              <h2>A clearer path from lost to found</h2>
            </div>
          </div>

          <div className="grid">
            <div className="feature-card">
              <div className="feature-number">01</div>
              <h3>Report</h3>
              <p>Submit details when you lose or find an item on campus.</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>
              <h3>Match</h3>
              <p>The system checks item details and creates possible matches.</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>
              <h3>Recover</h3>
              <p>Submit an ownership claim and wait for administrator review.</p>
            </div>
          </div>
        </section>

        <section className="card callout">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2>Lost something? Found something?</h2>
            <p>
              Join the campus community and help make the lost-and-found
              process quicker and more organized.
            </p>
          </div>
          <Link className="primary-link" href="/register">
            Create an Account
          </Link>
        </section>
      </main>
    </>
  );
}
