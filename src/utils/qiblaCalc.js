// ============================================================
// Qibla Direction Calculator
// Uses spherical trigonometry (great circle bearing formula)
// Kaaba coordinates: 21.4225°N, 39.8262°E
// ============================================================

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export function calculateQibla(userLat, userLng) {
  const φ1 = toRad(userLat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - userLng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return {
    degrees: Math.round(bearing * 10) / 10,
    cardinal: degreesToCardinal(bearing),
    description: describeDirection(bearing),
  };
}

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

function degreesToCardinal(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function describeDirection(deg) {
  if (deg >= 337.5 || deg < 22.5) return 'North';
  if (deg < 67.5) return 'Northeast';
  if (deg < 112.5) return 'East';
  if (deg < 157.5) return 'Southeast';
  if (deg < 202.5) return 'South';
  if (deg < 247.5) return 'Southwest';
  if (deg < 292.5) return 'West';
  return 'Northwest';
}

export function distanceToKaaba(userLat, userLng) {
  const R = 6371; // Earth radius in km
  const φ1 = toRad(userLat);
  const φ2 = toRad(KAABA_LAT);
  const Δφ = toRad(KAABA_LAT - userLat);
  const Δλ = toRad(KAABA_LNG - userLng);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Predefined cities
export const CITIES = [
  { name: 'Mecca', country: 'Saudi Arabia', lat: 21.3891, lng: 39.8579, tz: 3 },
  { name: 'Medina', country: 'Saudi Arabia', lat: 24.4672, lng: 39.6151, tz: 3 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, tz: 3 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, tz: 2 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, tz: 5 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, tz: 5 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, tz: 6 },
  { name: 'Sylhet', country: 'Bangladesh', lat: 24.8949, lng: 91.8687, tz: 6 },
  { name: 'Chittagong', country: 'Bangladesh', lat: 22.3569, lng: 91.7832, tz: 6 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, tz: 8 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, tz: 7 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, tz: 4 },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, tz: 0 },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tz: -5 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, tz: -5 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tz: 1 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, tz: 1 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, tz: 3 },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.3890, tz: 3.5 },
  { name: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661, tz: 3 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612, tz: 5.5 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, tz: 5.5 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, tz: 3 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, tz: 1 },
];
