import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-switcher">
      {Object.keys(translations).map((code) => (
        <button
          key={code}
          className={`lang-flag ${language === code ? "lang-flag-active" : ""}`}
          onClick={() => setLanguage(code)}
          title={translations[code].langName}
        >
          {translations[code].flag}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;