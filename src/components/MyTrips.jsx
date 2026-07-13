import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { getTrips, deleteTrip } from "../services/tripsService";
import AIPlanDisplay from "./AIPlanDisplay";

function MyTrips({ onClose }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadTrips();
  }, [user]);

  async function loadTrips() {
    setLoading(true);
    try {
      const data = await getTrips(user.id);
      setTrips(data);
    } catch (error) {
      console.error("Geziler yüklenemedi:", error.message);
    }
    setLoading(false);
  }

  async function handleDelete(tripId, e) {
    e.stopPropagation();
    if (!confirm(t.trips.confirmDelete)) return;
    try {
      await deleteTrip(tripId);
      setTrips(trips.filter((tr) => tr.id !== tripId));
      if (selectedTrip?.id === tripId) setSelectedTrip(null);
    } catch (error) {
      console.error("Silinemedi:", error.message);
      toast.error(t.trips.deleteError);
    }
  }

  if (selectedTrip) {
    return (
      <div className="my-trips-panel">
        <div className="my-trips-header">
          <button className="back-btn" onClick={() => setSelectedTrip(null)}>
            {t.trips.back}
          </button>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <h2>{selectedTrip.from_city} → {selectedTrip.to_city}</h2>
        <p>{selectedTrip.days} {t.trips.days} · {selectedTrip.budget} {t.trips.budgetLabel}</p>
        <AIPlanDisplay plan={selectedTrip.plan} destination={selectedTrip.to_city} />
      </div>
    );
  }

  return (
    <div className="my-trips-panel">
      <div className="my-trips-header">
        <h2>{t.trips.title}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {loading && <p>{t.trips.loading}</p>}

      {!loading && trips.length === 0 && <p>{t.trips.empty}</p>}

      <ul className="trips-list">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className="trip-item"
            onClick={() => setSelectedTrip(trip)}
          >
            <div>
              <strong>{trip.from_city} → {trip.to_city}</strong>
              <p>{trip.days} {t.trips.days} · {trip.budget} {t.trips.budgetLabel}</p>
              <span className="trip-date">
                {new Date(trip.created_at).toLocaleDateString()}
              </span>
            </div>
            <button
              className="delete-trip-btn"
              onClick={(e) => handleDelete(trip.id, e)}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyTrips;