// ============================================================
// Geocoding — OpenStreetMap Nominatim
// Free, no API key required, returns precise lat/lng for any
// place: village, union, upazila, district, city, country.
// Rate limit: 1 req/sec (we debounce on the UI side)
// ============================================================

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Search for any place name using OSM Nominatim.
 * Returns up to `limit` results with name, display_name, lat, lng, type.
 *
 * @param {string} query   e.g. "Shamshernagar, Kamalganj, Moulvibazar"
 * @param {number} limit   max results (default 6)
 * @returns {Promise<GeoResult[]>}
 */
export async function searchPlace(query, limit = 6) {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
    'accept-language': 'en',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'IslamicHub/1.0 (prayer-times-app)' },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const data = await res.json();

  return data.map((item) => {
    const addr = item.address || {};

    // Build a concise label for the result
    const parts = [
      addr.village || addr.suburb || addr.neighbourhood || addr.hamlet ||
      addr.town || addr.city_district,
      addr.city || addr.town || addr.county || addr.municipality,
      addr.state_district || addr.district,
      addr.state,
      addr.country,
    ].filter(Boolean);

    // Remove consecutive duplicates
    const deduped = parts.filter((p, i) => p !== parts[i - 1]);

    return {
      displayName: deduped.slice(0, 4).join(', '),
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,        // "village", "suburb", "city", etc.
      country: addr.country || '',
      countryCode: addr.country_code?.toUpperCase() || '',
      // Derive timezone offset from longitude as a reasonable default;
      // the Al-Adhan API doesn't need timezone — it uses lat/lng directly.
      tz: Math.round(parseFloat(item.lon) / 15),
    };
  });
}
