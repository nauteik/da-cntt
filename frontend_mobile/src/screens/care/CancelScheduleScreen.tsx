import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useCustomAlert } from '@/src/components/common/CustomAlert';
import { apiClient } from '@/src/services/api/apiClient';

export default function CancelScheduleScreen() {
  const params = useLocalSearchParams<{
    serviceDeliveryId?: string;
    patientName?: string;
    scheduledTime?: string;
  }>();

  const { showAlert, AlertComponent } = useCustomAlert();
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick reason templates
  const reasonTemplates = [
    'Patient is sick/unwell',
    'Patient not available',
    'Family request',
    'Emergency situation',
    'Weather conditions',
    'Transportation issues',
    'Staff unavailable',
  ];

  const handleQuickReason = (template: string) => {
    setCancelReason(template);
  };

  const handleSubmitCancel = async () => {
    if (!cancelReason.trim()) {
      showAlert('Error', 'Please provide a reason for cancellation');
      return;
    }

    if (cancelReason.trim().length < 10) {
      showAlert('Error', 'Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call backend API to cancel service delivery
      if (params.serviceDeliveryId) {
        const response = await apiClient.patch(
          `/service-delivery/${params.serviceDeliveryId}/cancel?reason=${encodeURIComponent(cancelReason.trim())}`
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to cancel service delivery');
        }

        showAlert(
          'Service Delivery Cancelled',
          'The service delivery has been successfully cancelled.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ],
          'checkmark-circle',
          '#4CAF50'
        );
      } else {
        showAlert('Error', 'Service delivery ID is missing');
      }
      
    } catch (error: any) {
      console.error('Error cancelling service delivery:', error);
      const errorMessage = error.message || 'Failed to cancel service delivery. Please try again.';
      showAlert('Error', errorMessage, undefined, 'alert-circle', '#f44336');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (cancelReason.trim()) {
      showAlert(
        'Discard Changes',
        'Are you sure you want to go back? Your changes will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ],
        'warning',
        '#ff9800'
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
        <Text style={styles.headerTitle}>Cancel Service Delivery</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Delivery Info */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="calendar-outline" size={24} color="#f44336" />
            <Text style={styles.scheduleTitle}>Service Delivery to Cancel</Text>
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.patientName}>
              Patient: {params.patientName || 'N/A'}
            </Text>
            <Text style={styles.scheduleTime}>
              Time: {params.scheduledTime || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#ff9800" />
          <Text style={styles.warningText}>
            Cancelling this service delivery will update the status to "cancelled" and prevent check-in/check-out. 
            Please provide a detailed reason for documentation and billing purposes.
          </Text>
        </View>

        {/* Quick Reason Templates */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Reason Templates</Text>
          <View style={styles.templateContainer}>
            {reasonTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateButton}
                onPress={() => handleQuickReason(template)}
              >
                <Text style={styles.templateText}>{template}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cancellation Reason *</Text>
          <TextInput
            style={styles.reasonInput}
            value={cancelReason}
            onChangeText={setCancelReason}
            placeholder="Enter the reason for cancellation (minimum 10 characters)..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          <Text style={styles.characterCount}>
            {cancelReason.length} characters (minimum 10)
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.discardButton} 
            onPress={handleGoBack}
            disabled={isSubmitting}
          >
            <Ionicons name="close-circle-outline" size={20} color="#666" />
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.cancelScheduleButton, 
              (!cancelReason.trim() || cancelReason.trim().length < 10 || isSubmitting) && styles.disabledButton
            ]} 
            onPress={handleSubmitCancel}
            disabled={!cancelReason.trim() || cancelReason.trim().length < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="close-circle" size={20} color="white" />
            )}
            <Text style={styles.cancelScheduleButtonText}>
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Component */}
      <AlertComponent />
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
  templateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  templateText: {
    fontSize: 13,
    color: '#555',
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
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelScheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});