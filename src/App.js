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

  // Automatically detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = `${latitude},${longitude}`;
          setLocation(userLocation);
          const data = await fetchWeatherData(userLocation);
          if (data) {
            setWeather(data);
          } else {
            setError('Unable to fetch weather data. Please try again.');
          }
        },
        (error) => {
          setError('Location access denied. Please enter a location manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Function to generate chart data
  const generateChartData = () => {
    if (!weather || !weather.days) return null;
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
