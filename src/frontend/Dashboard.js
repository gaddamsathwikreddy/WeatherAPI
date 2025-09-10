// src/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem("recentCities");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [unit, setUnit] = useState("C"); // "C" or "F"
  const navigate = useNavigate();

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Persist recent cities
  useEffect(() => {
    try {
      localStorage.setItem("recentCities", JSON.stringify(recentCities));
    } catch {}
  }, [recentCities]);

  // Auto-detect location on first mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast`,
            {
              params: {
                latitude,
                longitude,
                timezone: "auto",
                current_weather: true,
                hourly:
                  "temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,precipitation,windspeed_10m",
                daily: "sunrise,sunset,temperature_2m_max,temperature_2m_min",
              },
            }
          );

          // Reverse geocoding to get city name
          const geoRes = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/reverse`,
            { params: { latitude, longitude, count: 1 } }
          );
          const cityName = geoRes.data?.results?.[0]?.name || "Your Location";
          getWeather(cityName);
        } catch {}
      });
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Utility: Celsius → Fahrenheit
  const toF = (c) => Math.round(((c * 9) / 5 + 32) * 10) / 10;
  const formatTemp = (c) =>
    c == null
      ? "—"
      : unit === "C"
      ? `${Math.round(c * 10) / 10}°C`
      : `${toF(c)}°F`;

  // Fetch weather
  const getWeather = async (selectedCity) => {
    const cityName = selectedCity || city;
    if (!cityName) {
      setError("Please enter a city name");
      return;
    }

    try {
      setError("");
      setWeather(null);
      setLoading(true);

      // Geocoding
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search`,
        { params: { name: cityName, count: 1 } }
      );

      if (!geoRes.data?.results?.length) {
        setError("City not found. Try a different name.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      // Weather
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude,
            longitude,
            timezone: "auto",
            current_weather: true,
            hourly:
              "temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,precipitation,windspeed_10m",
            daily: "sunrise,sunset,temperature_2m_max,temperature_2m_min",
          },
        }
      );

      const current = weatherRes.data.current_weather;
      const hourly = weatherRes.data.hourly;
      const daily = weatherRes.data.daily;

      const idx = hourly.time.indexOf(current.time) ?? 0;

      const codeMap = {
        0: { desc: "Clear Sky", icon: "☀️" },
        1: { desc: "Mainly Clear", icon: "🌤️" },
        2: { desc: "Partly Cloudy", icon: "⛅" },
        3: { desc: "Overcast", icon: "☁️" },
        45: { desc: "Fog", icon: "🌫️" },
        61: { desc: "Rain", icon: "🌧️" },
        71: { desc: "Snow", icon: "❄️" },
        95: { desc: "Thunderstorm", icon: "⛈️" },
      };

      setWeather({
        city: name,
        country,
        temperature: current.temperature ?? hourly.temperature_2m[idx],
        feelsLike: hourly.apparent_temperature[idx] ?? current.temperature,
        windspeed: current.windspeed ?? hourly.windspeed_10m[idx],
        description: codeMap[current.weathercode]?.desc || "Unknown",
        icon: codeMap[current.weathercode]?.icon || "❔",
        humidity: hourly.relative_humidity_2m[idx],
        precipitation: hourly.precipitation[idx],
        pressure: hourly.pressure_msl[idx],
        sunrise: daily.sunrise[0]?.split("T")[1],
        sunset: daily.sunset[0]?.split("T")[1],
        time: current.time,
      });

      // Save in recents
      setRecentCities((prev) => {
        const updated = [name, ...prev.filter((c) => c !== name)];
        return updated.slice(0, 3);
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Network issue. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(180deg, #d6e9ff, #bfe9ff);
          font-family: Inter, sans-serif;
        }
        .dashboard-card {
          width: 100%;
          max-width: 720px;
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 18px;
        }
        .btn {
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        .btn.primary { background: #2563eb; color: white; }
        .btn.secondary { background: #059669; color: white; }
        .btn.warn { background: #f97316; color: white; }
        .btn.ghost { border: 1px solid #e6eef9; background: transparent; }
        @media (max-width: 760px) {
          .dashboard-card { grid-template-columns: 1fr; max-width: 420px; }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-card">
          {/* Left */}
          <div>
            {/* Project name added here */}
            <h1 style={{ marginBottom: "10px", color: "#2563eb" }}>🌦 Weather Now</h1>

            <h2>Welcome, Jamie 👋</h2>
            <p>Check live weather conditions with ease.</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
              <input
                style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #ddd" }}
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getWeather()}
              />
              <button className="btn primary" onClick={() => getWeather()}>Get</button>
              <button className="btn secondary" onClick={() => getWeather(city)}>Refresh</button>
              <button className="btn ghost" onClick={() => setUnit(u => u === "C" ? "F" : "C")}>Toggle °C/°F</button>
              <button className="btn warn" onClick={handleLogout}>Logout</button>
            </div>

            {recentCities.length > 0 && (
              <div>
                <strong>Recent:</strong>{" "}
                {recentCities.map((c, i) => (
                  <button key={i} className="btn ghost" style={{ margin: 4 }} onClick={() => getWeather(c)}>{c}</button>
                ))}
              </div>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>⏳ Loading...</p>}
          </div>

          {/* Right (Weather summary) */}
          <div>
            {weather ? (
              <>
                <h3>{weather.icon} {weather.city}, {weather.country}</h3>
                <p>{weather.description}</p>
                <p>🌡 {formatTemp(weather.temperature)} (Feels like {formatTemp(weather.feelsLike)})</p>
                <p>💨 {weather.windspeed} km/h</p>
                <p>💧 {weather.humidity}% humidity</p>
                <p>🌧 {weather.precipitation} mm rain</p>
                <p>📈 {weather.pressure} hPa</p>
                <p>🌅 {weather.sunrise} | 🌇 {weather.sunset}</p>
                <small>Last updated: {new Date(weather.time).toLocaleTimeString()}</small>
              </>
            ) : (
              <p>Search for a city to view weather details.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
