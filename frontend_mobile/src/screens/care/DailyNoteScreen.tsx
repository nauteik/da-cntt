import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';

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

interface MealEntry {
  time: string;
  whatHad: string;
  whatOffered: string;
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
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  employeeSignature: string;
  patientSignature: string;
  checkInLocation?: LocationData;
  isCheckedIn: boolean;
}

export default function DailyNoteScreen() {
  const params = useLocalSearchParams();
  const visitId = params.visitId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const checkInTime = params.checkInTime as string;
  
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
    isCheckedIn: true, // Force false để test UI check-in
  });

  // Check if user has checked in (would normally come from navigation params or global state)
  useEffect(() => {
    // Get data from navigation params
    if (patientId && patientName) {
      setForm(prev => ({
        ...prev,
        patientId: patientId,
        patientName: patientName,
        isCheckedIn: true,
        checkInTime: checkInTime ? new Date(checkInTime).toLocaleTimeString() : '',
      }));
    }
  }, [patientId, patientName, checkInTime]);

  // Calculate if user should see checkout reminder (after 30 minutes)
  const shouldShowCheckoutReminder = () => {
    if (!form.isCheckedIn || !form.checkInTime) return false;
    
    // For demo purposes, always show reminder when checked in
    // In real app, you would calculate time difference
    return true;
  };

  const handleCheckIn = () => {
    // Navigate to check-in screen
    Alert.alert(
      'Check In Required',
      'You need to check in at the care location before creating a daily note.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Inn', 
          onPress: () => {
            // Navigate to CheckInScreen
            router.push('/check-in');
          }
        }
      ]
    );
  };

  const handleCheckOut = () => {
    // Navigate to check-out screen
    Alert.alert(
      'Complete Check Out',
      'Are you ready to check out and complete your care visit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Out', 
          onPress: () => {
            // Navigate to CheckOutScreen
            router.push('/check-out');
          }
        }
      ]
    );
  };

  const updateMealEntry = (meal: 'breakfast' | 'lunch' | 'dinner', field: keyof MealEntry, value: string) => {
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
    if (!form.employeeName || !form.patientName || !form.careContent) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // Update visit status if this is from unscheduled visit
    if (visitId) {
      try {
        // Get current visit to check if checkout is done
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
        console.error('Error updating visit:', error);
      }
    }
    
    // Show success message
    Alert.alert(
      '✅ Daily Note Saved!',
      'Your daily care note has been saved successfully.',
      [
        { 
          text: 'Back to List', 
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setForm({
              employeeName: '',
              employeeId: '',
              patientName: patientName || '',
              patientId: patientId || '',
              careLocation: '',
              checkInTime: checkInTime ? new Date(checkInTime).toLocaleTimeString() : '',
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
          },
        },
      ]
    );
  };

  const handleAutoFill = () => {
    const now = new Date();
    setForm({
      employeeName: 'John Smith',
      employeeId: 'EMP001',
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
      employeeSignature: 'John Smith',
      patientSignature: patientName || 'Jane Doe',
      checkInLocation: undefined,
      isCheckedIn: true,
    });
    
    Alert.alert(
      '✨ Auto Fill Complete',
      'Sample data has been filled in all fields. You can now review and modify as needed.',
      [{ text: 'OK' }]
    );
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* Care Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Care Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Care Location</Text>
            <TextInput
              style={styles.input}
              value={form.careLocation}
              onChangeText={(text) => setForm(prev => ({ ...prev, careLocation: text }))}
              placeholder="Enter care location"
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Check-in Time</Text>
              <TextInput
                style={styles.input}
                value={form.checkInTime}
                onChangeText={(text) => setForm(prev => ({ ...prev, checkInTime: text }))}
                placeholder="e.g., 9:00 AM"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Check-out Time</Text>
              <TextInput
                style={styles.input}
                value={form.checkOutTime}
                onChangeText={(text) => setForm(prev => ({ ...prev, checkOutTime: text }))}
                placeholder="e.g., 5:00 PM"
              />
            </View>
          </View>
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employee Signature</Text>
            <TextInput
              style={styles.input}
              value={form.employeeSignature}
              onChangeText={(text) => setForm(prev => ({ ...prev, employeeSignature: text }))}
              placeholder="Employee digital signature"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient Signature</Text>
            <TextInput
              style={styles.input}
              value={form.patientSignature}
              onChangeText={(text) => setForm(prev => ({ ...prev, patientSignature: text }))}
              placeholder="Patient digital signature"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="refresh-outline" size={20} color="#666" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Note</Text>
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
    padding: 16,
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
});