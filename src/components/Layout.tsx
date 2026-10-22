import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Swords,
  Users,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-logo">🏸</span>
            <span className="brand-title">Badminton</span>
            <span className="brand-badge">UI</span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <History size={15} />
              <span>Matches</span>
            </NavLink>
            <NavLink to="/h2h" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Swords size={15} />
              <span>H2H</span>
            </NavLink>
            <NavLink to="/partners" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={15} />
              <span>Partners</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link nav-icon-link ${isActive ? 'active' : ''}`}
              title="Settings & data"
            >
              <SettingsIcon size={16} />
            </NavLink>
            <NavLink to="/new" className="btn btn-primary btn-sm nav-cta">
              <Plus size={14} strokeWidth={2.5} />
              <span>Add match</span>
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
