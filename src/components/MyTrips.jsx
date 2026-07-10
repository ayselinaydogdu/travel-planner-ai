import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTrips, deleteTrip } from "../services/tripsService";
import AIPlanDisplay from "./AIPlanDisplay";

function MyTrips({ onClose }) {
  const { user } = useAuth();
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
    if (!confirm("Bu geziyi silmek istediğine emin misin?")) return;
    try {
      await deleteTrip(tripId);
      setTrips(trips.filter((t) => t.id !== tripId));
      if (selectedTrip?.id === tripId) setSelectedTrip(null);
    } catch (error) {
      console.error("Silinemedi:", error.message);
    }
  }

  if (selectedTrip) {
    return (
      <div className="my-trips-panel">
        <div className="my-trips-header">
          <button className="back-btn" onClick={() => setSelectedTrip(null)}>
            ← Geri
          </button>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <h2>{selectedTrip.from_city} → {selectedTrip.to_city}</h2>
        <p>{selectedTrip.days} gün · {selectedTrip.budget} bütçe</p>
        <AIPlanDisplay plan={selectedTrip.plan} destination={selectedTrip.to_city} />
      </div>
    );
  }

  return (
    <div className="my-trips-panel">
      <div className="my-trips-header">
        <h2>Seyahatlerim</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {loading && <p>Yükleniyor...</p>}

      {!loading && trips.length === 0 && (
        <p>Henüz kayıtlı bir gezin yok. Bir plan oluşturup kaydedebilirsin!</p>
      )}

      <ul className="trips-list">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className="trip-item"
            onClick={() => setSelectedTrip(trip)}
          >
            <div>
              <strong>{trip.from_city} → {trip.to_city}</strong>
              <p>{trip.days} gün · {trip.budget} bütçe</p>
              <span className="trip-date">
                {new Date(trip.created_at).toLocaleDateString("tr-TR")}
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