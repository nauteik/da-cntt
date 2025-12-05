import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import PatientService, { PatientSummary } from '../../services/api/patientService';
import ScheduleService from '../../services/api/scheduleService';
import { Schedule } from '../../types';

interface PatientSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSchedule: (schedule: Schedule, reason: string) => void;
}

type Step = 'search' | 'selectPatient' | 'selectSchedule' | 'enterReason';

/**
 * Modal for creating an unscheduled visit - Option C approach
 * Step 1: Search for patient by name
 * Step 2: Select patient from search results
 * Step 3: View and select from PATIENT's schedules (not other staff's schedules)
 * Step 4: Enter reason for unscheduled visit
 * 
 * This preserves privacy by only showing the selected patient's schedules,
 * not revealing what other staff members are doing
 */
export default function PatientSearchModal({
  visible,
  onClose,
  onSelectSchedule,
}: PatientSearchModalProps) {
  // Step control
  const [step, setStep] = useState<Step>('search');
  
  // Step 1: Search
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  
  // Step 2 & 3: Selected data
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // Step 4: Reason
  const [reason, setReason] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Search patients
  const handleSearchPatients = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter patient name to search');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const results = await PatientService.searchPatients({
        search: searchQuery,
        page: 0,
        size: 20,
      });
      
      setPatients(results);
      
      if (results.length === 0) {
        setError('No patients found matching your search');
      } else {
        setStep('selectPatient');
      }
    } catch (err) {
      setError('Failed to search patients. Please try again.');
      console.error('Patient search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select patient and load their schedules
  const handleSelectPatient = async (patient: PatientSummary) => {
    setSelectedPatient(patient);
    setLoading(true);
    setError('');
    
    try {
      // Get schedules for today and next 7 days
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const fromDate = today.toISOString().split('T')[0];
      const toDate = nextWeek.toISOString().split('T')[0];
      
      const patientSchedules = await ScheduleService.getPatientScheduleEvents(
        patient.id,
        fromDate,
        toDate
      );
      
      // Filter and sort schedules
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter: Only show schedules from today onwards (no past dates)
      const upcomingSchedules = patientSchedules.filter(schedule => {
        return schedule.date >= todayStr;
      });
      
      // Sort: Today's schedules first, then by date ascending
      const sortedSchedules = upcomingSchedules.sort((a, b) => {
        const isAToday = a.date === todayStr;
        const isBToday = b.date === todayStr;
        
        // Today's schedules first
        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;
        
        // Then sort by date and time
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        
        // Same date, sort by start time
        return a.startTime.localeCompare(b.startTime);
      });
      
      setSchedules(sortedSchedules);
      
      if (sortedSchedules.length === 0) {
        setError('No upcoming schedules found for this patient');
      } else {
        setStep('selectSchedule');
      }
    } catch (err) {
      setError('Failed to load patient schedules. Please try again.');
      console.error('Schedule load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Select schedule
  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setStep('enterReason');
  };

  // Step 4: Confirm with reason
  const handleConfirm = () => {
    if (!selectedSchedule || !reason.trim()) {
      return;
    }

    onSelectSchedule(selectedSchedule, reason.trim());
    handleReset();
    onClose();
  };

  // Navigation
  const handleBack = () => {
    if (step === 'selectPatient') {
      setStep('search');
      setPatients([]);
      setError('');
    } else if (step === 'selectSchedule') {
      setStep('selectPatient');
      setSchedules([]);
      setSelectedPatient(null);
      setError('');
    } else if (step === 'enterReason') {
      setStep('selectSchedule');
      setSelectedSchedule(null);
      setReason('');
    }
  };

  const handleReset = () => {
    setStep('search');
    setSearchQuery('');
    setPatients([]);
    setSelectedPatient(null);
    setSchedules([]);
    setSelectedSchedule(null);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const getTitle = () => {
    switch (step) {
      case 'search': return 'Search Patient';
      case 'selectPatient': return 'Select Patient';
      case 'selectSchedule': return 'Select Schedule';
      case 'enterReason': return 'Confirm Unscheduled Visit';
      default: return 'Create Unscheduled Visit';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'search': return 'Enter patient name to search';
      case 'selectPatient': return `Found ${patients.length} patient(s)`;
      case 'selectSchedule': return `${selectedPatient?.firstName} ${selectedPatient?.lastName}'s schedules`;
      case 'enterReason': return 'Enter reason for this unscheduled visit';
      default: return '';
    }
  };



  // Render patient item for selection
  const renderPatientItem = ({ item }: { item: PatientSummary }) => {
    // Format date of birth
    const dobDisplay = item.dateOfBirth 
      ? new Date(item.dateOfBirth).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'N/A';
    
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleSelectPatient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemLeft}>
          <Ionicons name="person-circle-outline" size={40} color="#2196F3" />
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemTitle}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.listItemSubtitle}>
              Client ID: {item.clientId}
            </Text>
            {item.medicaidId && (
              <Text style={styles.listItemSubtitle}>
                Medicaid: {item.medicaidId}
              </Text>
            )}
            <Text style={styles.listItemSubtitle}>
              DOB: {dobDisplay}
            </Text>
            {item.status && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  // Helper function to format time from ISO string or HH:MM format
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return 'N/A';
    
    // Check if it's already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    
    // If it's ISO format (2025-12-05T02:00:00Z), extract time using UTC
    try {
      const date = new Date(timeStr);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Helper function to format date as MM/DD/YY
  const formatDateShort = (dateStr: string): string => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${month}/${day}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Render schedule item for selection
  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = item.date === today;
    
    // Format time properly
    const startTime = formatTime(item.startTime);
    const endTime = formatTime(item.endTime);
    const dateShort = formatDateShort(item.date);
    
    // Format date for better display
    const scheduleDate = new Date(item.date + 'T00:00:00');
    const dateDisplay = scheduleDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Calculate days from today
    const todayDate = new Date(today + 'T00:00:00');
    const diffTime = scheduleDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dateLabel = dateDisplay;
    if (isToday) {
      dateLabel = `Today, ${dateDisplay}`;
    } else if (diffDays === 1) {
      dateLabel = `Tomorrow, ${dateDisplay}`;
    } else if (diffDays > 1 && diffDays <= 7) {
      dateLabel = `In ${diffDays} days, ${dateDisplay}`;
    }
    
    return (
      <TouchableOpacity
        style={[styles.listItem, isToday && styles.listItemToday]}
        onPress={() => handleSelectSchedule(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemLeft}>
          <Ionicons 
            name={isToday ? "calendar" : "calendar-outline"} 
            size={32} 
            color={isToday ? "#FF9800" : "#4CAF50"} 
          />
          <View style={styles.listItemInfo}>
            <View style={styles.scheduleHeader}>
              <Text style={[styles.listItemTitle, isToday && styles.todayTitle]}>
                {startTime} - {endTime}
              </Text>
              {isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>TODAY</Text>
                </View>
              )}
            </View>
            <Text style={[styles.listItemSubtitle, isToday && styles.todaySubtitle]}>
              📅 {dateLabel} ({dateShort})
            </Text>
            <Text style={styles.listItemSubtitle}>
              💼 {item.serviceType}
            </Text>
            <Text style={styles.listItemSubtitle}>
              👤 Originally assigned: {item.employeeName || 'Unknown'}
            </Text>
            <Text style={styles.listItemSubtitle}>
              📊 Status: {item.status}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContentWrapper}
        >
          <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              {step !== 'search' && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color="#2196F3" />
                </TouchableOpacity>
              )}
              <View>
                <Text style={styles.modalTitle}>{getTitle()}</Text>
                <Text style={styles.modalSubtitle}>{getSubtitle()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Step 1: Search */}
            {step === 'search' && (
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Enter patient name..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoFocus={true}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchPatients}
                  />
                </View>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
                  onPress={handleSearchPatients}
                  disabled={loading || !searchQuery.trim()}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="white" />
                      <Text style={styles.searchButtonText}>Search Patients</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Select Patient */}
            {step === 'selectPatient' && (
              <FlatList
                data={patients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No patients found</Text>
                  </View>
                }
              />
            )}

            {/* Step 3: Select Schedule */}
            {step === 'selectSchedule' && (
              <>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading schedules...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={48} color="#ccc" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <>
                    {schedules.length > 0 && (
                      <View style={styles.scheduleHint}>
                        <Ionicons name="information-circle-outline" size={16} color="#2196F3" />
                        <Text style={styles.scheduleHintText}>
                          Today's schedules are shown first for quick access
                        </Text>
                      </View>
                    )}
                    <FlatList
                      data={schedules}
                      renderItem={renderScheduleItem}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.listContent}
                      ListEmptyComponent={
                        <View style={styles.emptyState}>
                          <Ionicons name="calendar-outline" size={48} color="#ccc" />
                          <Text style={styles.emptyText}>No schedules found</Text>
                        </View>
                      }
                    />
                  </>
                )}
              </>
            )}

            {/* Step 4: Enter Reason */}
            {step === 'enterReason' && selectedSchedule && (
              <ScrollView style={styles.reasonContainer} showsVerticalScrollIndicator={false}>
                {/* Selected Schedule Summary */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Selected Schedule:</Text>
                  <View style={styles.summaryRow}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.summaryText}>
                      {selectedPatient?.firstName} {selectedPatient?.lastName}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.summaryText}>
                      {formatDateShort(selectedSchedule.date)} • {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="briefcase" size={16} color="#666" />
                    <Text style={styles.summaryText}>{selectedSchedule.serviceType}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.summaryText}>
                      Originally assigned to: {selectedSchedule.employeeName || 'Unknown'}
                    </Text>
                  </View>
                </View>

                {/* Reason Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Reason for Unscheduled Visit <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.reasonInput]}
                    placeholder="e.g., Original staff unavailable, Emergency replacement needed, Patient requested different staff"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                    autoFocus={true}
                  />
                  <Text style={styles.charCount}>{reason.length}/500</Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#2196F3" />
                  <Text style={styles.infoText}>
                    You will replace the original staff for this schedule. This visit will be marked as unscheduled.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>

          {/* Action Buttons - Only show on final step */}
          {step === 'enterReason' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !reason.trim() && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!reason.trim()}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Confirm & Create</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  // Search Step
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 12,
    textAlign: 'center',
  },
  // List Items
  listContent: {
    padding: 20,
  },
  scheduleHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  scheduleHintText: {
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 6,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listItemToday: {
    borderColor: '#FF9800',
    borderWidth: 2,
    backgroundColor: '#FFF8E1',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  todayTitle: {
    color: '#E65100',
    fontWeight: '700',
  },
  todaySubtitle: {
    color: '#F57C00',
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
  },
  // Reason Step
  reasonContainer: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
