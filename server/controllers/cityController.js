const City = require("../models/City");
const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // 5-min cache
const calculateRisk = (temp, humidity, wind) => {
  if (temp > 40) return { level: "Extreme Heat", color: "red" };
  if (temp > 35) return { level: "High Heat", color: "orange" };
  if (temp < 0) return { level: "Freezing", color: "blue" };
  if (temp < 5) return { level: "Cold Risk", color: "cyan" };
  if (humidity > 85) return { level: "High Humidity", color: "teal" };
  if (wind > 15) return { level: "Strong Wind", color: "purple" };
  return { level: "Normal", color: "green" };
};
exports.addCity = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "City name required" });
    // Validate city exists BEFORE saving to database
    try {
      await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: { q: name.trim(), appid: process.env.API_KEY, units: "metric" },
      });
    } catch (e) {
      return res
        .status(400)
        .json({ message: "City not found. Check spelling." });
    }
    // Case-insensitive duplicate check
    const exists = await City.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      userId: req.user.id,
    });
    if (exists)
      return res
        .status(400)
        .json({ message: "City already in your dashboard" });
    const city = await City.create({ name: name.trim(), userId: req.user.id });
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    const enrichedCities = await Promise.all(
      cities.map(async (city) => {
        const cacheKey = `weather_${city.name.toLowerCase()}`;
        let weatherData = cache.get(cacheKey);
        if (!weatherData) {
          try {
            const weatherRes = await axios.get(
              "https://api.openweathermap.org/data/2.5/weather",
              {
                params: {
                  q: city.name,
                  appid: process.env.API_KEY,
                  units: "metric",
                },
              },
            );
            const d = weatherRes.data;
            weatherData = {
              temp: d.main.temp,
              feelsLike: d.main.feels_like,
              humidity: d.main.humidity,
              pressure: d.main.pressure,
              wind: d.wind.speed,
              windDir: d.wind.deg,
              visibility: d.visibility,
              description: d.weather[0].description,
              icon: d.weather[0].icon,
              country: d.sys.country,
              sunrise: d.sys.sunrise,
              sunset: d.sys.sunset,
            };
            cache.set(cacheKey, weatherData);
          } catch (e) {
            weatherData = {
              temp: 0,
              humidity: 0,
              description: "Unavailable",
              error: true,
            };
          }
        }
        return {
          _id: city._id,
          name: city.name,
          isFavorite: city.isFavorite,
          weather: weatherData,
          risk: calculateRisk(
            weatherData.temp,
            weatherData.humidity,
            weatherData.wind,
          ),
          addedAt: city.createdAt,
        };
      }),
    );
    res.json(enrichedCities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cities" });
  }
};
exports.toggleFavorite = async (req, res) => {
  try {
    const city = await City.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!city) return res.status(404).json({ message: "City not found" });
    city.isFavorite = !city.isFavorite;
    await city.save();
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!city) return res.status(404).json({ message: "City not found" });
    res.json({ message: "City removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
