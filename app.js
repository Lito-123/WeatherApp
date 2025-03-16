const OPENWEATHER_API = '55762bd94ade24fcd678d7dbab343202'; // <-- Add your OpenWeather API Key
const SUNRISE_SUNSET_API = 'https://api.sunrise-sunset.org/json';

document.addEventListener('DOMContentLoaded', initApp);
document.getElementById('refresh-btn').addEventListener('click', initApp);

async function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = 'Loading...';

  try {
    let position = await getLocation();
    
    // Save location for next time
    localStorage.setItem('lastLocation', JSON.stringify(position));

    const sunTimes = await getSunTimes(position.lat, position.lon);
    const weather = await getWeather(position.lat, position.lon);
    const score = analyzeConditions(weather, sunTimes);

    renderResults(position, sunTimes, weather, score);
  } catch (error) {
    console.error(error);
    renderError(error.message);
  }
}

async function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error('Unable to retrieve location. Please allow location access.'))
    );
  });
}

async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  const data = await res.json();
  return data;
}

async function getSunTimes(lat, lon) {
  const url = `${SUNRISE_SUNSET_API}?lat=${lat}&lng=${lon}&formatted=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sunrise/sunset data');
  const data = await res.json();
  return data.results;
}

function analyzeConditions(weather, sunTimes) {
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

  const sunsetScore = 10 - Math.min(sunsetCloud / 10, 10); // Lower clouds = higher score
  const sunriseScore = 10 - Math.min(sunriseCloud / 10, 10);

  return { sunsetScore, sunriseScore, sunsetCloud, sunriseCloud };
}

function renderResults(position, sunTimes, weather, score) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2 class="text-xl font-semibold mb-4 text-center">📍 Location: ${position.lat.toFixed(2)}, ${position.lon.toFixed(2)}</h2>
    
    <div class="space-y-2">
      <p><span class="font-semibold">🌅 Sunrise:</span> ${formatTime(sunTimes.sunrise)} <span class="italic">(Cloud: ${score.sunriseCloud}%)</span></p>
      <p><span class="font-semibold">🌇 Sunset:</span> ${formatTime(sunTimes.sunset)} <span class="italic">(Cloud: ${score.sunsetCloud}%)</span></p>
      <p><span class="font-semibold">📸 Photo Score (Sunrise):</span> <span class="text-blue-600">${score.sunriseScore.toFixed(1)}/10</span></p>
      <p><span class="font-semibold">📸 Photo Score (Sunset):</span> <span class="text-blue-600">${score.sunsetScore.toFixed(1)}/10</span></p>
    </div>

    <div class="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
      <p class="font-semibold">Tip:</p>
      <p>${photoTip(score)}</p>
    </div>
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

function renderError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="p-6 bg-red-100 border-l-4 border-red-500 rounded">
      <h2 class="text-xl font-semibold text-red-600">Error</h2>
      <p class="text-red-800">${message}</p>
    </div>
  `;
}
