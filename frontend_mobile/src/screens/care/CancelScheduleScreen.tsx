import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CancelScheduleProps {
  scheduleId?: string;
  patientName?: string;
  scheduledTime?: string;
}

export default function CancelScheduleScreen() {
  const [cancelReason, setCancelReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelCategories = [
    { id: 'patient_sick', label: 'Patient is sick/unwell', icon: 'medical' },
    { id: 'patient_unavailable', label: 'Patient not available', icon: 'person-remove' },
    { id: 'family_request', label: 'Family request', icon: 'people' },
    { id: 'emergency', label: 'Emergency situation', icon: 'alert-circle' },
    { id: 'weather', label: 'Weather conditions', icon: 'rainy' },
    { id: 'transport', label: 'Transportation issues', icon: 'car' },
    { id: 'staff_unavailable', label: 'Staff unavailable', icon: 'person-outline' },
    { id: 'other', label: 'Other reason', icon: 'ellipsis-horizontal' },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSubmitCancel = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a cancellation category');
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a detailed reason for cancellation');
      return;
    }

    if (cancelReason.trim().length < 10) {
      Alert.alert('Error', 'Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const cancelData = {
        scheduleId: 'schedule-123', // Would come from navigation params
        category: selectedCategory,
        reason: cancelReason.trim(),
        timestamp: new Date().toISOString(),
        cancelledBy: 'current-user-id', // Would come from auth context
      };

      // TODO: Submit cancellation to backend
      console.log('Cancellation data:', cancelData);
      
      Alert.alert(
        'Schedule Cancelled',
        'The schedule has been successfully cancelled.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      Alert.alert('Error', 'Failed to cancel schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (selectedCategory || cancelReason.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to go back? Your changes will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Schedule</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Schedule Info */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="calendar" size={24} color="#f44336" />
            <Text style={styles.scheduleTitle}>Schedule to Cancel</Text>
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.patientName}>Patient: John Doe</Text>
            <Text style={styles.scheduleTime}>Time: Today, 2:00 PM - 6:00 PM</Text>
            <Text style={styles.scheduleLocation}>Location: 123 Main St, City</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#ff9800" />
          <Text style={styles.warningText}>
            Cancelling this schedule will notify the patient and update the care records. 
            Please provide a detailed reason for documentation.
          </Text>
        </View>

        {/* Cancellation Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cancellation Category *</Text>
          <View style={styles.categoriesGrid}>
            {cancelCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.id ? '#2196F3' : '#666'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Reason */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Detailed Reason *</Text>
          <TextInput
            style={styles.reasonInput}
            value={cancelReason}
            onChangeText={setCancelReason}
            placeholder="Please provide a detailed explanation for the cancellation..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {cancelReason.length}/500 characters
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.discardButton} onPress={handleGoBack}>
            <Ionicons name="close-circle-outline" size={20} color="#666" />
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cancelScheduleButton, 
              (!selectedCategory || !cancelReason.trim() || isSubmitting) && styles.disabledButton
            ]} 
            onPress={handleSubmitCancel}
            disabled={!selectedCategory || !cancelReason.trim() || isSubmitting}
          >
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.cancelScheduleButtonText}>
              {isSubmitting ? 'Cancelling...' : 'Cancel Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 16,
  },
  scheduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  scheduleInfo: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  scheduleLocation: {
    fontSize: 14,
    color: '#666',
  },
  warningCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#e65100',
    lineHeight: 18,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  selectedCategoryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.45,
    justifyContent: 'center',
  },
  discardButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.45,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelScheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});