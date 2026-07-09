const TRAVEL_STYLES = [
  "General",
  "Budget",
  "Luxury",
  "Adventure",
  "Family",
  "Romantic",
  "Solo",
  "Business",
  "Relaxation",
  "Backpacking",
  "Road Trip",
];

const INTERESTS = [
  "General",
  "Food",
  "Museums",
  "Nature",
  "Nightlife",
  "Shopping",
  "History",
  "Art",
  "Sports",
  "Photography",
  "Beaches",
  "Local Culture",
  "Architecture",
  "Wellness & Spa",
  "Festivals & Events",
];

function SearchForm({
  from,
setFrom,
to,
setTo,
days,
setDays,
budget,
setBudget,
travelStyle,
setTravelStyle,
interest,
setInterest,
loading,
generateTrip,
setTrip,
}) {

function toggleValue(value, current, setter) {
setTrip(null);
if (value === "General") {
setter(current.includes("General") ? [] : ["General"]);
return;
    }
const withoutGeneral = current.filter((v) => v !== "General");
if (withoutGeneral.includes(value)) {
setter(withoutGeneral.filter((v) => v !== value));
    } else {
setter([...withoutGeneral, value]);
    }
  }

return (
<div className="search-card">
<div className="input-group">
<label>From</label>
<input
type="text"
placeholder="Istanbul"
value={from}
onChange={(e) => {
setFrom(e.target.value);
setTrip(null);
          }}
/>
</div>
<div className="input-group">
<label>To</label>
<input
type="text"
placeholder="Paris"
value={to}
onChange={(e) => {
setTo(e.target.value);
setTrip(null);
          }}
/>
</div>
<div className="input-group">
<label>Days</label>
<input
type="number"
min="1"
max="30"
placeholder="5"
value={days}
onChange={(e) => {
setDays(e.target.value);
setTrip(null);
          }}
/>
</div>
<div className="input-group">
<label>Budget (€)</label>
<input
type="number"
min="100"
placeholder="1000"
value={budget}
onChange={(e) => {
setBudget(e.target.value);
setTrip(null);
          }}
/>
</div>

<div className="input-group chip-group">
<label>Travel Style</label>
<div className="chip-container">
{TRAVEL_STYLES.map((style) => (
<button
type="button"
key={style}
className={`chip ${travelStyle.includes(style) ? "chip-selected" : ""}`}
onClick={() => toggleValue(style, travelStyle, setTravelStyle)}
>
{style}
</button>
            ))}
</div>
</div>

<div className="input-group chip-group">
<label>Interest</label>
<div className="chip-container">
{INTERESTS.map((item) => (
<button
type="button"
key={item}
className={`chip ${interest.includes(item) ? "chip-selected" : ""}`}
onClick={() => toggleValue(item, interest, setInterest)}
>
{item}
</button>
            ))}
</div>
</div>

<button
className="generate-btn"
onClick={generateTrip}
disabled={loading}
>
{loading ? "Generating..." : "Generate Trip"}
</button>
</div>
  );
}

export default SearchForm;