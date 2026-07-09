function WeatherCard({ weather }) {
  if (!weather) return null;

  function getWeatherInfo(code) {
    switch (code) {
      case 0:
        return { icon: "☀️", text: "Clear Sky" };

      case 1:
      case 2:
      case 3:
        return { icon: "⛅", text: "Partly Cloudy" };

      case 45:
      case 48:
        return { icon: "🌫️", text: "Foggy" };

      case 51:
      case 53:
      case 55:
        return { icon: "🌦️", text: "Drizzle" };

      case 61:
      case 63:
      case 65:
        return { icon: "🌧️", text: "Rain" };

      case 71:
      case 73:
      case 75:
        return { icon: "❄️", text: "Snow" };

      case 95:
        return { icon: "⛈️", text: "Thunderstorm" };

      default:
        return { icon: "🌍", text: "Unknown" };
    }
  }

  const weatherInfo = getWeatherInfo(weather.weather_code);

  return (
    <div className="weather-card">
      <h2>
        {weatherInfo.icon} Current Weather
      </h2>

      <div className="weather-grid">
        <div>
          <h3>🌡 Temperature</h3>
          <p>{weather.temperature_2m}°C</p>
        </div>

        <div>
          <h3>💨 Wind</h3>
          <p>{weather.wind_speed_10m} km/h</p>
        </div>

        <div>
          <h3>💧 Humidity</h3>
          <p>{weather.relative_humidity_2m}%</p>
        </div>

        <div>
          <h3>{weatherInfo.icon} Conditions</h3>
          <p>{weatherInfo.text}</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;