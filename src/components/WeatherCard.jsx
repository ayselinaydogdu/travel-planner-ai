import { useLanguage } from "../context/LanguageContext";

function WeatherCard({ weather }) {
  const { t } = useLanguage();
  if (!weather) return null;

  function getWeatherInfo(code) {
    switch (code) {
      case 0:
        return { icon: "☀️", text: t.weather.codes.clear };

      case 1:
      case 2:
      case 3:
        return { icon: "⛅", text: t.weather.codes.partlyCloudy };

      case 45:
      case 48:
        return { icon: "🌫️", text: t.weather.codes.foggy };

      case 51:
      case 53:
      case 55:
        return { icon: "🌦️", text: t.weather.codes.drizzle };

      case 61:
      case 63:
      case 65:
        return { icon: "🌧️", text: t.weather.codes.rain };

      case 71:
      case 73:
      case 75:
        return { icon: "❄️", text: t.weather.codes.snow };

      case 95:
        return { icon: "⛈️", text: t.weather.codes.thunderstorm };

      default:
        return { icon: "🌍", text: t.weather.codes.unknown };
    }
  }

  const weatherInfo = getWeatherInfo(weather.weather_code);

  return (
    <div className="weather-card">
      <h2>
        {weatherInfo.icon} {t.weather.title}
      </h2>

      <div className="weather-grid">
        <div>
          <h3>🌡 {t.weather.temperature}</h3>
          <p>{weather.temperature_2m}°C</p>
        </div>

        <div>
          <h3>💨 {t.weather.wind}</h3>
          <p>{weather.wind_speed_10m} km/h</p>
        </div>

        <div>
          <h3>💧 {t.weather.humidity}</h3>
          <p>{weather.relative_humidity_2m}%</p>
        </div>

        <div>
          <h3>{weatherInfo.icon} {t.weather.conditions}</h3>
          <p>{weatherInfo.text}</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
