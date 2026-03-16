const axios = require("axios");
async function getWeather(cityName) {
  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        q: cityName,
        appid: process.env.API_KEY,
        units: "metric",
      },
    },
  );
  const data = response.data;
  return {
    city: data.name,
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind: data.wind.speed,
    windDir: data.wind.deg,
    visibility: data.visibility,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    country: data.sys.country,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
  };
}
module.exports = { getWeather };
