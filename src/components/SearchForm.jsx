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

      <div className="input-group">
        <label>Travel Style</label>

        <select
          value={travelStyle}
          onChange={(e) => {
            setTravelStyle(e.target.value);
            setTrip(null);
          }}
        >
          <option>Budget</option>
          <option>Luxury</option>
          <option>Adventure</option>
          <option>Family</option>
        </select>
      </div>

      <div className="input-group">
        <label>Interest</label>

        <select
          value={interest}
          onChange={(e) => {
            setInterest(e.target.value);
            setTrip(null);
          }}
        >
          <option>Food</option>
          <option>Museums</option>
          <option>Nature</option>
          <option>Nightlife</option>
        </select>
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