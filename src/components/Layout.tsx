import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="logo">🏸</span>
            <span>Badminton Dashboard</span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/matches">Matches</NavLink>
            <NavLink to="/partners">Partners</NavLink>
            <NavLink to="/settings" className="nav-settings" title="Settings & data">⚙️</NavLink>
            <NavLink to="/new" className="btn btn-primary btn-sm nav-cta">
              + Add match
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}