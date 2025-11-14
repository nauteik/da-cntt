import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';
import { useAuth } from '../../store/authStore';
import { CustomAlert, AlertButton } from '../../components/common/CustomAlert';
import { DailyNoteService, type DailyNoteRequest, type MealEntry } from '../../services/api/dailyNoteService';
import SignaturePad from '../../components/common/SignaturePad';
import { Image } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

interface CheckInData {
  timestamp: string;
  location: LocationData;
  type: 'check_in';
}

interface DailyNoteForm {
  employeeName: string;
  employeeId: string;
  patientName: string;
  patientId: string;
  careLocation: string;
  checkInTime: string;
  checkOutTime: string;
  careContent: string;
  breakfast: { time: string; whatHad: string; whatOffered: string };
  lunch: { time: string; whatHad: string; whatOffered: string };
  dinner: { time: string; whatHad: string; whatOffered: string };
  employeeSignature: string; // base64
  patientSignature: string; // base64
  checkInLocation?: LocationData;
  isCheckedIn: boolean;
}

export default function DailyNoteScreen() {
  const params = useLocalSearchParams();
  const serviceDeliveryId = params.serviceDeliveryId as string;
  const visitId = params.visitId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const checkInTime = params.checkInTime as string;
  
  // Get logged-in staff info
  const { state: authState } = useAuth();
  const currentUser = authState.user;
  
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
  
  // Signature pad states
  const [showStaffSignaturePad, setShowStaffSignaturePad] = useState(false);
  const [showPatientSignaturePad, setShowPatientSignaturePad] = useState(false);
  
  const [form, setForm] = useState<DailyNoteForm>({
    employeeName: '',
    employeeId: '',
    patientName: '',
    patientId: '',
    careLocation: '',
    checkInTime: '',
    checkOutTime: '',
    careContent: '',
    breakfast: { time: '', whatHad: '', whatOffered: '' },
    lunch: { time: '', whatHad: '', whatOffered: '' },
    dinner: { time: '', whatHad: '', whatOffered: '' },
    employeeSignature: '',
    patientSignature: '',
    checkInLocation: undefined,
    isCheckedIn: true,
  });

  // Initialize form with staff and patient info
  useEffect(() => {
    // Set employee info from logged-in user
    if (currentUser) {
      setForm(prev => ({
        ...prev,
        employeeName: currentUser.name || '',
        employeeId: currentUser.staffId || currentUser.id || '',
        employeeSignature: currentUser.name || '',
      }));
    }
    
    // Set patient info from navigation params
    if (patientId && patientName) {
      setForm(prev => ({
        ...prev,
        patientId: patientId,
        patientName: patientName,
        isCheckedIn: true,
        checkInTime: checkInTime ? new Date(checkInTime).toLocaleTimeString() : '',
      }));
    }
  }, [currentUser, patientId, patientName, checkInTime]);

  // Calculate if user should see checkout reminder (after 30 minutes)
  const shouldShowCheckoutReminder = () => {
    if (!form.isCheckedIn || !form.checkInTime) return false;
    
    // For demo purposes, always show reminder when checked in
    // In real app, you would calculate time difference
    return true;
  };

  const handleCheckIn = () => {
    // Navigate to check-in screen
    setAlertConfig({
      title: 'Check In Required',
      message: 'You need to check in at the care location before creating a daily note.',
      icon: 'location',
      iconColor: '#FF9800',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check In', 
          style: 'default',
          onPress: () => {
            router.push('/check-in');
          }
        }
      ]
    });
    setAlertVisible(true);
  };

  const handleCheckOut = () => {
    // Navigate to check-out screen
    setAlertConfig({
      title: 'Complete Check Out',
      message: 'Are you ready to check out and complete your care visit?',
      icon: 'log-out',
      iconColor: '#f44336',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Out',
          style: 'default',
          onPress: () => {
            router.push('/check-out');
          }
        }
      ]
    });
    setAlertVisible(true);
  };

  const updateMealEntry = (meal: 'breakfast' | 'lunch' | 'dinner', field: 'time' | 'whatHad' | 'whatOffered', value: string) => {
    setForm(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!form.careContent) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Please fill in the care content field.',
        icon: 'alert-circle',
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
      // Prepare meal info array (backend expects List<Object>)
      const mealInfo: MealEntry[] = [];
      if (form.breakfast.time || form.breakfast.whatHad || form.breakfast.whatOffered) {
        mealInfo.push({ ...form.breakfast, mealType: 'breakfast' });
      }
      if (form.lunch.time || form.lunch.whatHad || form.lunch.whatOffered) {
        mealInfo.push({ ...form.lunch, mealType: 'lunch' });
      }
      if (form.dinner.time || form.dinner.whatHad || form.dinner.whatOffered) {
        mealInfo.push({ ...form.dinner, mealType: 'dinner' });
      }

      // Call backend API matching DailyNoteRequestDTO
      const dailyNoteData: DailyNoteRequest = {
        serviceDeliveryId: serviceDeliveryId,
        content: form.careContent,
        mealInfo: mealInfo,
        patientSignature: form.patientSignature || undefined,
        staffSignature: form.employeeSignature || undefined,
        cancelled: false,
      };

      console.log('[DailyNoteScreen] Saving daily note:', dailyNoteData);
      
      // Call backend API
      const response = await DailyNoteService.createDailyNote(dailyNoteData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to save daily note');
      }
      
      // Update visit status if this is from unscheduled visit
      if (visitId) {
        try {
          const visitResponse = await UnscheduledVisitService.getById(visitId);
          const isCheckedOut = visitResponse.data?.checkedOut || false;
          
          const updates: any = {
            dailyNoteCompleted: true,
          };
          
          // Only mark as completed if checkout is also done
          if (isCheckedOut) {
            updates.status = 'completed';
          }
          
          await UnscheduledVisitService.update(visitId, updates);
        } catch (error) {
          console.error('[DailyNoteScreen] Error updating visit:', error);
        }
      }
      
      // Show success message and navigate back
      setAlertConfig({
        title: 'Daily Note Saved!',
        message: 'Your daily care note has been saved successfully. The visit has been marked as completed.',
        icon: 'checkmark-circle',
        iconColor: '#4CAF50',
        buttons: [
          { 
            text: 'Back to Schedule',
            style: 'default',
            onPress: () => {
              // Navigate back and trigger refresh
              router.back();
            },
          },
        ]
      });
      setAlertVisible(true);
    } catch (error: any) {
      console.error('[DailyNoteScreen] Error saving daily note:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save daily note.';
      setAlertConfig({
        title: 'Save Failed',
        message: errorMessage,
        icon: 'close-circle',
        iconColor: '#f44336',
        buttons: [{ text: 'OK', style: 'cancel' }]
      });
      setAlertVisible(true);
    }
  };

  const handleClear = () => {
    setAlertConfig({
      title: 'Clear Form',
      message: 'Are you sure you want to clear all data?',
      icon: 'trash',
      iconColor: '#f44336',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setForm({
              employeeName: currentUser?.name || '',
              employeeId: currentUser?.staffId || currentUser?.id || '',
              patientName: patientName || '',
              patientId: patientId || '',
              careLocation: '',
              checkInTime: checkInTime ? new Date(checkInTime).toLocaleTimeString() : '',
              checkOutTime: '',
              careContent: '',
              breakfast: { time: '', whatHad: '', whatOffered: '' },
              lunch: { time: '', whatHad: '', whatOffered: '' },
              dinner: { time: '', whatHad: '', whatOffered: '' },
              employeeSignature: currentUser?.name || '',
              patientSignature: '',
              checkInLocation: undefined,
              isCheckedIn: true,
            });
          },
        },
      ]
    });
    setAlertVisible(true);
  };

  const handleAutoFill = () => {
    const now = new Date();
    setForm({
      employeeName: currentUser?.name || 'John Smith',
      employeeId: currentUser?.staffId || currentUser?.id || 'EMP001',
      patientName: patientName || 'Jane Doe',
      patientId: patientId || 'PT001',
      careLocation: '123 Care Street, Medical City',
      checkInTime: checkInTime ? new Date(checkInTime).toLocaleTimeString() : '8:00 AM',
      checkOutTime: now.toLocaleTimeString(),
      careContent: 'Provided comprehensive care including:\n- Assisted with morning routine and personal hygiene\n- Administered prescribed medications on schedule\n- Accompanied patient to physical therapy session\n- Prepared and assisted with meals\n- Monitored vital signs (BP: 120/80, Temp: 98.6°F)\n- Engaged in conversation and recreational activities\n- Ensured safe environment and fall prevention',
      breakfast: {
        time: '8:30 AM',
        whatHad: 'Oatmeal with fresh berries, whole wheat toast with butter, orange juice. Patient consumed approximately 90% of meal.',
        whatOffered: 'Offered oatmeal, toast, eggs, fresh fruit, coffee, tea, and juice. Patient chose oatmeal and toast.',
      },
      lunch: {
        time: '12:30 PM',
        whatHad: 'Grilled chicken breast, steamed vegetables (broccoli, carrots), brown rice, water. Patient consumed full meal.',
        whatOffered: 'Offered chicken, fish, or vegetarian option with choice of vegetables, rice or potatoes, and beverages.',
      },
      dinner: {
        time: '6:00 PM',
        whatHad: 'Baked salmon, mixed green salad with vinaigrette, sweet potato, herbal tea. Patient consumed approximately 85% of meal.',
        whatOffered: 'Offered salmon, turkey, or pasta with salad, choice of sides, and various beverages.',
      },
      employeeSignature: currentUser?.name || 'John Smith',
      patientSignature: patientName || 'Jane Doe',
      checkInLocation: undefined,
      isCheckedIn: true,
    });
    
    setAlertConfig({
      title: 'Auto Fill Complete',
      message: 'Sample data has been filled in all fields. You can now review and modify as needed.',
      icon: 'sparkles',
      iconColor: '#2196F3',
      buttons: [{ text: 'OK', style: 'default' }]
    });
    setAlertVisible(true);
  };

  const renderMealSection = (title: string, meal: 'breakfast' | 'lunch' | 'dinner') => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.mealContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            value={form[meal].time}
            onChangeText={(text) => updateMealEntry(meal, 'time', text)}
            placeholder="e.g., 8:00 AM"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What did the individual have?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form[meal].whatHad}
            onChangeText={(text) => updateMealEntry(meal, 'whatHad', text)}
            placeholder="Describe what the patient consumed"
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What was offered?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form[meal].whatOffered}
            onChangeText={(text) => updateMealEntry(meal, 'whatOffered', text)}
            placeholder="Describe what was offered to the patient"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Daily Care Note</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.autoFillButton} onPress={handleAutoFill}>
          <Ionicons name="sparkles" size={20} color="white" />
          <Text style={styles.autoFillButtonText}>Auto Fill</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Employee Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Employee Name *</Text>
              <TextInput
                style={styles.input}
                value={form.employeeName}
                onChangeText={(text) => setForm(prev => ({ ...prev, employeeName: text }))}
                placeholder="Enter employee name"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Employee ID *</Text>
              <TextInput
                style={styles.input}
                value={form.employeeId}
                onChangeText={(text) => setForm(prev => ({ ...prev, employeeId: text }))}
                placeholder="Enter employee ID"
              />
            </View>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Patient Name *</Text>
              <TextInput
                style={styles.input}
                value={form.patientName}
                onChangeText={(text) => setForm(prev => ({ ...prev, patientName: text }))}
                placeholder="Enter patient name"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Patient ID *</Text>
              <TextInput
                style={styles.input}
                value={form.patientId}
                onChangeText={(text) => setForm(prev => ({ ...prev, patientId: text }))}
                placeholder="Enter patient ID"
              />
            </View>
          </View>
        </View>

        {/* Care Content */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Care Content</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Care Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.careContent}
              onChangeText={(text) => setForm(prev => ({ ...prev, careContent: text }))}
              placeholder="Describe the care activities performed (e.g., took patient to library, church, doctor visit, etc.)"
              multiline
              numberOfLines={5}
            />
          </View>
        </View>

        {/* Meal Information */}
        {renderMealSection('Breakfast', 'breakfast')}
        {renderMealSection('Lunch', 'lunch')}
        {renderMealSection('Dinner', 'dinner')}

        {/* Signatures */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          
          {/* Staff Signature */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employee Signature *</Text>
            {form.employeeSignature ? (
              <View style={styles.signaturePreview}>
                <Image
                  source={{ uri: form.employeeSignature }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.changeSignatureButton}
                  onPress={() => setShowStaffSignaturePad(true)}
                >
                  <Ionicons name="create" size={16} color="#2196F3" />
                  <Text style={styles.changeSignatureText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signatureButton}
                onPress={() => setShowStaffSignaturePad(true)}
              >
                <Ionicons name="create-outline" size={24} color="#2196F3" />
                <Text style={styles.signatureButtonText}>Tap to Sign</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Patient Signature */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient Signature *</Text>
            {form.patientSignature ? (
              <View style={styles.signaturePreview}>
                <Image
                  source={{ uri: form.patientSignature }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.changeSignatureButton}
                  onPress={() => setShowPatientSignaturePad(true)}
                >
                  <Ionicons name="create" size={16} color="#2196F3" />
                  <Text style={styles.changeSignatureText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signatureButton}
                onPress={() => setShowPatientSignaturePad(true)}
              >
                <Ionicons name="create-outline" size={24} color="#2196F3" />
                <Text style={styles.signatureButtonText}>Tap to Sign</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="refresh-outline" size={20} color="#666" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

      {/* Staff Signature Pad */}
      <SignaturePad
        visible={showStaffSignaturePad}
        onClose={() => setShowStaffSignaturePad(false)}
        onSave={(signature) => {
          setForm(prev => ({ ...prev, employeeSignature: signature }));
          setShowStaffSignaturePad(false);
        }}
        title="Staff Signature"
      />

      {/* Patient Signature Pad */}
      <SignaturePad
        visible={showPatientSignaturePad}
        onClose={() => setShowPatientSignaturePad(false)}
        onSave={(signature) => {
          setForm(prev => ({ ...prev, patientSignature: signature }));
          setShowPatientSignaturePad(false);
        }}
        title="Patient Signature"
      />
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  autoFillButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mealContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 0.45,
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 0.45,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // New styles for check-in/check-out functionality
  checkInRequired: {
    backgroundColor: '#fff3e0',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffb74d',
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
    marginTop: 8,
    marginBottom: 8,
  },
  checkInText: {
    fontSize: 14,
    color: '#e65100',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  checkOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  checkOutButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  // Reminder card styles
  reminderCard: {
    backgroundColor: '#fff3e0',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginLeft: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
    marginBottom: 12,
  },
  reminderButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  reminderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Signature styles
  signatureButton: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  signatureButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  signaturePreview: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    position: 'relative',
  },
  signatureImage: {
    width: '100%',
    height: 120,
    backgroundColor: 'white',
  },
  changeSignatureButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeSignatureText: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});