import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';
import checkInCheckOutService, { CheckInCheckOutResponse } from '../../services/api/checkInCheckOutService';
import CheckInCheckOutValidation from '../../components/care/CheckInCheckOutValidation';
import { CustomAlert, AlertButton } from '../../components/common/CustomAlert';
// TODO: GPS tracking temporarily disabled - uncomment when feature is working
// import locationTrackingService from '../../services/api/locationTrackingService';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export default function CheckInScreen() {
  const params = useLocalSearchParams();
  const scheduleEventId = params.scheduleEventId as string;
  const serviceDeliveryId = params.serviceDeliveryId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const visitId = params.visitId as string; // For unscheduled visits
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInCheckOutResponse | null>(null);
  const [distanceToPatient, setDistanceToPatient] = useState<number | null>(null);
  const [patientAddress, setPatientAddress] = useState<string | null>(null);
  
  // Custom Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    buttons?: AlertButton[];
  }>({
    title: '',
    message: '',
  });

  // Mock patient data if not provided
  const mockPatientId = patientId || 'PT001';
  const mockPatientName = patientName || 'John Doe';

  useEffect(() => {
    console.log('[CheckInScreen] Component mounted with params:', {
      scheduleEventId,
      serviceDeliveryId,
      patientId,
      patientName,
      visitId,
    });
    
    requestLocationPermission();
    // Load patient address from params or fetch from API
    if (patientName) {
      // In real app, fetch patient address from API using patientId
      // For now, use mock data
      setPatientAddress('Patient Address (from schedule)');
    }
  }, []);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        setAlertConfig({
          title: 'Location Permission Required',
          message: 'Please enable location permission to check in.',
          icon: 'location-outline',
          iconColor: '#FF9800',
          buttons: [
            { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
            { text: 'Settings', style: 'default', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        });
        setAlertVisible(true);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to request location permission',
        icon: 'alert-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      setAlertVisible(true);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('[CheckInScreen] GPS Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        timestamp: new Date(location.timestamp).toLocaleString(),
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('[CheckInScreen] Reverse geocoding result:', {
        street: address[0]?.street,
        city: address[0]?.city,
        region: address[0]?.region,
        postalCode: address[0]?.postalCode,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() : 
          'Address not available',
        timestamp: new Date().toISOString(),
      };

      console.log('[CheckInScreen] Location data prepared:', locationData);

      setCurrentLocation(locationData);

      // Calculate distance to patient address if available
      // TODO: In production, fetch actual patient GPS coordinates from backend
      // For now, using mock coordinates - you should fetch from serviceDeliveryId
      // Example: GET /api/service-delivery/{id} to get patient address coordinates
      const mockPatientLat = 37.422222;  // New York coordinates
      const mockPatientLon = -122.084001;  // New York coordinates
      
      if (mockPatientLat && mockPatientLon) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          mockPatientLat,
          mockPatientLon
        );
        setDistanceToPatient(distance);
        console.log('[CheckInScreen] Distance calculation:', {
          staffLat: location.coords.latitude,
          staffLon: location.coords.longitude,
          patientLat: mockPatientLat,
          patientLon: mockPatientLon,
          distanceMeters: distance,
          distanceKm: (distance / 1000).toFixed(2),
          isWithinRange: distance <= 1000,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to get current location. Please try again.',
        icon: 'alert-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      setAlertConfig({
        title: 'Location Required',
        message: 'Location not available. Please enable GPS and try again.',
        icon: 'location',
        iconColor: '#FF9800',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      setAlertVisible(true);
      return;
    }

    if (!serviceDeliveryId) {
      setAlertConfig({
        title: 'Error',
        message: 'Service Delivery ID not found. Please start shift first.',
        icon: 'alert-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      setAlertVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('[CheckInScreen] Submitting check-in with data:', {
        serviceDeliveryId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address,
        timestamp: currentLocation.timestamp,
      });
      
      // Call backend API for check-in
      const checkInResponse = await checkInCheckOutService.checkIn({
        serviceDeliveryId: serviceDeliveryId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address,
      });

      console.log('[CheckInScreen] Check-in response:', checkInResponse);
      
      // Store check-in result for display
      setCheckInResult(checkInResponse);
      
      // TODO: GPS tracking temporarily disabled - uncomment when feature is working
      // Start location tracking after successful check-in
      // try {
      //   await locationTrackingService.startTracking(serviceDeliveryId);
      //   console.log('[CheckInScreen] Location tracking started for service delivery:', serviceDeliveryId);
      // } catch (trackingError) {
      //   console.error('[CheckInScreen] Failed to start location tracking:', trackingError);
      //   // Don't fail check-in if tracking fails, just log the error
      // }
      
      // Update visit status if this is an unscheduled visit
      if (visitId) {
        await UnscheduledVisitService.update(visitId, {
          checkedIn: true,
          checkInTime: currentLocation.timestamp,
        });
      }
      
      // Show success message with validation info
      const validationMessage = checkInResponse.checkInValid 
        ? `Distance: ${checkInResponse.checkInDistanceFormatted || `${Math.round(checkInResponse.checkInDistanceMeters || 0)}m`}`
        : `⚠️ You are ${checkInResponse.checkInDistanceFormatted || `${Math.round(checkInResponse.checkInDistanceMeters || 0)}m`} from patient's address`;
      
      setAlertConfig({
        title: 'Check-In Successful',
        message: `You have successfully checked in for ${mockPatientName}.\n\nLocation: ${currentLocation.address}\nTime: ${new Date(currentLocation.timestamp).toLocaleTimeString()}\n\n${validationMessage}`,
        icon: 'checkmark-circle',
        iconColor: '#4CAF50',
        buttons: [
          {
            text: 'Back to Schedule',
            style: 'default',
            onPress: () => router.back(),
          },
        ]
      });
      setAlertVisible(true);
      
    } catch (error: any) {
      console.error('[CheckInScreen] Error during check-in:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to check in. Please try again.';
      setAlertConfig({
        title: 'Check-In Failed',
        message: errorMessage,
        icon: 'close-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'cancel' }]
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  if (locationPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Requesting location permission...</Text>
      </View>
    );
  }

  if (locationPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Location Permission Required</Text>
          <Text style={styles.errorText}>
            Please enable location permission to check in for your care visit.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check In</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Patient Info Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Ionicons name="person-circle" size={48} color="#2196F3" />
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{mockPatientName}</Text>
              <Text style={styles.patientId}>ID: {mockPatientId}</Text>
              {scheduleEventId && <Text style={styles.scheduleId}>Schedule: {scheduleEventId}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Text style={styles.locationTitle}>Current Location</Text>
            <TouchableOpacity onPress={handleRefreshLocation} disabled={isLoading}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color={isLoading ? "#ccc" : "#2196F3"} 
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingLocation}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingLocationText}>Getting location...</Text>
            </View>
          ) : currentLocation ? (
            <View style={styles.locationInfo}>
              <Text style={styles.addressText}>{currentLocation.address}</Text>
              <Text style={styles.coordsText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.timestampText}>
                {new Date(currentLocation.timestamp).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.noLocationText}>Location not available</Text>
          )}
        </View>

        {/* Display distance preview BEFORE check-in */}
        {currentLocation && distanceToPatient !== null && !checkInResult && (
          <View style={[
            styles.distancePreviewCard,
            distanceToPatient <= 1000 ? styles.distanceGood : styles.distanceFar
          ]}>
            <Ionicons 
              name={distanceToPatient <= 1000 ? "checkmark-circle" : "warning"} 
              size={32} 
              color={distanceToPatient <= 1000 ? "#4CAF50" : "#FF9800"} 
            />
            <View style={styles.distancePreviewContent}>
              <Text style={styles.distancePreviewTitle}>
                Distance to Patient Address
              </Text>
              <Text style={styles.distancePreviewValue}>
                {distanceToPatient < 1000 
                  ? `${distanceToPatient.toFixed(0)} meters`
                  : `${(distanceToPatient / 1000).toFixed(2)} km`
                }
              </Text>
              {distanceToPatient > 1000 && (
                <Text style={styles.distanceWarning}>
                  ⚠️ You are more than 1km away from patient's address. Please move closer or confirm if this is correct.
                </Text>
              )}
              {distanceToPatient <= 1000 && (
                <Text style={styles.distanceGoodText}>
                  ✓ You are within acceptable range (≤1km)
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#ff9800" />
          <Text style={styles.infoText}>
            Your location will be recorded when you check in. This helps ensure accurate care documentation and compliance with care protocols.
          </Text>
        </View>

        {/* Display GPS validation results after check-in */}
        {checkInResult && (
          <CheckInCheckOutValidation
            isValid={checkInResult.checkInValid || false}
            distanceMeters={checkInResult.checkInDistanceMeters}
            distanceFormatted={checkInResult.checkInDistanceFormatted}
            type="check-in"
          />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.checkInButton, (!currentLocation || isLoading) && styles.disabledButton]} 
          onPress={handleCheckIn}
          disabled={!currentLocation || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.checkInButtonText}>Check In</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientInfo: {
    marginLeft: 16,
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  scheduleId: {
    fontSize: 12,
    color: '#999',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  loadingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingLocationText: {
    marginLeft: 8,
    color: '#666',
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
  },
  noLocationText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  distancePreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceGood: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  distanceFar: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  distancePreviewContent: {
    flex: 1,
    marginLeft: 16,
  },
  distancePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  distancePreviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  distanceWarning: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    marginTop: 4,
  },
  distanceGoodText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
  },
  checkInButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});