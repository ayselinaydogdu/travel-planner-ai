import { useState } from "react";
import SearchForm from "./SearchForm";
import TripSummary from "./TripSummary";
import DestinationCard from "./DestinationCard";
import WeatherCard from "./WeatherCard";
import AIPlanDisplay from "./AIPlanDisplay";
import { getCoordinates, getWeather } from "../services/weatherService";
import { generateItinerary } from "../services/groqService";
import { saveTrip } from "../services/tripsService";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { downloadTripPDF } from "../utils/pdfExport";

function SearchSection({ onRequireAuth }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState(["General"]);
  const [interest, setInterest] = useState(["General"]);
  const [trip, setTrip] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function generateTrip() {
    if (!from || !to || !days || !budget) {
      alert(t.form.fillFields);
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
      alert(t.form.somethingWrong + error.message);
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
    } catch (error) {
      console.error("Kaydetme hatası:", error.message);
      alert("Gezi kaydedilirken bir hata oluştu: " + error.message);
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
            <h2>🤖 AI Personalized Travel Plan</h2>
            <AIPlanDisplay plan={aiPlan} destination={trip.to} />
            <div className="trip-actions">
              <button className="pdf-download-btn" onClick={handleDownloadPDF}>
                {t.pdf.download}
              </button>
              <button
                className="save-trip-btn"
                onClick={handleSaveTrip}
                disabled={saving || saved}
              >
                {saved ? "✓ Kaydedildi" : saving ? "Kaydediliyor..." : "💾 Seyahatimi Kaydet"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default SearchSection;