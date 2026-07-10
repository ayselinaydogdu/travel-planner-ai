import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PopularDestinations from "./components/PopularDestinations";
import SearchSection from "./components/SearchSection";
import About from "./components/About";
import Auth from "./components/Auth";
import { useAuth } from "./context/AuthContext";

function App() {
  const { loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="app">
      <Navbar onAuthClick={() => setShowAuth(true)} />

      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <Auth onSuccess={() => setShowAuth(false)} />
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