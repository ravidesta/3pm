// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Weather Service
// OpenWeatherMap API integration
// ─────────────────────────────────────────────────────────────────────────────

import type { WeatherContext, WeatherForecast } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';

const weatherIconToEmoji = (iconCode: string): string => {
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '🌥️', '04n': '🌥️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return map[iconCode] ?? '🌡️';
};

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherContext> {
  if (!API_KEY) return getMockWeather();

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=8`),
    ]);

    const current = await currentRes.json();
    const forecastData = await forecastRes.json();

    const forecast: WeatherForecast[] = (forecastData.list ?? [])
      .slice(0, 5)
      .map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString(),
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather?.[0]?.main ?? 'Clear',
        icon: weatherIconToEmoji(item.weather?.[0]?.icon ?? '01d'),
      }));

    return {
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      condition: current.weather?.[0]?.main ?? 'Clear',
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind?.speed ?? 0),
      icon: weatherIconToEmoji(current.weather?.[0]?.icon ?? '01d'),
      location: current.name ?? 'Your location',
      forecast,
    };
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return getMockWeather();
  }
}

function getMockWeather(): WeatherContext {
  return {
    temperature: 18,
    feelsLike: 16,
    condition: 'Clear',
    humidity: 55,
    windSpeed: 10,
    icon: '☀️',
    location: 'New York',
    forecast: [
      { date: new Date(Date.now() + 86400000).toISOString(), high: 20, low: 14, condition: 'Sunny', icon: '☀️' },
      { date: new Date(Date.now() + 172800000).toISOString(), high: 17, low: 12, condition: 'Cloudy', icon: '⛅' },
      { date: new Date(Date.now() + 259200000).toISOString(), high: 15, low: 10, condition: 'Rain', icon: '🌧️' },
    ],
  };
}

// Temperature → outfit layer recommendation
export function getLayeringAdvice(temp: number): string {
  if (temp >= 25) return 'Light & Breathable';
  if (temp >= 18) return 'Single Layer';
  if (temp >= 12) return 'Light Layer';
  if (temp >= 5)  return 'Warm Layer';
  return 'Heavy Layer + Coat';
}
