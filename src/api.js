import axios from 'axios';

const apiKey = '2HJUDHRNZ35Z72WP6GDHC4XME';
const apiUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const fetchWeatherData = async (location) => {
  const url = `${apiUrl}/${location}?unitGroup=metric&include=current,days,hours&key=${apiKey}&contentType=json`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    // Extract current weather data
    const currentWeather = data.currentConditions;

    // Extract additional metrics
    const temperature = currentWeather.temp;
    const feelsLike = currentWeather.feelslike;
    const visibility = currentWeather.visibility; // in meters
    const uvIndex = currentWeather.uvindex;
    const sunrise = new Date(data.currentConditions.sunriseEpoch * 1000).toLocaleTimeString(); // Convert from epoch time
    const sunset = new Date(data.currentConditions.sunsetEpoch * 1000).toLocaleTimeString(); // Convert from epoch time
    const aqi = data.currentConditions.aqi; // Air Quality Index

    // Return the weather data with additional metrics
    return {
      temperature,
      feelsLike,
      visibility: visibility / 1000, // Convert from meters to kilometers
      uvIndex,
      sunrise,
      sunset,
      aqi,
    };

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

export default fetchWeatherData;

