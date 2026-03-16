const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const City = require("../models/City");
const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });
const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
router.use(authMiddleware);
const getLLM = () =>
  new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    maxTokens: 1024,
  });
// Helper: fetch + cache live weather for a city
const fetchWeatherForCity = async (cityName) => {
  const key = `weather_${cityName.toLowerCase()}`;
  let cached = cache.get(key);
  if (cached) return cached;
  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: { q: cityName, appid: process.env.API_KEY, units: "metric" },
    },
  );
  const d = res.data;
  const data = {
    city: d.name,
    country: d.sys.country,
    temp: d.main.temp,
    feelsLike: d.main.feels_like,
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    wind: d.wind.speed,
    description: d.weather[0].description,
    rain: !!d.rain,
    visibility: d.visibility,
  };
  cache.set(key, data);
  return data;
};
// POST /api/ai/advisor — auto briefing of all user cities
router.post("/advisor", async (req, res) => {
  try {
    const cities = await City.find({ userId: req.user.id });
    if (!cities.length)
      return res.json({ advice: "Add cities to get a weather briefing." });
    const weatherData = await Promise.all(
      cities.map((c) => fetchWeatherForCity(c.name).catch(() => null)),
    );
    const valid = weatherData.filter(Boolean);
    const llm = getLLM();
    const response = await llm.invoke([
      new SystemMessage(`You are SkyCast AI, a world-class meteorological assistant. 
Provide a concise briefing: 1-2 sentence overview then city highlights.
Use weather emojis. Be conversational yet professional. Max 200 words.`),
      new HumanMessage(`Live weather data:\n${JSON.stringify(valid, null, 2)} 
\n\nProvide an intelligent briefing.`),
    ]);
    res.json({ advice: response.content });
  } catch (error) {
    console.error("Advisor error:", error.message);
    res.status(500).json({ message: "AI service temporarily unavailable" });
  }
});
// POST /api/ai/query — free chat with weather context + conversation history
router.post("/query", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim())
      return res.status(400).json({ message: "Message required" });
    const cities = await City.find({ userId: req.user.id });
    let weatherContext = "No cities tracked.";
    if (cities.length) {
      const wd = await Promise.all(
        cities.map((c) =>
          fetchWeatherForCity(c.name).catch(() => ({
            city: c.name,
            error: true,
          })),
        ),
      );
      weatherContext = JSON.stringify(wd.filter(Boolean), null, 2);
    }
    const llm = getLLM();
    // Map last 8 messages to LangChain message objects
    const convHistory = history
      .slice(-8)
      .map((m) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new SystemMessage(m.content),
      );
    const response = await llm.invoke([
      new SystemMessage(`You are SkyCast AI, an expert meteorological assistant.
LIVE WEATHER DATA:\n${weatherContext}\n
Answer clearly, reference live data, suggest tips, keep under 150 words.`),
      ...convHistory,
      new HumanMessage(message),
    ]);
    res.json({ reply: response.content });
  } catch (error) {
    console.error("Query error:", error.message);
    res.status(500).json({ message: "AI service temporarily unavailable" });
  }
});
module.exports = router;
