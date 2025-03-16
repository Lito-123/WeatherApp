# Weather App

A lightweight, user-friendly weather application that provides real-time weather information based on city search or current location.

![Weather App Screenshot](https://via.placeholder.com/800x400)

## Features

- **City-based Weather Search**: Look up weather conditions for any city worldwide
- **Geolocation Support**: Get weather information for your current location with a single click
- **Current Weather Data**: View detailed information including:
  - Temperature and "feels like" temperature
  - Weather description with emoji icons
  - Humidity percentage
  - Wind speed
  - Cloud cover percentage
- **Sunrise & Sunset Times**: Toggle display of daily sunrise and sunset times
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages for failed searches or location access issues

## Usage

1. **Search by City**:
   - Type a city name in the search box
   - Press Enter or click the search button
   - View the weather details for that location

2. **Use Current Location**:
   - Click the "Use My Location" button
   - Allow location access when prompted
   - View weather for your current position

3. **View Sun Times**:
   - Click the toggle arrow to expand/collapse sunrise and sunset information

## Technologies Used

- **HTML/CSS/JavaScript**: Core web technologies
- **Open-Meteo API**: Free weather data source
- **Geocoding API**: For converting between location names and coordinates

## API Information

This app uses the following free APIs:
- [Open-Meteo Weather API](https://open-meteo.com/)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

No API key is required to use these services.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/weather-app.git
   ```

2. Open `index.html` in your browser.

Alternatively, you can host the files on any web server or static site hosting service.

## Browser Compatibility

The Weather App works in all modern browsers that support:
- ES6 JavaScript
- Geolocation API
- Fetch API

## Privacy Notice

This application:
- Only accesses your location with permission
- Does not store any personal data
- Makes direct API calls without storing search history

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.