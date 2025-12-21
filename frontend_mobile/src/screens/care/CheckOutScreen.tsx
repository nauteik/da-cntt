import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';
import checkInCheckOutService, { CheckInCheckOutResponse } from '../../services/api/checkInCheckOutService';
import CheckInCheckOutValidation from '../../components/care/CheckInCheckOutValidation';
import { CustomAlert, AlertButton } from '../../components/common/CustomAlert';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export default function CheckOutScreen() {
  const params = useLocalSearchParams();
  const serviceDeliveryId = params.serviceDeliveryId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const checkInTime = params.checkInTime as string;
  const checkInLocationStr = params.checkInLocation as string;
  const visitId = params.visitId as string; // For unscheduled visits
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [checkOutResult, setCheckOutResult] = useState<CheckInCheckOutResponse | null>(null);
  const [distanceToPatient, setDistanceToPatient] = useState<number | null>(null);
  
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
  
  const checkInLocation = checkInLocationStr ? JSON.parse(checkInLocationStr) : null;
  const mockPatientId = patientId || 'PT001';
  const mockPatientName = patientName || 'John Doe';
  const mockCheckInTime = checkInTime || new Date().toISOString();

  useEffect(() => {
    getCurrentLocation();
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

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setAlertConfig({
          title: 'Permission Required',
          message: 'Location permission is required for check-out.',
          icon: 'location-outline',
          iconColor: '#FF9800',
          buttons: [{ text: 'OK', style: 'default' }]
        });
        setAlertVisible(true);
        return;
      }

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

      // Calculate distance to patient address
      // TODO: Fetch actual patient coordinates from backend
      const mockPatientLat = 37.422073;  
      const mockPatientLon = -122.083920;  
      
      if (mockPatientLat && mockPatientLon) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          mockPatientLat,
          mockPatientLon
        );
        setDistanceToPatient(distance);
        console.log('[CheckOutScreen] Distance to patient:', distance, 'meters');
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

  const calculateHours = () => {
    const checkIn = new Date(mockCheckInTime);
    const checkOut = new Date();
    const diffInMs = checkOut.getTime() - checkIn.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return Math.round(diffInHours * 10) / 10; // Round to 1 decimal place
  };

  const handleCheckOut = async () => {
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
        message: 'Service Delivery ID not found.',
        icon: 'alert-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'default' }]
      });
      setAlertVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const totalHours = calculateHours();
      
      // Call backend API for check-out
      const checkOutResponse = await checkInCheckOutService.checkOut({
        serviceDeliveryId: serviceDeliveryId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address,
        notes: additionalNotes.trim(),
      });

      console.log('[CheckOutScreen] Check-out response:', checkOutResponse);
      
      // Store check-out result for display
      setCheckOutResult(checkOutResponse);
      
      // TODO: GPS tracking temporarily disabled - uncomment when feature is working
      // Stop location tracking after successful check-out
      // try {
      //   await locationTrackingService.stopTracking();
      //   console.log('[CheckOutScreen] Location tracking stopped and final data uploaded');
      // } catch (trackingError) {
      //   console.error('[CheckOutScreen] Failed to stop location tracking:', trackingError);
      //   // Don't fail check-out if tracking stop fails, just log the error
      // }
      
      // Update visit status if this is an unscheduled visit
      if (visitId) {
        // Get current visit to check if daily note is completed
        const visitResponse = await UnscheduledVisitService.getById(visitId);
        const isDailyNoteCompleted = visitResponse.data?.dailyNoteCompleted || false;
        
        const updates: any = {
          checkedOut: true,
          checkOutTime: currentLocation.timestamp,
        };
        
        // Only mark as completed if daily note is also done
        if (isDailyNoteCompleted) {
          updates.status = 'completed';
        }
        
        await UnscheduledVisitService.update(visitId, updates);
      }
      
      // Show success message with validation info
      const validationMessage = checkOutResponse.checkOutValid 
        ? `Distance: ${checkOutResponse.checkOutDistanceFormatted || `${Math.round(checkOutResponse.checkOutDistanceMeters || 0)}m`}`
        : `⚠️ You are ${checkOutResponse.checkOutDistanceFormatted || `${Math.round(checkOutResponse.checkOutDistanceMeters || 0)}m`} from patient's address`;
      
      setAlertConfig({
        title: 'Check-Out Successful',
        message: `You have successfully checked out for ${mockPatientName}.\n\nLocation: ${currentLocation.address}\nTime: ${new Date(currentLocation.timestamp).toLocaleTimeString()}\n\n${validationMessage}`,
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
      console.error('[CheckOutScreen] Error during check-out:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to check out. Please try again.';
      setAlertConfig({
        title: 'Check-Out Failed',
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Out</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Check-in Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="time" size={24} color="#4caf50" />
            <Text style={styles.summaryTitle}>Care Visit Summary</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in Time:</Text>
            <Text style={styles.summaryValue}>
              {new Date(mockCheckInTime).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in Location:</Text>
            <Text style={styles.summaryValue}>{checkInLocation?.address || 'Location not available'}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Patient:</Text>
            <Text style={styles.summaryValue}>{mockPatientName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Hours:</Text>
            <Text style={[styles.summaryValue, styles.hoursText]}>
              {calculateHours()} hours
            </Text>
          </View>
        </View>

        {/* Current Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color="#f44336" />
            <Text style={styles.locationTitle}>Check-out Location</Text>
            <TouchableOpacity onPress={handleRefreshLocation} disabled={isLoading}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color={isLoading ? "#ccc" : "#f44336"} 
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingLocation}>
              <ActivityIndicator size="small" color="#f44336" />
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

        {/* Additional Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Any additional notes about the care visit..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Display distance preview BEFORE check-out */}
        {currentLocation && distanceToPatient !== null && !checkOutResult && (
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

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Your check-out location will be recorded to complete the care visit documentation.
          </Text>
        </View>

        {/* Display GPS validation results after check-out */}
        {checkOutResult && (
          <CheckInCheckOutValidation
            isValid={checkOutResult.checkOutValid || false}
            distanceMeters={checkOutResult.checkOutDistanceMeters}
            distanceFormatted={checkOutResult.checkOutDistanceFormatted}
            type="check-out"
          />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.checkOutButton, (!currentLocation || isLoading) && styles.disabledButton]} 
          onPress={handleCheckOut}
          disabled={!currentLocation || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={24} color="white" />
              <Text style={styles.checkOutButtonText}>Complete Check Out</Text>
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
    backgroundColor: '#f44336',
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  hoursText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
  },
  checkOutButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkOutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});