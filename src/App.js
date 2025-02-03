import React, { useState, useEffect } from 'react';
import fetchWeatherData from './api';
import './App.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);


const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [placeName, setPlaceName] = useState('');

  // Function to fetch user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const coords = `${lat},${lon}`;

          // Use reverse geocoding to get city name
          const cityName = await getCityName(lat, lon);
          setLocation(cityName || coords);
          setPlaceName(cityName);

          fetchWeather(coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Location access denied. Please enter a location manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Function to fetch weather data
  const fetchWeather = async (loc) => {
    setError('');
    const data = await fetchWeatherData(loc);
    console.log("Fetched Weather Data:", data);

    if (data) {
      setWeather(data);
      setPlaceName(data.resolvedAddress || loc);
    } else {
      setError('Unable to fetch weather data. Please try again.');
    }
  };

  // Reverse Geocoding Function (Using OpenStreetMap's Nominatim API)
  const getCityName = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
      const data = await response.json();
  
      // Check if the 'address' property exists and if so, extract the city, town, or village
      if (data.address) {
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state
        );
      } 
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Error fetching location";
    }
  };
  

  // Generate temperature chart data
  const generateChartData = () => {
    if (!weather || !weather.days) return null;
    return {
      labels: weather.days.map((day) => day.datetime),
      datasets: [
        {
          label: 'Daily Temperature (°C)',
          data: weather.days.map((day) => day.temp),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Weather App</h1>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter location"
          className="search-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={() => fetchWeather(location)} className="search-button">
          Search
        </button>
      </div>

      {/* Display Location Name */}
      {placeName && <h2 className="location-name">📍 {placeName}</h2>}

      {/* Display Error */}
      {error && <p className="error-message">{error}</p>}

      {/* Display Weather Data */}
      {weather && (
        <>
          <div className="weather-container">
            <h2 className="location-name">{placeName}</h2> {/* Show detected place name */}
            <p className="weather-detail">Temperature: {weather.currentConditions.temp}°C</p>
            <p className="weather-detail">Condition: {weather.currentConditions.conditions}</p>
          </div>

          <div className="chart-container">
            <h3>7-Day Forecast</h3>
            {weather.days && (
              <Line
                data={generateChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Temperature (°C)' } },
                  },
                }}
                height={300}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherApp;
