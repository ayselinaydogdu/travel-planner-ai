import { useLanguage } from "../context/LanguageContext";

function Hero() {
  const { t } = useLanguage();

  function scrollToPlanner() {
const target = document.getElementById("planner");
if (target) {
target.scrollIntoView({ behavior: "smooth" });
    }
  }
return (
<section className="hero" id="home">
<div className="hero-glow"></div>
<h1 className="hero-title">
<span className="hero-emoji">🌍</span> YourNextTrip
</h1>
<h2 className="hero-subtitle">{t.hero.subtitle}</h2>
<p>{t.hero.description}</p>
<button className="hero-cta" onClick={scrollToPlanner}>
{t.hero.cta}
</button>
</section>
  );
}
export default Hero;