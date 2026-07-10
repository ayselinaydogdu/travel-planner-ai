import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar({ onAuthClick, onMyTripsClick }) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav className="navbar">
      <div className="logo">
        🌍 <span>YourNextTrip</span>
      </div>
      <ul className="nav-links">
        <li onClick={() => scrollToId("home")}>{t.nav.home}</li>
        <li onClick={() => scrollToId("destinations")}>{t.nav.destinations}</li>
        <li onClick={() => scrollToId("planner")}>{t.nav.planner}</li>
        <li onClick={() => scrollToId("about")}>{t.nav.about}</li>
      </ul>

      <div className="navbar-right">
        <LanguageSwitcher />
        {user ? (
          <>
            <button className="auth-btn" onClick={onMyTripsClick}>
              {t.auth.myTrips}
            </button>
            <button className="auth-btn" onClick={signOut}>
              {t.auth.logout}
            </button>
          </>
        ) : (
          <button className="auth-btn" onClick={onAuthClick}>
            {t.auth.login}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;