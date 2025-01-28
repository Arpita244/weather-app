import React, { useState } from 'react';
import fetchWeatherData from './api';
import './App.css';

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
        <button
          onClick={handleSearch}
          className="search-button"
        >
          Search
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {weather && (
        <div className="weather-container">
          <h2 className="location-name">{weather.resolvedAddress}</h2>
          <p className="weather-detail">Temperature: {weather.currentConditions.temp}°C</p>
          <p className="weather-detail">Condition: {weather.currentConditions.conditions}</p>
          <p className="weather-detail">Humidity: {weather.currentConditions.humidity}%</p>
          <p className="weather-detail">Wind Speed: {weather.currentConditions.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
