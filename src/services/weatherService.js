export async function getCoordinates(city) {
    const response = await fetch(
`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`
    );
const data = await response.json();
if (!data.results || data.results.length === 0) {
return null;
    }
return data.results[0];
}

export async function getWeather(lat, lon){
const response = await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code`
    );
const data = await response.json();
return data.current;
}