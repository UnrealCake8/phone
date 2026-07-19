import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">BROWSER-BASED INTERNATIONAL CALLING</p>
          <h1>
            Phone numbers.
            <br />
            <em>Real conversations.</em>
          </h1>
          <p className="hero-summary">
            A considered calling desk for international conversations. Open a
            line in seconds, directly from your browser.
          </p>
          <div className="actions">
            <Link className="button" to="/app">
              Start a call <span aria-hidden="true">→</span>
            </Link>
            <Link className="button secondary" to="/auth">
              Sign in
            </Link>
          </div>
        </div>
        <aside className="hero-call-card" aria-label="Call preview">
          <div className="call-card-top">
            <span>LIVE LINE</span>
            <i />
          </div>
          <div className="call-avatar">M</div>
          <p className="call-name">Mina Okafor</p>
          <p className="call-number">+44 20 7946 0958</p>
          <div className="call-wave" aria-hidden="true">
            {Array.from({ length: 22 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="call-status">
            <span>00:42</span>
            <button type="button" aria-label="End preview call">
              ⌕
            </button>
          </div>
        </aside>
        <div className="hero-footer">
          <span />
          POWERED BY TWILIO VOICE
        </div>
      </section>
      <section className="landing-notes" aria-label="Why UC8Phone">
        <div>
          <span className="note-number">01</span>
          <h2>Call from the browser.</h2>
          <p>No downloads or desk phones. Your workspace travels with you.</p>
        </div>
        <div>
          <span className="note-number">02</span>
          <h2>Built for clear distance.</h2>
          <p>
            Enter an international number, grant microphone access, and talk.
          </p>
        </div>
        <div>
          <span className="note-number">03</span>
          <h2>Quietly in control.</h2>
          <p>Manage calls, devices, and your account from one focused place.</p>
        </div>
      </section>
    </>
  ),
});
