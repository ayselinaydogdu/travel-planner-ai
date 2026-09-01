import { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import TripSummary from "./TripSummary";
import DestinationCard from "./DestinationCard";
import WeatherCard from "./WeatherCard";
import AIPlanDisplay from "./AIPlanDisplay";
import { getCoordinates, getWeather } from "../services/weatherService";
import { generateItinerary, translateItinerary } from "../services/groqService";
import { saveTrip } from "../services/tripsService";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { downloadTripPDF } from "../utils/pdfExport";

function SearchSection({ onRequireAuth }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [travelStyle, setTravelStyle] = useState(["General"]);
  const [interest, setInterest] = useState(["General"]);
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Dil değişince, gösterilen plan farklı bir dildeyse mevcut planı (rotayı koruyarak) çevirir.
  useEffect(() => {
    if (!aiPlan || !trip || trip.language === language) return;
    let cancelled = false;
    (async () => {
      setTranslating(true);
      try {
        const translated = await translateItinerary(aiPlan, language);
        if (!cancelled) {
          setAiPlan(translated);
          setTrip((prev) => (prev ? { ...prev, language } : prev));
          setSaved(false);
        }
      } catch (error) {
        console.error("Çeviri hatası:", error.message);
        if (!cancelled) toast.error(t.form.translateError);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  async function generateTrip() {
    if (!from || !to || !days || !budget) {
      toast.warning(t.form.fillFields);
      return;
    }
    setLoading(true);
    setWeather(null);
    setSaved(false);
    try {
      const tripData = {
        from,
        to,
        days,
        budget,
        currency,
        travelStyle: travelStyle.length ? travelStyle : ["General"],
        interest: interest.length ? interest : ["General"],
        language,
      };

      try {
        const location = await getCoordinates(to);
        if (location) {
          const currentWeather = await getWeather(location.latitude, location.longitude);
          setWeather(currentWeather);
        }
      } catch (weatherError) {
        console.error("Hava durumu alınamadı:", weatherError.message);
      }

      const aiResponse = await generateItinerary(tripData);
      setAiPlan(aiResponse);
      setTrip(tripData);
    } catch (error) {
      console.error("HATA:", error.message);
      toast.error(t.form.somethingWrong + error.message);
    }
    setLoading(false);
  }

  function handleDownloadPDF() {
    downloadTripPDF(trip, aiPlan, {
      ...t.planLabels,
      tripTo: t.pdf.tripTo,
      from: t.pdf.from,
      days: t.pdf.days,
      budget: t.pdf.budget,
    });
  }

  async function handleSaveTrip() {
    if (!user) {
      onRequireAuth();
      return;
    }
    setSaving(true);
    try {
      await saveTrip(user.id, trip, aiPlan);
      setSaved(true);
      toast.success(t.save.success);
    } catch (error) {
      console.error("Kaydetme hatası:", error.message);
      toast.error(t.save.error + error.message);
    }
    setSaving(false);
  }

  return (
    <section className="search-section" id="planner">
      <h2>{t.form.title}</h2>
      <p>{t.form.subtitle}</p>

      <SearchForm
        from={from} setFrom={setFrom}
        to={to} setTo={setTo}
        days={days} setDays={setDays}
        budget={budget} setBudget={setBudget}
        currency={currency} setCurrency={setCurrency}
        travelStyle={travelStyle} setTravelStyle={setTravelStyle}
        interest={interest} setInterest={setInterest}
        loading={loading}
        generateTrip={generateTrip}
        setTrip={setTrip}
      />

      {loading && (
        <div className="loading-box">
          {t.form.loading}
        </div>
      )}

      {trip && !loading && (
        <>
          <TripSummary trip={trip} />
          {weather && <WeatherCard weather={weather} />}
          <DestinationCard trip={trip} />
          <div className="ai-result">
            <h2>{t.save.aiPlanTitle}</h2>
            {translating && (
              <div className="loading-box">{t.form.translating}</div>
            )}
            <div className={translating ? "plan-translating" : ""}>
              <AIPlanDisplay plan={aiPlan} destination={trip.to} />
            </div>
            <div className="trip-actions">
              <button
                className="pdf-download-btn"
                onClick={handleDownloadPDF}
                disabled={translating}
              >
                {t.pdf.download}
              </button>
              <button
                className="save-trip-btn"
                onClick={handleSaveTrip}
                disabled={saving || saved || translating}
              >
                {saved ? t.save.saved : saving ? t.save.saving : t.save.save}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default SearchSection;