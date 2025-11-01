import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export default function CheckOutScreen() {
  const params = useLocalSearchParams();
  const scheduleId = params.scheduleId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const checkInTime = params.checkInTime as string;
  const checkInLocationStr = params.checkInLocation as string;
  const visitId = params.visitId as string; // For unscheduled visits
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const checkInLocation = checkInLocationStr ? JSON.parse(checkInLocationStr) : null;
  const mockPatientId = patientId || 'PT001';
  const mockPatientName = patientName || 'John Doe';
  const mockCheckInTime = checkInTime || new Date().toISOString();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required for check-out');
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
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
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
      Alert.alert(
        '📍 Location Required',
        'Location not available. Please enable GPS and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const totalHours = calculateHours();
      const checkOutData = {
        scheduleId: scheduleId,
        checkInTime: mockCheckInTime,
        checkOutTime: currentLocation.timestamp,
        checkInLocation: checkInLocation,
        checkOutLocation: currentLocation,
        totalHours,
        additionalNotes: additionalNotes.trim(),
        patientId: mockPatientId,
        patientName: mockPatientName,
        careCompleted: true,
      };

      console.log('Check-out data:', checkOutData);
      
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        '✅ Check-Out Successful',
        `You have successfully checked out.\n\nPatient: ${mockPatientName}\nTotal Hours: ${totalHours.toFixed(1)}h\nLocation: ${currentLocation.address}`,
        [
          {
            text: 'Back to List',
            onPress: () => router.back(),
          },
        ]
      );
      
    } catch (error) {
      console.error('Error during check-out:', error);
      Alert.alert(
        '❌ Check-Out Failed',
        'Failed to check out. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
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

      <View style={styles.content}>
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

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Your check-out location will be recorded to complete the care visit documentation.
          </Text>
        </View>
      </View>

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
    padding: 20,
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