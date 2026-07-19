import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import "@/styles/app.css";

export const Route = createRootRoute({
  component: () => (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">u</span>UC8Phone
        </Link>
        <nav>
          <Link to="/app">Dialler</Link>
          <Link to="/history">History</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  ),
});
