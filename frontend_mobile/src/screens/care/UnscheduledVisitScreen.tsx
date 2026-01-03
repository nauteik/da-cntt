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
import serviceDeliveryService from '../../services/api/serviceDeliveryService';
import { Schedule } from '../../types';
import PatientSearchModal from '../../components/schedule/PatientSearchModal';

/**
 * Unscheduled Visit Screen
 * Shows list of user's unscheduled visits and allows creating new ones
 * Works like regular schedule - can check-in/out and create daily notes
 */
// Interface for unscheduled visit display
interface UnscheduledVisitDisplay extends Schedule {
  serviceDeliveryId: string;
  unscheduledReason?: string;
  actualStaffName?: string;
  scheduledStaffName?: string;
}

export default function UnscheduledVisitScreen() {
  const { state } = useAuth();
  const [visits, setVisits] = useState<UnscheduledVisitDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);
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
    if (!state.user?.staffId) {
      console.error('[UnscheduledVisitScreen] No staff ID available');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    console.log('========== LOAD UNSCHEDULED VISITS ==========');
    console.log('👤 Staff ID:', state.user.staffId);
    setIsLoading(true);
    try {
      // Get all service deliveries for this staff
      const allServiceDeliveries = await serviceDeliveryService.getByStaff(state.user.staffId);
      console.log('📦 All service deliveries received:', allServiceDeliveries.length);
      console.log('📋 First service delivery sample:', allServiceDeliveries[0]);

      // Filter only unscheduled visits (where actualStaffId is set and different from scheduledStaffId)
      const unscheduledServiceDeliveries = allServiceDeliveries.filter(
        (sd) => sd.isUnscheduled === true && sd.actualStaffId === state.user?.staffId
      );

      console.log('🔍 Filtered unscheduled visits:', unscheduledServiceDeliveries.length);
      if (unscheduledServiceDeliveries.length > 0) {
        console.log('📝 First unscheduled visit details:', {
          id: unscheduledServiceDeliveries[0].id,
          patientName: unscheduledServiceDeliveries[0].patientName,
          patientAddress: unscheduledServiceDeliveries[0].patientAddress,
          patientCity: unscheduledServiceDeliveries[0].patientCity,
          patientState: unscheduledServiceDeliveries[0].patientState,
          patientZipCode: unscheduledServiceDeliveries[0].patientZipCode,
          isUnscheduled: unscheduledServiceDeliveries[0].isUnscheduled,
          actualStaffId: unscheduledServiceDeliveries[0].actualStaffId,
          allKeys: Object.keys(unscheduledServiceDeliveries[0]),
        });
      }

      // Transform ServiceDeliveryResponse to UnscheduledVisitDisplay
      const unscheduledVisits: UnscheduledVisitDisplay[] = unscheduledServiceDeliveries.map((sd, index) => {
        // Build location string from patient address
        const location = sd.patientAddress || 
                        (sd.patientCity && sd.patientState 
                          ? `${sd.patientCity}, ${sd.patientState}` 
                          : 'Patient Home');
        
        console.log(`🔄 Transforming visit ${index + 1}:`, {
          id: sd.id,
          patientName: sd.patientName,
          patientAddress: sd.patientAddress,
          patientCity: sd.patientCity,
          patientState: sd.patientState,
          computedLocation: location,
        });
        
        return {
          id: sd.scheduleEventId, // Use schedule event ID as the main ID
          serviceDeliveryId: sd.id,
          patientId: sd.patientId || '',
          patient: {
            id: sd.patientId || '',
            name: sd.patientName || 'Unknown Patient',
            clientId: '',
          } as any,
          employeeId: sd.actualStaffId || state.user?.staffId || '',
          employeeName: sd.actualStaffName || state.user?.name || '',
          date: new Date(sd.createdAt).toISOString().split('T')[0],
          startTime: sd.startAt || '',
          endTime: sd.endAt || '',
          status: sd.status === 'COMPLETED' ? 'completed' : 
                  sd.status === 'CANCELLED' ? 'cancelled' : 'in-progress',
          location: location,
          serviceType: 'Unscheduled Visit',
          authorizationId: sd.authorizationId,
          checkInTime: sd.checkInTime,
          checkOutTime: sd.checkOutTime,
          unscheduledReason: sd.unscheduledReason,
          actualStaffName: sd.actualStaffName,
          scheduledStaffName: sd.scheduledStaffName,
        };
      });

      console.log('✅ Final transformed visits:', unscheduledVisits.length);
      if (unscheduledVisits.length > 0) {
        console.log('📍 First visit location:', unscheduledVisits[0].location);
        console.log('📍 All visit locations:', unscheduledVisits.map(v => ({ 
          patient: v.patient.name, 
          location: v.location 
        })));
      }
      console.log('============================================');

      setVisits(unscheduledVisits);
    } catch (error) {
      console.error('❌ [UnscheduledVisitScreen] Load visits error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVisits();
  };

  const handleCreateUnscheduledVisit = async (
    selectedSchedule: Schedule,
    reason: string
  ) => {
    if (!state.user?.staffId) {
      Alert.alert('Error', 'Staff ID not found');
      return;
    }

    try {
      console.log('========== CREATE UNSCHEDULED VISIT ==========');
      console.log('[UnscheduledVisitScreen] Creating unscheduled visit:', {
        scheduleEventId: selectedSchedule.id,
        patientName: selectedSchedule.patient.name,
        actualStaffId: state.user.staffId,
        reason: reason,
        authorizationId: selectedSchedule.authorizationId,
      });

      const serviceDelivery = await serviceDeliveryService.create({
        scheduleEventId: selectedSchedule.id,
        authorizationId: selectedSchedule.authorizationId,
        isUnscheduled: true,
        actualStaffId: state.user.staffId,
        unscheduledReason: reason,
      });

      console.log('✅ [UnscheduledVisitScreen] Service Delivery created:', serviceDelivery);
      console.log('📍 Location in created SD:', {
        patientAddress: serviceDelivery.patientAddress,
        patientCity: serviceDelivery.patientCity,
        patientState: serviceDelivery.patientState,
        patientZipCode: serviceDelivery.patientZipCode,
        allKeys: Object.keys(serviceDelivery),
      });
      console.log('=============================================');

      // Close modal
      setShowPatientSearchModal(false);

      // Reload visits to show new one
      await loadVisits();

      // Automatically navigate to check-in
      router.push({
        pathname: '/check-in',
        params: {
          scheduleEventId: selectedSchedule.id,
          serviceDeliveryId: serviceDelivery.id,
          patientId: selectedSchedule.patientId,
          patientName: selectedSchedule.patient.name,
        },
      });
    } catch (error) {
      console.error('❌ [UnscheduledVisitScreen] Create error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert('Error', 'Failed to create unscheduled visit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleVisitPress = (visit: UnscheduledVisitDisplay) => {
    // Determine action based on visit status
    if (visit.status === 'in-progress') {
      router.push({
        pathname: '/check-in',
        params: { 
          scheduleEventId: visit.id,
          serviceDeliveryId: visit.serviceDeliveryId,
          patientId: visit.patientId,
          patientName: visit.patient.name,
        },
      });
    } else {
      // View details for completed/cancelled visits
      Alert.alert(
        'Visit Details',
        `Status: ${visit.status}\nPatient: ${visit.patient.name}\nReason: ${visit.unscheduledReason || 'N/A'}\nScheduled Staff: ${visit.scheduledStaffName || 'N/A'}`
      );
    }
  };

  const getVisitProgress = (visit: UnscheduledVisitDisplay) => {
    // Use actual check-in/check-out times from service delivery
    return {
      checkedIn: !!visit.checkInTime,
      checkedOut: !!visit.checkOutTime,
      dailyNoteCompleted: !!visit.dailyNoteId, // Daily note exists if dailyNoteId is present
    };
  };

  const handleCheckIn = (visit: UnscheduledVisitDisplay) => {
    router.push({
      pathname: '/check-in',
      params: { 
        scheduleEventId: visit.id,
        serviceDeliveryId: visit.serviceDeliveryId,
        patientId: visit.patientId,
        patientName: visit.patient.name,
      },
    });
  };

  const handleCheckOut = (visit: UnscheduledVisitDisplay) => {
    // Check if checked in first
    if (!visit.checkInTime) {
      Alert.alert('Not Checked In', 'Please check in before checking out');
      return;
    }
    
    router.push({
      pathname: '/check-out',
      params: { 
        serviceDeliveryId: visit.serviceDeliveryId,
        patientId: visit.patientId,
        patientName: visit.patient.name,
      },
    });
  };

  const handleDailyNote = (visit: UnscheduledVisitDisplay) => {
    router.push({
      pathname: '/daily-note',
      params: { 
        serviceDeliveryId: visit.serviceDeliveryId,
        patientId: visit.patientId,
        patientName: visit.patient.name,
      },
    });
  };

  const renderVisitItem = ({ item }: { item: UnscheduledVisitDisplay }) => {
    const progress = getVisitProgress(item);
    const allCompleted = progress.checkedIn && progress.checkedOut && progress.dailyNoteCompleted;
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={[styles.visitCard, isCancelled && styles.cancelledCard]}>
        {/* Header */}
        <View style={styles.visitHeader}>
          <View style={styles.visitInfo}>
            <Text style={[styles.patientName, isCancelled && styles.cancelledText]}>
              {item.patient.name}
            </Text>
            <Text style={styles.patientId}>Patient ID: {item.patientId}</Text>
          </View>
          {allCompleted && !isCancelled && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <Ionicons name="close-circle" size={20} color="#f44336" />
              <Text style={styles.cancelledBadgeText}>Cancelled</Text>
            </View>
          )}
        </View>

        {/* Replacement Info */}
        {item.unscheduledReason && (
          <View style={styles.reasonContainer}>
            <Ionicons name="information-circle" size={16} color="#FF9800" />
            <Text style={styles.reasonText}>Reason: {item.unscheduledReason}</Text>
          </View>
        )}

        {item.scheduledStaffName && (
          <View style={styles.scheduledStaffContainer}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.scheduledStaffText}>
              Originally scheduled: {item.scheduledStaffName}
            </Text>
          </View>
        )}

        {/* Location & Time */}
        <View style={styles.visitDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.date} • {item.startTime || 'Not started'} - {item.endTime || 'Not ended'}
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
        onPress={() => setShowPatientSearchModal(true)}
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
        <Ionicons name="information-circle" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          Replacement visits: These are schedules where you're replacing another staff member. Tap the + button at the bottom right to create a new unscheduled visit.
        </Text>
      </View>

      {/* Visits List */}
      <FlatList
        data={visits.filter((visit) => {
          // Filter by selected date
          return visit.date === selectedDate.toISOString().split('T')[0];
        })}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.serviceDeliveryId}
        contentContainerStyle={visits.filter((visit) => {
          return visit.date === selectedDate.toISOString().split('T')[0];
        }).length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating Create Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowPatientSearchModal(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Patient Search Modal */}
      <PatientSearchModal
        visible={showPatientSearchModal}
        onClose={() => setShowPatientSearchModal(false)}
        onSelectSchedule={handleCreateUnscheduledVisit}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createUnscheduledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  createUnscheduledButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  cancelledCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.85,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelledText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cancelledBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f44336',
    marginLeft: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  scheduledStaffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledStaffText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
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
