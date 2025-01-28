import React, { useState } from 'react';
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

  const handleSearch = async () => {
    if (!location) {
      setError('Please enter a location.');
      return;
    }
    setError('');
    const data = await fetchWeatherData(location);
    if (data) {
      setWeather(data);
    } else {
      setError('Unable to fetch weather data. Please try again.');
    }
  };

  const generateChartData = () => {
    const labels = weather.days.map((day) => day.datetime); // Dates for the next 7 days
    const temperatures = weather.days.map((day) => day.temp); // Temperatures for the next 7 days

    return {
      labels,
      datasets: [
        {
          label: 'Daily Temperature (°C)',
          data: temperatures,
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
            <Line data={generateChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherApp;