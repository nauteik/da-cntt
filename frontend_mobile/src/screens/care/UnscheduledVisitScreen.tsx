import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../store/authStore';
import UnscheduledVisitService from '../../services/api/unscheduledVisitService';
import { UnscheduledVisit } from '../../types';

/**
 * Unscheduled Visit Screen
 * Shows list of user's unscheduled visits and allows creating new ones
 * Works like regular schedule - can check-in/out and create daily notes
 */
export default function UnscheduledVisitScreen() {
  const { state } = useAuth();
  const [visits, setVisits] = useState<UnscheduledVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [location, setLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get week dates (7 days starting from selected date's week start)
  const getWeekDates = () => {
    const current = new Date(selectedDate);
    const currentDay = current.getDay();
    const diff = currentDay; // Days since Sunday
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  // Format helpers
  const formatDateShort = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatDateNum = (date: Date) => {
    return date.getDate().toString();
  };

  // Date comparison helpers
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  useEffect(() => {
    loadVisits();
  }, []);

  // Reload visits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [])
  );

  const loadVisits = async () => {
    setIsLoading(true);
    try {
      const response = await UnscheduledVisitService.list({
        createdBy: state.user?.id,
        // Show both active and completed visits (hide only cancelled)
      });

      if (response.success && response.data) {
        // Filter out cancelled, show active and completed
        const filteredVisits = response.data.filter(v => v.status !== 'cancelled');
        setVisits(filteredVisits);
      }
    } catch (error) {
      console.error('Load visits error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVisits();
  };

  const handleCreateVisit = async () => {
    if (!patientId.trim()) {
      Alert.alert('Error', 'Please enter patient ID');
      return;
    }

    setIsCreating(true);

    try {
      console.log('Creating unscheduled visit with data:', {
        patientId: patientId.trim(),
        location: location.trim() || 'Patient Home',
        requestedBy: state.user?.id,
      });

      const response = await UnscheduledVisitService.create({
        patientId: patientId.trim(),
        location: location.trim() || 'Patient Home',
        requestedBy: state.user?.id || 'unknown',
        requestedAt: new Date().toISOString(),
      });

      console.log('Create response:', response);

      if (response.success && response.data) {
        // Add new visit to list
        setVisits([response.data, ...visits]);
        
        // Close modal and reset form
        setShowCreateModal(false);
        setPatientId('');
        setLocation('');

        // Show success message
        Alert.alert(
          'Success',
          'Unscheduled visit created! You can now check-in.',
          [
            {
              text: 'OK',
              onPress: () => {},
            },
          ]
        );
      } else {
        console.error('Create failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to create visit');
      }
    } catch (error) {
      console.error('Create error:', error);
      Alert.alert('Error', 'Failed to create unscheduled visit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleVisitPress = (visit: UnscheduledVisit) => {
    // Determine action based on visit status
    if (visit.status === 'active') {
      router.push({
        pathname: '/check-in',
        params: { 
          scheduleId: visit.scheduleId || visit.id,
          patientId: visit.patientId,
          patientName: visit.patientName || 'Unknown Patient',
          visitId: visit.id,
        },
      });
    } else {
      // View details for completed/cancelled visits
      Alert.alert('Visit Details', `Status: ${visit.status}\nPatient: ${visit.patientName || visit.patientId}`);
    }
  };

  const getVisitProgress = (visit: any) => {
    // Mock progress tracking - will be replaced with actual data from backend
    return {
      checkedIn: visit.checkedIn || false,
      checkedOut: visit.checkedOut || false,
      dailyNoteCompleted: visit.dailyNoteCompleted || false,
    };
  };

  const handleCheckIn = (visit: UnscheduledVisit) => {
    router.push({
      pathname: '/check-in',
      params: { 
        scheduleId: visit.scheduleId || visit.id,
        patientId: visit.patientId,
        patientName: visit.patientName || 'Unknown Patient',
        visitId: visit.id,
      },
    });
  };

  const handleCheckOut = (visit: UnscheduledVisit) => {
    // Check if checked in first
    if (!visit.checkedIn) {
      Alert.alert('Not Checked In', 'Please check in before checking out');
      return;
    }
    
    router.push({
      pathname: '/check-out',
      params: { 
        scheduleId: visit.scheduleId || visit.id,
        patientId: visit.patientId,
        patientName: visit.patientName || 'Unknown Patient',
        visitId: visit.id,
        checkInTime: visit.checkInTime || new Date().toISOString(),
      },
    });
  };

  const handleDailyNote = (visit: UnscheduledVisit) => {
    // Navigate to daily note form
    router.push({
      pathname: '/daily-note',
      params: { 
        scheduleId: visit.scheduleId || visit.id,
        patientId: visit.patientId,
        patientName: visit.patientName || 'Unknown Patient',
        visitId: visit.id,
        checkInTime: visit.checkInTime || new Date().toISOString(),
      },
    });
  };

  const renderVisitItem = ({ item }: { item: UnscheduledVisit }) => {
    const progress = getVisitProgress(item);
    const allCompleted = progress.checkedIn && progress.checkedOut && progress.dailyNoteCompleted;

    return (
      <View style={styles.visitCard}>
        {/* Header */}
        <View style={styles.visitHeader}>
          <View style={styles.visitInfo}>
            <Text style={styles.patientId}>Patient ID: {item.patientId}</Text>
            {item.patientName && (
              <Text style={styles.patientName}>{item.patientName}</Text>
            )}
          </View>
          {allCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Location & Time */}
        <View style={styles.visitDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {/* Check-In Step */}
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons 
                name={progress.checkedIn ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={progress.checkedIn ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.stepLabel, progress.checkedIn && styles.stepLabelCompleted]}>
                {progress.checkedIn ? "✓ Checked In" : "Not Checked In"}
              </Text>
            </View>
            {!progress.checkedIn && (
              <TouchableOpacity 
                style={styles.stepButton}
                onPress={() => handleCheckIn(item)}
              >
                <Ionicons name="log-in" size={16} color="white" />
                <Text style={styles.stepButtonText}>Check-In</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Daily Note Step - Available after check-in */}
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons 
                name={progress.dailyNoteCompleted ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={progress.dailyNoteCompleted ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.stepLabel, progress.dailyNoteCompleted && styles.stepLabelCompleted]}>
                {progress.dailyNoteCompleted ? "✓ Daily Note Completed" : "Daily Note Pending"}
              </Text>
            </View>
            {!progress.dailyNoteCompleted && progress.checkedIn && (
              <TouchableOpacity 
                style={styles.stepButton}
                onPress={() => handleDailyNote(item)}
              >
                <Ionicons name="document-text" size={16} color="white" />
                <Text style={styles.stepButtonText}>Add Note</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Check-Out Step - Available after check-in, no need to wait for daily note */}
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons 
                name={progress.checkedOut ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={progress.checkedOut ? "#4CAF50" : "#ccc"} 
              />
              <Text style={[styles.stepLabel, progress.checkedOut && styles.stepLabelCompleted]}>
                {progress.checkedOut ? "✓ Checked Out" : "Not Checked Out"}
              </Text>
            </View>
            {!progress.checkedOut && progress.checkedIn && (
              <TouchableOpacity 
                style={styles.stepButton}
                onPress={() => handleCheckOut(item)}
              >
                <Ionicons name="log-out" size={16} color="white" />
                <Text style={styles.stepButtonText}>Check-Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Unscheduled Visits</Text>
      <Text style={styles.emptyText}>
        Create an unscheduled visit when you need to provide emergency care
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Create First Visit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Week Picker */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Unscheduled Visits</Text>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Ionicons name="calendar" size={16} color="white" />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerDate}>
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </Text>

        {/* Week Date Selector */}
        <View style={styles.weekSelector}>
          <TouchableOpacity 
            style={styles.weekArrow}
            onPress={goToPreviousWeek}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.weekDatesScroll}
            contentContainerStyle={styles.weekDatesContainer}
          >
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateItem,
                  isSelectedDate(date) && styles.dateItemSelected,
                  isToday(date) && styles.dateItemToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  isSelectedDate(date) && styles.dayTextSelected,
                ]}>
                  {formatDateShort(date)}
                </Text>
                <Text style={[
                  styles.dateText,
                  isSelectedDate(date) && styles.dateTextSelected,
                ]}>
                  {formatDateNum(date)}
                </Text>
                {isToday(date) && !isSelectedDate(date) && (
                  <View style={styles.todayDot} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.weekArrow}
            onPress={goToNextWeek}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Create unscheduled visits for emergency care. After check-in, you can complete daily note and check-out in any order.
        </Text>
      </View>

      {/* Visits List */}
      <FlatList
        data={visits.filter((visit) => {
          // Filter by selected date
          const visitDate = new Date(visit.createdAt);
          return visitDate.toDateString() === selectedDate.toDateString();
        })}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={visits.filter((visit) => {
          const visitDate = new Date(visit.createdAt);
          return visitDate.toDateString() === selectedDate.toDateString();
        }).length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating Create Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Unscheduled Visit</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Patient ID <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter patient ID (e.g. PT001)"
                  value={patientId}
                  onChangeText={setPatientId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Patient home (default)"
                  value={location}
                  onChangeText={setLocation}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleCreateVisit}
                disabled={isCreating}
              >
                <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Creating...' : 'Create Visit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  todayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerDate: {
    fontSize: 16,
    color: '#e3f2fd',
    marginBottom: 15,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekArrow: {
    padding: 8,
  },
  weekDatesScroll: {
    flex: 1,
  },
  weekDatesContainer: {
    gap: 8,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    minWidth: 50,
  },
  dateItemSelected: {
    backgroundColor: 'white',
  },
  dateItemToday: {
    borderWidth: 2,
    borderColor: 'white',
  },
  dayText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginBottom: 4,
  },
  dayTextSelected: {
    color: '#2196F3',
    opacity: 1,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dateTextSelected: {
    color: '#2196F3',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitInfo: {
    flex: 1,
  },
  patientId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  status_active: {
    backgroundColor: '#E8F5E9',
  },
  status_completed: {
    backgroundColor: '#E0E0E0',
  },
  status_cancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
  visitDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stepContainer: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  stepLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 28,
    alignSelf: 'flex-start',
  },
  stepButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  visitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  createButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
