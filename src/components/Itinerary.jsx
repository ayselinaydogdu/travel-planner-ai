import itineraryData from "../data/itineraryData";

function Itinerary({ trip }) {
  const city = trip.to.toLowerCase();

  const cityData = itineraryData[city];

  const activities =
    cityData?.[trip.interest] || [
      "🌍 Explore the city",
      "📸 Visit famous attractions",
      "🍽️ Taste local cuisine",
    ];

  const activitiesPerDay = 3;

  return (
    <section className="itinerary">
      <h2>🤖 AI Suggested Itinerary</h2>

      {Array.from({ length: Number(trip.days) }, (_, day) => {
        const start = day * activitiesPerDay;

        const dayActivities =
          activities.slice(start, start + activitiesPerDay);

        const finalActivities =
          dayActivities.length > 0
            ? dayActivities
            : [
                "☕ Relax and enjoy the city",
                "📸 Explore hidden gems",
                "🍽️ Discover local restaurants",
              ];

        return (
          <div className="day-card" key={day}>
            <h3>📅 Day {day + 1}</h3>

            <p className="ai-message">
              A <strong>{trip.travelStyle}</strong> trip focused on{" "}
              <strong>{trip.interest}</strong>.
            </p>

            <ul>
              {finalActivities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export default Itinerary;