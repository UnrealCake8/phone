import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/profile")({
  component: () => (
    <section className="empty-page">
      <p className="eyebrow">YOUR PROFILE</p>
      <h1>Make this desk yours.</h1>
      <p>Set your display name and avatar after signing in.</p>
      <div className="empty-rule" />
      <span className="empty-symbol">◌</span>
    </section>
  ),
});
