import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Patient {
  id: string;
  name: string;
  patientId: string;
  address: string;
  time: string;
  date: string;
  status: 'upcoming' | 'completed' | 'in-progress' | 'cancelled';
  notes?: string;
  // Progress tracking
  checkedIn?: boolean;
  checkInTime?: string;
  checkedOut?: boolean;
  checkOutTime?: string;
  dailyNoteCompleted?: boolean;
  // Cancel info
  cancelReason?: string;
  cancelledAt?: string;
}

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate dates relative to today for easier testing
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysLater = new Date(today);
threeDaysLater.setDate(today.getDate() + 3);

const mockSchedule: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    patientId: 'P001',
    address: '123 Main St, Downtown',
    time: '09:00 AM - 11:00 AM',
    date: formatDate(twoDaysAgo), // 2 days ago
    status: 'completed',
    notes: 'Regular checkup and medication review',
    checkedIn: true,
    checkInTime: '09:05 AM',
    checkedOut: true,
    checkOutTime: '11:10 AM',
    dailyNoteCompleted: true,
  },
  {
    id: '2',
    name: 'Mary Johnson',
    patientId: 'P002',
    address: '456 Oak Ave, Uptown',
    time: '02:00 PM - 04:00 PM',
    date: formatDate(yesterday), // Yesterday
    status: 'completed',
    notes: 'Physical therapy session',
    checkedIn: true,
    checkInTime: '02:00 PM',
    checkedOut: true,
    checkOutTime: '04:15 PM',
    dailyNoteCompleted: true,
  },
  {
    id: '3',
    name: 'Robert Wilson',
    patientId: 'P003',
    address: '789 Pine St, Midtown',
    time: '08:00 AM - 09:30 AM',
    date: formatDate(today), // TODAY
    status: 'completed',
    notes: 'Daily care assistance',
    checkedIn: true,
    checkInTime: '08:00 AM',
    checkedOut: true,
    checkOutTime: '09:30 AM',
    dailyNoteCompleted: true,
  },
  {
    id: '4',
    name: 'Sarah Davis',
    patientId: 'P004',
    address: '321 Elm St, Eastside',
    time: '10:00 AM - 12:00 PM',
    date: formatDate(today), // TODAY
    status: 'in-progress',
    notes: 'Weekly health check',
    checkedIn: true,
    checkInTime: '10:05 AM',
    checkedOut: false,
    dailyNoteCompleted: false,
  },
  {
    id: '5',
    name: 'Emily Brown',
    patientId: 'P005',
    address: '555 Maple Dr, Westside',
    time: '02:00 PM - 04:00 PM',
    date: formatDate(today), // TODAY
    status: 'upcoming',
    notes: 'Follow-up visit',
    checkedIn: false,
    checkedOut: false,
    dailyNoteCompleted: false,
  },
  {
    id: '6',
    name: 'Michael Lee',
    patientId: 'P006',
    address: '777 Cedar Ln, Northside',
    time: '03:00 PM - 05:00 PM',
    date: formatDate(tomorrow), // Tomorrow
    status: 'upcoming',
    notes: 'Medication administration',
    checkedIn: false,
    checkedOut: false,
    dailyNoteCompleted: false,
  },
  {
    id: '7',
    name: 'David Chen',
    patientId: 'P007',
    address: '999 Oak St, Southside',
    time: '09:00 AM - 11:00 AM',
    date: formatDate(threeDaysLater), // 3 days later
    status: 'cancelled',
    notes: 'Routine check',
    checkedIn: false,
    checkedOut: false,
    dailyNoteCompleted: false,
    cancelReason: 'Patient feeling better, cancelled appointment',
    cancelledAt: new Date().toISOString(),
  },
];

