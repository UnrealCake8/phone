import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">BROWSER-BASED INTERNATIONAL CALLING</p>
        <h1>
          Good calls,
          <br />
          <em>wherever</em> you are.
        </h1>
        <p className="hero-summary">
          A calm, secure calling desk for international conversations. Just your
          browser, your microphone, and a clear line.
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
      <div className="hero-footer">
        <span />
        POWERED BY TWILIO VOICE
      </div>
    </section>
  ),
});
