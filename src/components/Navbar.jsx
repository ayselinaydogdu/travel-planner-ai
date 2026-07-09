function Navbar() {
  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav className="navbar">
      <div className="logo">
        🌍 <span>YourNextTrip</span>
      </div>
      <ul className="nav-links">
        <li onClick={() => scrollToId("home")}>Home</li>
        <li onClick={() => scrollToId("destinations")}>Destinations</li>
        <li onClick={() => scrollToId("planner")}>AI Planner</li>
        <li onClick={() => scrollToId("about")}>About</li>
      </ul>
    </nav>
  );
}

export default Navbar;