import { useState } from "react";
import SearchForm from "./SearchForm";
import TripSummary from "./TripSummary";
import DestinationCard from "./DestinationCard";
import WeatherCard from "./WeatherCard";
import AIPlanDisplay from "./AIPlanDisplay";
import { getCoordinates, getWeather } from "../services/weatherService";
import { generateItinerary } from "../services/groqService";

function SearchSection() {
const [from, setFrom] = useState("");
const [to, setTo] = useState("");
const [days, setDays] = useState("");
const [budget, setBudget] = useState("");
const [travelStyle, setTravelStyle] = useState("Budget");
const [interest, setInterest] = useState("Food");
const [trip, setTrip] = useState(null);
const [weather, setWeather] = useState(null);
const [loading, setLoading] = useState(false);
const [aiPlan, setAiPlan] = useState("");

async function generateTrip() {
if (!from || !to || !days || !budget) {
alert("Please fill in all fields!");
return;
    }

setLoading(true);
setWeather(null);

try {
const tripData = { from, to, days, budget, travelStyle, interest };

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
alert("Something went wrong: " + error.message);
    }

setLoading(false);
  }

return (
<section className="search-section" id="planner">
<h2>Plan Your Journey</h2>
<p>
        Let AI build the perfect itinerary based on your destination,
        budget and travel style.
</p>
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
          🤖 AI is creating your perfect itinerary...
</div>
      )}
{trip && !loading && (
<>
<TripSummary trip={trip} />
{weather && <WeatherCard weather={weather} />}
<DestinationCard trip={trip} />
<div className="ai-result">
<h2>🤖 AI Personalized Travel Plan</h2>
<AIPlanDisplay plan={aiPlan} />
</div>
</>
      )}
</section>
  );
}

export default SearchSection;