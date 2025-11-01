package com.example.backend.util;

/**
 * Utility class for geographic calculations
 */
public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0; // Bán kính Trái Đất (km)
    private static final double MAX_VALID_DISTANCE_METERS = 1000.0; // 1km

    /**
     * Calculate distance between two GPS coordinates using Haversine formula
     * 
     * @param lat1 Latitude of point 1 (degrees)
     * @param lon1 Longitude of point 1 (degrees)
     * @param lat2 Latitude of point 2 (degrees)
     * @param lon2 Longitude of point 2 (degrees)
     * @return Distance in meters
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Convert degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);

        // Haversine formula
        double dLat = lat2Rad - lat1Rad;
        double dLon = lon2Rad - lon1Rad;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Distance in kilometers
        double distanceKm = EARTH_RADIUS_KM * c;

        // Convert to meters
        return distanceKm * 1000;
    }

    /**
     * Check if the distance between two coordinates is within valid range (1km)
     * 
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @return true if distance <= 1km, false otherwise
     */
    public static boolean isWithinValidRange(double lat1, double lon1, double lat2, double lon2) {
        double distance = calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= MAX_VALID_DISTANCE_METERS;
    }

    /**
     * Format distance for display
     * 
     * @param meters Distance in meters
     * @return Formatted string (e.g., "250m" or "1.5km")
     */
    public static String formatDistance(double meters) {
        if (meters < 1000) {
            return String.format("%.0fm", meters);
        } else {
            return String.format("%.2fkm", meters / 1000);
        }
    }

    /**
     * Validate GPS coordinates
     * 
     * @param latitude Latitude (-90 to 90)
     * @param longitude Longitude (-180 to 180)
     * @return true if valid, false otherwise
     */
    public static boolean isValidCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }
        return latitude >= -90 && latitude <= 90 && 
               longitude >= -180 && longitude <= 180;
    }
}
