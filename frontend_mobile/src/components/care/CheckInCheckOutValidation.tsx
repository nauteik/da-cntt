import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckInCheckOutValidationProps {
  isValid?: boolean;
  distanceMeters?: number;
  distanceFormatted?: string;
  type: 'check-in' | 'check-out';
}

export default function CheckInCheckOutValidation({
  isValid,
  distanceMeters,
  distanceFormatted,
  type,
}: CheckInCheckOutValidationProps) {
  if (distanceMeters === undefined || distanceMeters === null) {
    return null;
  }

  const typeLabel = type === 'check-in' ? 'Check-In' : 'Check-Out';
  const validationThreshold = 1000; // 1km in meters

  return (
    <View style={[
      styles.container,
      isValid ? styles.validContainer : styles.invalidContainer
    ]}>
      <Ionicons 
        name={isValid ? 'checkmark-circle' : 'alert-circle'} 
        size={24} 
        color={isValid ? '#4CAF50' : '#FF9800'} 
      />
      <View style={styles.textContainer}>
        <Text style={[
          styles.title,
          isValid ? styles.validText : styles.warningText
        ]}>
          {typeLabel} Location {isValid ? 'Valid' : 'Warning'}
        </Text>
        <Text style={styles.description}>
          {isValid 
            ? `You are within ${distanceFormatted || `${Math.round(distanceMeters)}m`} of the patient's address.`
            : `You are ${distanceFormatted || `${Math.round(distanceMeters)}m`} away from the patient's address (>${validationThreshold}m). This may require supervisor approval.`
          }
        </Text>
        {!isValid && (
          <Text style={styles.note}>
            Note: Location validation helps ensure care is provided at the correct address.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
  },
  validContainer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  invalidContainer: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  validText: {
    color: '#2E7D32',
  },
  warningText: {
    color: '#E65100',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
