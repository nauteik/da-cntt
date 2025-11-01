package com.example.backend.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for GeoUtils
 */
class GeoUtilsTest {

    @Test
    void testCalculateDistance_SameLocation() {
        // Same coordinates should have 0 distance
        double distance = GeoUtils.calculateDistance(
            10.762622, 106.660172,
            10.762622, 106.660172
        );
        assertEquals(0.0, distance, 0.1);
    }

    @Test
    void testCalculateDistance_ShortDistance() {
        // Ho Chi Minh City coordinates (~500m apart)
        double distance = GeoUtils.calculateDistance(
            10.762622, 106.660172,  // Point A
            10.767000, 106.663000   // Point B
        );
        assertTrue(distance > 400 && distance < 600, 
            "Distance should be approximately 500m, got: " + distance);
    }

    @Test
    void testCalculateDistance_LongDistance() {
        // Hanoi to Ho Chi Minh City (~1600km)
        double distance = GeoUtils.calculateDistance(
            21.028511, 105.804817,  // Hanoi
            10.762622, 106.660172   // HCMC
        );
        assertTrue(distance > 1600000 && distance < 1700000,
            "Distance should be approximately 1600km, got: " + distance + "m");
    }

    @Test
    void testIsWithinValidRange_WithinRange() {
        // 500m apart - should be within 1km
        boolean isValid = GeoUtils.isWithinValidRange(
            10.762622, 106.660172,
            10.767000, 106.663000
        );
        assertTrue(isValid, "500m should be within valid range");
    }

    @Test
    void testIsWithinValidRange_OutOfRange() {
        // 2km apart - should be outside 1km range
        boolean isValid = GeoUtils.isWithinValidRange(
            10.762622, 106.660172,
            10.780000, 106.680000
        );
        assertFalse(isValid, "2km should be outside valid range");
    }

    @Test
    void testIsWithinValidRange_ExactlyOnBoundary() {
        // Create coordinates exactly 1000m apart
        // At equator: 1 degree latitude ≈ 111km
        // 1000m = 0.009 degrees
        double lat1 = 10.762622;
        double lon1 = 106.660172;
        double lat2 = lat1 + 0.009; // ~1000m north
        double lon2 = lon1;
        
        double distance = GeoUtils.calculateDistance(lat1, lon1, lat2, lon2);
        boolean isValid = GeoUtils.isWithinValidRange(lat1, lon1, lat2, lon2);
        
        assertTrue(distance <= 1000.0, "Distance should be <= 1000m");
        assertTrue(isValid, "Should be valid at 1000m boundary");
    }

    @Test
    void testFormatDistance_Meters() {
        String formatted = GeoUtils.formatDistance(250.5);
        assertEquals("251m", formatted);
    }

    @Test
    void testFormatDistance_Kilometers() {
        String formatted = GeoUtils.formatDistance(1500.0);
        assertEquals("1.50km", formatted);
    }

    @Test
    void testIsValidCoordinates_Valid() {
        assertTrue(GeoUtils.isValidCoordinates(10.762622, 106.660172));
        assertTrue(GeoUtils.isValidCoordinates(0.0, 0.0));
        assertTrue(GeoUtils.isValidCoordinates(-90.0, -180.0));
        assertTrue(GeoUtils.isValidCoordinates(90.0, 180.0));
    }

    @Test
    void testIsValidCoordinates_Invalid() {
        assertFalse(GeoUtils.isValidCoordinates(null, 106.660172));
        assertFalse(GeoUtils.isValidCoordinates(10.762622, null));
        assertFalse(GeoUtils.isValidCoordinates(91.0, 106.660172));
        assertFalse(GeoUtils.isValidCoordinates(10.762622, 181.0));
        assertFalse(GeoUtils.isValidCoordinates(-91.0, 106.660172));
        assertFalse(GeoUtils.isValidCoordinates(10.762622, -181.0));
    }

    @Test
    void testRealWorldExample_HCMC() {
        // Test with real coordinates in Ho Chi Minh City
        // Ben Thanh Market
        double marketLat = 10.772431;
        double marketLon = 106.698068;
        
        // Notre Dame Cathedral (0.5km away)
        double cathedralLat = 10.779738;
        double cathedralLon = 106.699092;
        
        double distance = GeoUtils.calculateDistance(
            marketLat, marketLon,
            cathedralLat, cathedralLon
        );
        
        assertTrue(distance > 800 && distance < 900,
            "Distance between Ben Thanh Market and Notre Dame should be ~850m, got: " + distance);
        assertTrue(GeoUtils.isWithinValidRange(marketLat, marketLon, cathedralLat, cathedralLon));
    }
}
