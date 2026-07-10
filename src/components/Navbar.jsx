import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useLanguage();

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
<LanguageSwitcher />
</nav>
  );
}
export default Navbar;