import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/settings")({
  component: () => (
    <section className="empty-page">
      <p className="eyebrow">CALL PREFERENCES</p>
      <h1>Set up your perfect line.</h1>
      <p>
        Choose your country, theme, microphone, and supported speaker device
        after signing in.
      </p>
      <div className="empty-rule" />
      <span className="empty-symbol">✦</span>
    </section>
  ),
});
