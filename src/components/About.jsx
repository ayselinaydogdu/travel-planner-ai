import { useLanguage } from "../context/LanguageContext";

function About() {
  const { t } = useLanguage();

  return (
<section className="about-section" id="about">
<h2>{t.about.title}</h2>
<p className="about-text">{t.about.text}</p>
<div className="about-cards">
<div className="about-card">
<div className="about-icon">🎯</div>
<h4>{t.about.card1Title}</h4>
<p>{t.about.card1Text}</p>
</div>
<div className="about-card">
<div className="about-icon">💶</div>
<h4>{t.about.card2Title}</h4>
<p>{t.about.card2Text}</p>
</div>
<div className="about-card">
<div className="about-icon">⚡</div>
<h4>{t.about.card3Title}</h4>
<p>{t.about.card3Text}</p>
</div>
</div>
</section>
  );
}
export default About;