import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

interface CheckInScreenProps {
  patientId?: string;
  patientName?: string;
  scheduleId?: string;
}

export default function CheckInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission to check in.',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() : 
          'Address not available',
        timestamp: new Date().toISOString(),
      };

      setCurrentLocation(locationData);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Save check-in data to backend
      const checkInData = {
        timestamp: currentLocation.timestamp,
        location: currentLocation,
        type: 'check_in',
        // patientId, scheduleId would come from navigation params
      };

      console.log('Check-in data:', checkInData);
      
      // Navigate to DailyNote form with check-in data
      router.push({
        pathname: '/(tabs)/daily-note',
        params: {
          checkInData: JSON.stringify(checkInData),
        }
      });
      
    } catch (error) {
      console.error('Error during check-in:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
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

      <View style={styles.content}>
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

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#ff9800" />
          <Text style={styles.infoText}>
            Your location will be recorded when you check in. This helps ensure accurate care documentation and compliance with care protocols.
          </Text>
        </View>
      </View>

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
    padding: 20,
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