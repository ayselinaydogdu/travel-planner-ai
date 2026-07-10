import { useState } from "react";
import SearchForm from "./SearchForm";
import TripSummary from "./TripSummary";
import DestinationCard from "./DestinationCard";
import WeatherCard from "./WeatherCard";
import AIPlanDisplay from "./AIPlanDisplay";
import { getCoordinates, getWeather } from "../services/weatherService";
import { generateItinerary } from "../services/groqService";
import { useLanguage } from "../context/LanguageContext";
import { downloadTripPDF } from "../utils/pdfExport";

function SearchSection() {
const { t, language } = useLanguage();
const [from, setFrom] = useState("");
const [to, setTo] = useState("");
const [days, setDays] = useState("");
const [budget, setBudget] = useState("");
const [travelStyle, setTravelStyle] = useState(["General"]);
const [interest, setInterest] = useState(["General"]);
const [trip, setTrip] = useState(null);
const [weather, setWeather] = useState(null);
const [loading, setLoading] = useState(false);
const [aiPlan, setAiPlan] = useState("");

async function generateTrip() {
if (!from || !to || !days || !budget) {
alert(t.form.fillFields);
return;
    }

setLoading(true);
setWeather(null);

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
downloadTripPDF(trip, aiPlan);
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
<button className="pdf-download-btn" onClick={handleDownloadPDF}>
{t.pdf.download}
</button>
<AIPlanDisplay plan={aiPlan} destination={trip.to} />
</div>
</>
      )}
</section>
  );
}

export default SearchSection;