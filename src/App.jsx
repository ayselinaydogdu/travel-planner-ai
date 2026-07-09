import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PopularDestinations from "./components/PopularDestinations";
import SearchSection from "./components/SearchSection";
import About from "./components/About";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <PopularDestinations />
      <SearchSection />
      <About />
    </div>
  );
}

export default App;