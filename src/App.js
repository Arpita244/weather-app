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

  // Fetch weather data
  const fetchWeather = async (loc) => {
    setError('');
    const data = await fetchWeatherData(loc);
    if (data) {
      setWeather(data);
    } else {
      setError('Unable to fetch weather data. Please try again.');
    }
  };

  // Automatically detect location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = `${latitude},${longitude}`;
          setLocation(userLocation);
          await fetchWeather(userLocation);
        },
        (error) => {
          setError('Location access denied. Please enter a location manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Handle search input
  const handleSearch = async () => {
    if (!location) {
      setError('Please enter a location.');
      return;
    }
    await fetchWeather(location);
  };

  // Generate data for temperature chart
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

      {error && <p className="error-message">{error}</p>}

      {weather && (
        <>
          <div className="weather-container">
            <h2 className="location-name">{weather.resolvedAddress}</h2>
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
