import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/history")({
  component: () => (
    <section className="empty-page">
      <p className="eyebrow">CALL ACTIVITY</p>
      <h1>A record of every hello.</h1>
      <p>
        When you sign in, completed calls and their details will appear here.
      </p>
      <div className="empty-rule" />
      <span className="empty-symbol">↗</span>
    </section>
  ),
});
