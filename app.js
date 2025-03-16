const OPENWEATHER_API = '55762bd94ade24fcd678d7dbab343202'; // <-- Add your OpenWeather API Key
const SUNRISE_SUNSET_API = 'https://api.sunrise-sunset.org/json';

document.addEventListener('DOMContentLoaded', initApp);
document.getElementById('refresh-btn').addEventListener('click', initApp);

async function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = 'Loading...';

  let position = await getLocation();

  // Save location for next time
  localStorage.setItem('lastLocation', JSON.stringify(position));

  const sunTimes = await getSunTimes(position.lat, position.lon);
  const weather = await getWeather(position.lat, position.lon);
  const score = analyzeConditions(weather, sunTimes);

  renderResults(position, sunTimes, weather, score);
}

async function getLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        const last = JSON.parse(localStorage.getItem('lastLocation'));
        if (last) return resolve(last);
        resolve({ lat: 51.5074, lon: -0.1278 }); // Default to London
      }
    );
  });
}

async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function getSunTimes(lat, lon) {
  const url = `${SUNRISE_SUNSET_API}?lat=${lat}&lng=${lon}&formatted=0`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

function analyzeConditions(weather, sunTimes) {
  // Find nearest forecast hour to sunset
  const sunsetHour = new Date(sunTimes.sunset).getHours();
  const sunriseHour = new Date(sunTimes.sunrise).getHours();

  const forecastAtSunset = weather.list.find(item => 
    new Date(item.dt_txt).getHours() === sunsetHour
  );

  const forecastAtSunrise = weather.list.find(item => 
    new Date(item.dt_txt).getHours() === sunriseHour
  );

  const sunsetCloud = forecastAtSunset ? forecastAtSunset.clouds.all : 100;
  const sunriseCloud = forecastAtSunrise ? forecastAtSunrise.clouds.all : 100;

  // Simple scoring logic (customize this)
  const sunsetScore = 10 - Math.min(sunsetCloud / 10, 10); // Lower clouds = higher score
  const sunriseScore = 10 - Math.min(sunriseCloud / 10, 10);

  return { sunsetScore, sunriseScore, sunsetCloud, sunriseCloud };
}

function renderResults(position, sunTimes, weather, score) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Location: ${position.lat.toFixed(2)}, ${position.lon.toFixed(2)}</h2>
    <p><strong>Sunrise:</strong> ${formatTime(sunTimes.sunrise)} (Cloud: ${score.sunriseCloud}%)</p>
    <p><strong>Sunset:</strong> ${formatTime(sunTimes.sunset)} (Cloud: ${score.sunsetCloud}%)</p>
    <p><strong>Photo Score (Sunrise):</strong> ${score.sunriseScore.toFixed(1)}/10</p>
    <p><strong>Photo Score (Sunset):</strong> ${score.sunsetScore.toFixed(1)}/10</p>
    <p>Tip: ${photoTip(score)}</p>
  `;
}

function formatTime(utcTime) {
  const date = new Date(utcTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function photoTip(score) {
  if (score.sunsetScore >= 8 || score.sunriseScore >= 8) return "Great time for vibrant skies!";
  if (score.sunsetScore >= 5 || score.sunriseScore >= 5) return "Might be worth checking out!";
  return "Low chance of good light, but moody shots could work.";
}
