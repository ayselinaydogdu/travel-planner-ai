import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar({ onAuthClick, onMyTripsClick }) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: t.nav.home },
    { id: "destinations", label: t.nav.destinations },
    { id: "planner", label: t.nav.planner },
    { id: "about", label: t.nav.about },
  ];

  function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  function handleAuth(action) {
    action();
    setMenuOpen(false);
  }

  const authButtons = user ? (
    <>
      <button className="auth-btn" onClick={() => handleAuth(onMyTripsClick)}>
        {t.auth.myTrips}
      </button>
      <button className="auth-btn" onClick={() => handleAuth(signOut)}>
        {t.auth.logout}
      </button>
    </>
  ) : (
    <button className="auth-btn" onClick={() => handleAuth(onAuthClick)}>
      {t.auth.login}
    </button>
  );

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          🌍 <span>YourNextTrip</span>
        </div>

        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id} onClick={() => scrollToId(item.id)}>
              {item.label}
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <LanguageSwitcher />
          {authButtons}
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </nav>

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <button
          className="drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        <ul className="drawer-links">
          {navItems.map((item) => (
            <li key={item.id} onClick={() => scrollToId(item.id)}>
              {item.label}
            </li>
          ))}
        </ul>
        <div className="drawer-actions">
          <LanguageSwitcher />
          {authButtons}
        </div>
      </div>

      {menuOpen && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}

export default Navbar;
