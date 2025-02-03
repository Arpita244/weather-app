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
  const [placeName, setPlaceName] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  // Function to fetch weather data
  const fetchWeather = async (loc) => {
    setError('');
    const data = await fetchWeatherData(loc);
    console.log("Fetched Weather Data:", data);

    if (data) {
      setWeather(data);
      setPlaceName(data.resolvedAddress || loc); // Update place name after fetching weather
    } else {
      setError('Unable to fetch weather data. Please try again.');
    }
  };

  // Reverse Geocoding Function (Using OpenStreetMap's Nominatim API)
  const getCityName = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || "Unknown Location";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return null;
    }
  };

  // Ask for location permission and fetch weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (permission.state === 'granted' || permission.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const userLocation = `${latitude},${longitude}`;

              // Get city name from reverse geocoding
              const cityName = await getCityName(latitude, longitude);
              setLocation(cityName || userLocation); // Update location to city name or coordinates
              setPlaceName(cityName || 'Unknown Location'); // Update place name

              await fetchWeather(userLocation); // Fetch weather data based on location
            },
            (error) => {
              setError('Location access denied. Please enter a location manually.');
            }
          );
        } else {
          setError('Location access denied. Please enter a location manually.');
        }
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Handle search input manually
  const handleSearch = async () => {
    if (!location) {
      setError('Please enter a location.');
      return;
    }
    await fetchWeather(location);
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
        <button onClick={handleSearch} className="search-button">
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