export default function ScheduleScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState(mockSchedule);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Debug: Log initial date
  console.log('=== ScheduleScreen Render ===');
  console.log('Current Date:', new Date().toDateString());
  console.log('Selected Date:', selectedDate.toDateString());
  console.log('Total Mock Schedule Items:', mockSchedule.length);

  // Get week dates (7 days starting from selected date's week start)
  const getWeekDates = () => {
    const current = new Date(selectedDate);
    const currentDay = current.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate Sunday of current week
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - currentDay);
    
    // Generate 7 days starting from Sunday
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  const formatDateShort = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatDateNum = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCancelSchedule = (patient: Patient) => {
    Alert.alert(
      'Cancel Schedule',
      `Are you sure you want to cancel the appointment with ${patient.name}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            // Navigate to cancel schedule screen
            router.push('/cancel-schedule');
          }
        }
      ]
    );
  };

  const handleCheckIn = (patient: Patient) => {
    // Navigate to check-in screen with patient params
    router.push({
      pathname: '/check-in',
      params: {
        scheduleId: patient.id,
        patientId: patient.patientId,
        patientName: patient.name,
      },
    });
  };

  const handleCheckOut = (patient: Patient) => {
    // Navigate to check-out screen with patient params
    router.push({
      pathname: '/check-out',
      params: {
        scheduleId: patient.id,
        patientId: patient.patientId,
        patientName: patient.name,
        checkInTime: patient.checkInTime || new Date().toISOString(),
      },
    });
  };

  const handleDailyNote = (patient: Patient) => {
    // Navigate to daily note screen with patient params
    router.push({
      pathname: '/daily-note',
      params: {
        scheduleId: patient.id,
        patientId: patient.patientId,
        patientName: patient.name,
        checkInTime: patient.checkInTime || new Date().toISOString(),
      },
    });
  };

  const handleDetails = (patient: Patient) => {
    Alert.alert(
      'Patient Details',
      `Name: ${patient.name}\nID: ${patient.patientId}\nAddress: ${patient.address}\nTime: ${patient.time}\nStatus: ${patient.status}${patient.notes ? `\nNotes: ${patient.notes}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'cancelled':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'play-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Upcoming';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Today's Schedule</Text>
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

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {(() => {
          // Filter schedules by selected date
          const filteredSchedule = schedule.filter((patient) => {
            const [year, month, day] = patient.date.split('-').map(Number);
            const patientDate = new Date(year, month - 1, day);
            return patientDate.toDateString() === selectedDate.toDateString();
          });
          
          // Show empty state if no schedules
          if (filteredSchedule.length === 0) {
            return (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No schedules for this date</Text>
                <Text style={styles.emptySubtext}>
                  Select another date or check back later
                </Text>
              </View>
            );
          }
          
          // Render schedule items
          return filteredSchedule.map((patient) => {
          const progress = {
            checkedIn: patient.checkedIn || false,
            checkedOut: patient.checkedOut || false,
            dailyNoteCompleted: patient.dailyNoteCompleted || false,
          };
          const allCompleted = progress.checkedIn && progress.checkedOut && progress.dailyNoteCompleted;
          const isCancelled = patient.status === 'cancelled';

          return (
            <View key={patient.id} style={[styles.patientCard, isCancelled && styles.cancelledCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                  <Text style={[styles.patientName, isCancelled && styles.cancelledText]}>
                    {patient.name}
                  </Text>
                  <Text style={[styles.patientId, isCancelled && styles.cancelledText]}>
                    ID: {patient.patientId}
                  </Text>
                </View>
                {allCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : isCancelled ? (
                  <View style={styles.cancelledBadge}>
                    <Ionicons name="close-circle" size={20} color="#f44336" />
                    <Text style={styles.cancelledBadgeText}>Cancelled</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}>
                    <Ionicons
                      name={getStatusIcon(patient.status) as any}
                      size={12}
                      color="white"
                    />
                    <Text style={styles.statusText}>{formatStatus(patient.status)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                  <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                    {patient.time}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                  <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                    {patient.address}
                  </Text>
                </View>
                {patient.notes && (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                    <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                      {patient.notes}
                    </Text>
                  </View>
                )}
              </View>

              {/* Show cancel info for cancelled schedules */}
              {isCancelled && patient.cancelReason && (
                <View style={styles.cancelInfoContainer}>
                  <View style={styles.cancelInfoHeader}>
                    <Ionicons name="information-circle" size={18} color="#f44336" />
                    <Text style={styles.cancelInfoTitle}>Cancellation Details</Text>
                  </View>
                  <Text style={styles.cancelReason}>{patient.cancelReason}</Text>
                  {patient.cancelledAt && (
                    <Text style={styles.cancelTime}>
                      Cancelled at: {patient.cancelledAt}
                    </Text>
                  )}
                </View>
              )}

              {/* Only show progress for non-cancelled schedules */}
              {!isCancelled && (
                <>
                  {/* Progress Steps */}
                  <View style={styles.progressContainer}>
                {/* Check-In Step */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <Ionicons 
                      name={progress.checkedIn ? "checkmark-circle" : "ellipse-outline"} 
                      size={18} 
                      color={progress.checkedIn ? "#4CAF50" : "#ccc"} 
                    />
                    <Text style={[styles.stepLabel, progress.checkedIn && styles.stepLabelCompleted]}>
                      {progress.checkedIn ? "✓ Checked In" : "Not Checked In"}
                    </Text>
                  </View>
                  {!progress.checkedIn && (
                    <TouchableOpacity 
                      style={styles.stepButton}
                      onPress={() => handleCheckIn(patient)}
                    >
                      <Ionicons name="log-in" size={14} color="white" />
                      <Text style={styles.stepButtonText}>Check-In</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Daily Note Step */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <Ionicons 
                      name={progress.dailyNoteCompleted ? "checkmark-circle" : "ellipse-outline"} 
                      size={18} 
                      color={progress.dailyNoteCompleted ? "#4CAF50" : "#ccc"} 
                    />
                    <Text style={[styles.stepLabel, progress.dailyNoteCompleted && styles.stepLabelCompleted]}>
                      {progress.dailyNoteCompleted ? "✓ Daily Note Completed" : "Daily Note Pending"}
                    </Text>
                  </View>
                  {!progress.dailyNoteCompleted && progress.checkedIn && (
                    <TouchableOpacity 
                      style={styles.stepButton}
                      onPress={() => handleDailyNote(patient)}
                    >
                      <Ionicons name="document-text" size={14} color="white" />
                      <Text style={styles.stepButtonText}>Add Note</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Check-Out Step */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <Ionicons 
                      name={progress.checkedOut ? "checkmark-circle" : "ellipse-outline"} 
                      size={18} 
                      color={progress.checkedOut ? "#4CAF50" : "#ccc"} 
                    />
                    <Text style={[styles.stepLabel, progress.checkedOut && styles.stepLabelCompleted]}>
                      {progress.checkedOut ? "✓ Checked Out" : "Not Checked Out"}
                    </Text>
                  </View>
                  {!progress.checkedOut && progress.checkedIn && (
                    <TouchableOpacity 
                      style={styles.stepButton}
                      onPress={() => handleCheckOut(patient)}
                    >
                      <Ionicons name="log-out" size={14} color="white" />
                      <Text style={styles.stepButtonText}>Check-Out</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Cancel Button - only for non-cancelled and non-completed schedules */}
              {!isCancelled && !allCompleted && (
                <TouchableOpacity 
                  style={styles.cancelScheduleButton} 
                  onPress={() => handleCancelSchedule(patient)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#f44336" />
                  <Text style={styles.cancelScheduleText}>Cancel Schedule</Text>
                </TouchableOpacity>
              )}
                </>
              )}
            </View>
          );
        });
        })()}
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  cancelInfoContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  cancelInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 6,
  },
  cancelReason: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
    marginBottom: 6,
  },
  cancelTime: {
    fontSize: 12,
    color: '#FB8C00',
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  patientId: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
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
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  stepContainer: {
    marginBottom: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    marginLeft: 8,
    fontSize: 13,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 26,
    alignSelf: 'flex-start',
  },
  stepButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelScheduleText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
    minWidth: '18%',
    justifyContent: 'center',
  },
  actionText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 3,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  cancelText: {
    color: '#f44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});