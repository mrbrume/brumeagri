const axios = require('axios');
const checkFarmAccess = require('../utils/checkFarmAccess');

// @route  GET /api/weather/farm/:farmId
// @desc   Get current weather + short forecast for a farm's location
const getFarmWeather = async (req, res) => {
  try {
    const farmDoc = await checkFarmAccess(req.params.farmId, req.user._id);
    if (!farmDoc) {
      return res.status(403).json({ message: 'Not authorized to view weather for this farm' });
    }

    // We use the farm's "location" text field (e.g. "Kaduna, Nigeria") as the city query
    const city = farmDoc.location;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Current weather
    const currentRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: apiKey, units: 'metric' },
    });

    // 3-day forecast (OpenWeather's free "forecast" endpoint returns data every 3 hours for 5 days;
    // we'll pick one reading per day to keep it simple)
    const forecastRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: apiKey, units: 'metric' },
    });

    // Pick the forecast entry closest to midday for each of the next 3 days
    const dailyForecast = [];
    const seenDates = new Set();

    for (const entry of forecastRes.data.list) {
      const date = entry.dt_txt.split(' ')[0];
      const hour = entry.dt_txt.split(' ')[1];

      if (!seenDates.has(date) && hour === '12:00:00') {
        seenDates.add(date);
        dailyForecast.push({
          date,
          temp: Math.round(entry.main.temp),
          condition: entry.weather[0].main,
        });
      }

      if (dailyForecast.length >= 3) break;
    }

    res.json({
      location: city,
      current: {
        temp: Math.round(currentRes.data.main.temp),
        condition: currentRes.data.weather[0].main,
        humidity: currentRes.data.main.humidity,
      },
      forecast: dailyForecast,
    });
  } catch (error) {
    // OpenWeather returns 404 if the city name isn't recognized
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Weather data not found for this farm location' });
    }
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { getFarmWeather };