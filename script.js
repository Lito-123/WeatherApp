// DOM elements
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const coordinatesDisplay = document.getElementById('coordinates');
const weatherDataContainer = document.getElementById('weatherData');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error');
const toggleSunTimesButton = document.getElementById('toggleSunTimes');
const sunTimesContainer = document.getElementById('sunTimes');
const toggleIcon = document.getElementById('toggleIcon');

// Weather code mapping to descriptions
const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

// Weather code to icon mapping
const weatherIcons = {
    0: '☀️', // Clear sky
    1: '🌤️', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Fog
    48: '🌫️', // Depositing rime fog
    51: '🌦️', // Light drizzle
    53: '🌦️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    56: '🌨️', // Light freezing drizzle
    57: '🌨️', // Dense freezing drizzle
    61: '🌦️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    66: '🌨️', // Light freezing rain
    67: '🌨️', // Heavy freezing rain
    71: '🌨️', // Slight snow fall
    73: '🌨️', // Moderate snow fall
    75: '❄️', // Heavy snow fall
    77: '❄️', // Snow grains
    80: '🌦️', // Slight rain showers
    81: '🌧️', // Moderate rain showers
    82: '🌧️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '❄️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with slight hail
    99: '⛈️'  // Thunderstorm with heavy hail
};

// Event listeners
searchButton.addEventListener('click', handleCitySearch);
locationButton.addEventListener('click', getLocationWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCitySearch();
});
toggleSunTimesButton.addEventListener('click', toggleSunTimes);

// Show loading state
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    weatherDataContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Show error
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    weatherDataContainer.classList.add('hidden');
    hideLoading();
}

// Toggle sunrise/sunset info
function toggleSunTimes() {
    sunTimesContainer.classList.toggle('hidden');
    toggleIcon.textContent = sunTimesContainer.classList.contains('hidden') ? '▼' : '▲';
}

// Handle city search
function handleCitySearch() {
    const city = cityInput.value.trim();
    if (city) {
        showLoading();
        // Use Geocoding API to convert city name to coordinates
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unable to find location');
                }
                return response.json();
            })
            .then(data => {
                if (!data.results || data.results.length === 0) {
                    throw new Error('City not found. Please check the spelling.');
                }
                const location = data.results[0];
                const { latitude, longitude, name, country } = location;
                
                // Display coordinates
                coordinatesDisplay.textContent = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
                
                // Get weather data for the location
                getWeatherByCoordinates(latitude, longitude, `${name}, ${country}`);
            })
            .catch(error => {
                showError(error.message);
            });
    } else {
        showError('Please enter a city name');
    }
}

// Get user's location and weather
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            coordinatesDisplay.textContent = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
            
            // Get location name from coordinates
            fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`)
                .then(response => response.json())
                .then(data => {
                    let locationName = "Your Location";
                    if (data.results && data.results.length > 0) {
                        const { name, country } = data.results[0];
                        locationName = `${name}, ${country}`;
                    }
                    getWeatherByCoordinates(latitude, longitude, locationName);
                })
                .catch(() => {
                    // If reverse geocoding fails, still get weather with default name
                    getWeatherByCoordinates(latitude, longitude, "Your Location");
                });
        }, error => {
            let errorMessage = 'Unable to retrieve your location';
            
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = 'Location permission denied. Please enable location access.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = 'Location information is unavailable.';
            } else if (error.code === error.TIMEOUT) {
                errorMessage = 'The request to get location timed out.';
            }
            
            showError(errorMessage);
        });
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

// Get weather by coordinates
function getWeatherByCoordinates(latitude, longitude, locationName) {
    // Fetch weather data from Open-Meteo API
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,cloud_cover&daily=sunrise,sunset&timezone=auto`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to fetch weather data');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data, locationName);
        })
        .catch(error => {
            showError(error.message);
        });
}

// Display weather data
function displayWeatherData(data, locationName) {
    // Hide loading indicator
    hideLoading();
    
    // Show weather container
    weatherDataContainer.classList.remove('hidden');
    
    // Extract current weather data
    const current = data.current;
    const weatherCode = current.weather_code;
    
    // Update UI with weather data
    document.getElementById('cityName').textContent = locationName;
    document.getElementById('weatherDescription').textContent = weatherCodes[weatherCode] || 'Unknown';
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}${data.current_units.temperature_2m}`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}${data.current_units.apparent_temperature}`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;
    document.getElementById('wind').textContent = `${current.wind_speed_10m}${data.current_units.wind_speed_10m}`;
    document.getElementById('cloudCover').textContent = `${current.cloud_cover}${data.current_units.cloud_cover}`;
    
    // Weather icon
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.innerHTML = `<span class="icon-emoji">${weatherIcons[weatherCode] || '❓'}</span>`;
    
    // Sun times
    if (data.daily && data.daily.sunrise && data.daily.sunset) {
        const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        document.getElementById('sunrise').textContent = sunriseTime;
        document.getElementById('sunset').textContent = sunsetTime;
    }
}