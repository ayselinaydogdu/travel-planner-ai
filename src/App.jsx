import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PopularDestinations from "./components/PopularDestinations";
import SearchSection from "./components/SearchSection";
import About from "./components/About";
import Auth from "./components/Auth";
import MyTrips from "./components/MyTrips";
import { useAuth } from "./context/AuthContext";

function App() {
  const { loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMyTrips, setShowMyTrips] = useState(false);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="app">
      <Navbar
        onAuthClick={() => setShowAuth(true)}
        onMyTripsClick={() => setShowMyTrips(true)}
      />

      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <Auth onSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {showMyTrips && (
        <div className="auth-modal-overlay" onClick={() => setShowMyTrips(false)}>
          <div className="my-trips-modal" onClick={(e) => e.stopPropagation()}>
            <MyTrips onClose={() => setShowMyTrips(false)} />
          </div>
        </div>
      )}

      <Hero />
      <PopularDestinations />
      <SearchSection onRequireAuth={() => setShowAuth(true)} />
      <About />
    </div>
  );
}

export default App;