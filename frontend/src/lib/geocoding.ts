/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free and no API key required
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode an address string to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PatientManagementSystem/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name || address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Geocode with multiple fallback strategies
 * Tries different address formats if the first one fails
 */
export async function geocodeAddressWithFallback(
  line1?: string,
  line2?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _county?: string // County is included for API compatibility but not used in geocoding
): Promise<GeocodingResult | null> {
  // Build alternative address strings
  const alternatives = buildAlternativeAddressStrings(line1, city, state, postalCode);
  
  // Also try the full address string
  const fullAddress = buildAddressString(line1, line2, city, state, postalCode, _county);
  if (fullAddress && !alternatives.includes(fullAddress)) {
    alternatives.unshift(fullAddress);
  }

  console.log("Attempting geocoding with addresses:", alternatives);

  // Try each alternative until one succeeds
  for (const address of alternatives) {
    if (!address || address.trim().length === 0) continue;
    
    const result = await geocodeAddress(address);
    if (result) {
      console.log("Geocoding succeeded with:", address);
      return result;
    }
  }

  console.log("All geocoding attempts failed");
  return null;
}

/**
 * Build full address string from address components
 * Prioritizes the most important fields for better geocoding results
 */
export function buildAddressString(
  line1?: string,
  line2?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _county?: string // County not used in geocoding as it's less reliable
): string {
  const parts: string[] = [];

  // Priority order: line1, city, state, postalCode (most reliable)
  if (line1?.trim()) parts.push(line1.trim());
  if (city?.trim()) parts.push(city.trim());
  if (state?.trim()) parts.push(state.trim());
  if (postalCode?.trim()) parts.push(postalCode.trim());
  // line2 is less reliable, add only if needed
  if (line2?.trim() && parts.length < 3) parts.splice(1, 0, line2.trim());

  return parts.join(", ");
}

/**
 * Build alternative address strings for fallback geocoding
 * Uses only the most reliable fields (line1, city, state, postalCode)
 */
export function buildAlternativeAddressStrings(
  line1?: string,
  city?: string,
  state?: string,
  postalCode?: string
): string[] {
  const alternatives: string[] = [];

  // Strategy 1: Full address with postal code (most accurate)
  if (line1 && city && state && postalCode) {
    alternatives.push(`${line1.trim()}, ${city.trim()}, ${state.trim()} ${postalCode.trim()}`);
  }

  // Strategy 2: Street + City + State
  if (line1 && city && state) {
    alternatives.push(`${line1.trim()}, ${city.trim()}, ${state.trim()}`);
  }

  // Strategy 3: Just street + postal code (if postal code is reliable)
  if (line1 && postalCode) {
    alternatives.push(`${line1.trim()}, ${postalCode.trim()}`);
  }

  // Strategy 4: City + State (fallback)
  if (city && state) {
    alternatives.push(`${city.trim()}, ${state.trim()}`);
  }

  return alternatives;
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "PatientManagementSystem/1.0",
      },
    });

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

