import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { useAuth } from '../../store/authStore';
import { ScheduleService } from '../../services/api/scheduleService';
import serviceDeliveryService from '../../services/api/serviceDeliveryService';
import { Schedule } from '../../types';
import { useCustomAlert } from '../../components/common/CustomAlert';
import PatientSearchModal from '../../components/schedule/PatientSearchModal';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ScheduleScreen() {
  const { state: authState } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch schedule events from backend
  useEffect(() => {
    if (authState.user?.staffId) {
      console.log('[ScheduleScreen] Current user:', {
        userId: authState.user.id,
        staffId: authState.user.staffId,
        name: authState.user.name,
        role: authState.user.role,
      });
      fetchScheduleEvents();
    } else {
      console.warn('[ScheduleScreen] No staff ID available for user');
    }
  }, [selectedDate, authState.user?.staffId]);

  // Refresh data when screen comes into focus (after check-in, check-out, daily note)
  useFocusEffect(
    useCallback(() => {
      if (authState.user?.staffId) {
        console.log('[ScheduleScreen] Screen focused - refreshing schedule data');
        fetchScheduleEvents();
      }
    }, [selectedDate, authState.user?.staffId])
  );

  const fetchScheduleEvents = async () => {
    if (!authState.user?.staffId) {
      console.error('[ScheduleScreen] No staff ID available');
      showAlert(
        'Error',
        'Staff ID not found. Please login again.',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    setLoading(true);
    try {
      const from = formatDate(selectedDate);
      const to = formatDate(selectedDate);
      
      console.log('[ScheduleScreen] Fetching events for staff:', authState.user.staffId, 'on date:', from);
      
      // Fetch scheduled events
      const scheduledEvents = await ScheduleService.getStaffScheduleEvents(
        authState.user.staffId,
        from,
        to
      );
      
      console.log('[ScheduleScreen] Received', scheduledEvents.length, 'scheduled events');
      
      // Fetch all service deliveries for the staff to get cancellation status
      let serviceDeliveriesMap: Map<string, any> = new Map();
      try {
        const allServiceDeliveries = await serviceDeliveryService.getByStaff(authState.user.staffId);
        // Create map by serviceDeliveryId for quick lookup
        allServiceDeliveries.forEach(sd => {
          serviceDeliveriesMap.set(sd.id, sd);
        });
        console.log('[ScheduleScreen] Fetched', allServiceDeliveries.length, 'service deliveries for cancellation status');
      } catch (error) {
        console.error('[ScheduleScreen] Error fetching service deliveries:', error);
      }
      
      // Merge cancellation status into scheduled events
      // Priority: 1) Schedule Event cancelled status (set by admin), 2) Service Delivery cancelled status
      const scheduledEventsWithCancellation = scheduledEvents.map(event => {
        // Check if schedule event itself is cancelled (set by admin from frontend)
        const scheduleEventCancelled = event.cancelled === true;
        
        if (event.serviceDeliveryId && serviceDeliveriesMap.has(event.serviceDeliveryId)) {
          const sd = serviceDeliveriesMap.get(event.serviceDeliveryId);
          const serviceDeliveryCancelled = sd.cancelled === true;
          
          return {
            ...event,
            // Cancelled if EITHER schedule event OR service delivery is cancelled
            cancelled: scheduleEventCancelled || serviceDeliveryCancelled,
            cancelledAt: event.cancelledAt || sd.cancelledAt,
            cancelledBy: event.cancelledBy || sd.cancelledBy,
            cancellationReason: event.cancellationReason || sd.cancellationReason,
          };
        }
        
        // No service delivery - keep schedule event cancelled status
        return {
          ...event,
          cancelled: scheduleEventCancelled,
        };
      });
      
      // Filter out cancelled completed visits from scheduled events (soft cancel)
      const activeScheduledEvents = scheduledEventsWithCancellation.filter(event => {
        // Show if not cancelled, OR if cancelled but not completed yet (staff needs to check-out)
        return !event.cancelled || event.serviceDeliveryStatus !== 'COMPLETED';
      });
      
      console.log('[ScheduleScreen] Active scheduled events after cancel filter:', activeScheduledEvents.length);
      
      // Fetch unscheduled visits (service deliveries where isUnscheduled = true)
      let unscheduledVisits: Schedule[] = [];
      try {
        const serviceDeliveries = await serviceDeliveryService.getByStaff(authState.user.staffId);
        
        // Filter unscheduled and convert to Schedule format
        // Only show unscheduled visits where current user is the ACTUAL staff (replacement)
        // Show cancelled visits if not completed (soft cancel - allow check-out)
        unscheduledVisits = serviceDeliveries
          .filter(sd => 
            sd.isUnscheduled && 
            sd.startAt.startsWith(from) && 
            sd.actualStaffId === authState.user.staffId &&
            // Show if not cancelled, OR if cancelled but not completed yet (staff needs to check-out)
            (!sd.cancelled || sd.status !== 'COMPLETED')
          )
          .map(sd => ({
            id: sd.id,
            patientId: sd.patientId,
            patient: {
              id: sd.patientId,
              name: sd.patientName,
              patientId: sd.patientId,
              address: '', // Not available in service delivery
            },
            employeeId: sd.actualStaffId || sd.staffId,
            employeeName: sd.actualStaffName || sd.staffName,
            startTime: new Date(sd.startAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }),
            endTime: new Date(sd.endAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }),
            date: from,
            status: sd.status === 'COMPLETED' ? 'completed' : 
                   sd.status === 'IN_PROGRESS' ? 'in-progress' : 'upcoming',
            location: '', // Not available
            serviceType: '',
            officeId: sd.officeId,
            officeName: sd.officeName,
            authorizationId: sd.authorizationId,
            serviceDeliveryId: sd.id,
            serviceDeliveryStatus: sd.status,
            checkInTime: sd.checkInTime,
            checkOutTime: sd.checkOutTime,
            dailyNoteId: sd.dailyNoteId, // Daily Note ID if completed
            // Unscheduled visit specific fields
            isUnscheduled: true,
            scheduledStaffId: sd.scheduledStaffId,
            scheduledStaffName: sd.scheduledStaffName,
            actualStaffId: sd.actualStaffId,
            actualStaffName: sd.actualStaffName,
            unscheduledReason: sd.unscheduledReason,
            // Cancellation fields
            cancelled: sd.cancelled,
            cancelledAt: sd.cancelledAt,
            cancelledBy: sd.cancelledBy,
            cancellationReason: sd.cancellationReason,
          } as Schedule));
        
        console.log('[ScheduleScreen] Received', unscheduledVisits.length, 'unscheduled visits');
      } catch (error) {
        console.error('[ScheduleScreen] Error fetching unscheduled visits:', error);
        // Don't fail if unscheduled visits can't be fetched
      }
      
      // Merge and sort by start time
      const allEvents = [...activeScheduledEvents, ...unscheduledVisits].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
      
      console.log('[ScheduleScreen] Total events (scheduled + unscheduled):', allEvents.length);
      setSchedule(allEvents);
    } catch (error) {
      console.error('[ScheduleScreen] Error fetching schedule:', error);
      // Don't show alert for now since we're using mock data
      // Alert.alert('Error', 'Failed to fetch schedule events');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchScheduleEvents();
    setRefreshing(false);
  }, [selectedDate, authState.user?.staffId]);

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

  // Create Service Delivery (Start Shift)
  const handleStartShift = async (scheduleEvent: Schedule) => {
    // Check if the schedule is cancelled
    if (scheduleEvent.cancelled) {
      showAlert(
        'Error',
        'Cannot start shift for a cancelled visit.',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    if (!scheduleEvent.id) {
      showAlert(
        'Error',
        'Schedule Event ID not found',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    if (!scheduleEvent.authorizationId) {
      showAlert(
        'Error',
        'Authorization ID not found. Cannot start shift.',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    try {
      setLoading(true);
      
      console.log('[ScheduleScreen] Creating Service Delivery for:', {
        scheduleEventId: scheduleEvent.id,
        authorizationId: scheduleEvent.authorizationId,
        patientName: scheduleEvent.patient.name,
      });
      
      const serviceDelivery = await serviceDeliveryService.create({
        scheduleEventId: scheduleEvent.id,
        authorizationId: scheduleEvent.authorizationId,
      });
      
      console.log('[ScheduleScreen] Service Delivery created:', serviceDelivery);
      
      // Update local state immediately for better UX
      setSchedule(prevSchedule => 
        prevSchedule.map(event => 
          event.id === scheduleEvent.id 
            ? { 
                ...event, 
                serviceDeliveryId: serviceDelivery.id,
                serviceDeliveryStatus: 'NOT_STARTED' // Initial TaskStatus from backend
              } 
            : event
        )
      );
      
      showAlert(
        'Success',
        'Shift started successfully! You can now check in from the schedule.',
        [
          { text: 'OK', style: 'default' },
        ],
        'checkmark-circle',
        '#4CAF50'
      );

      // Also refresh from backend to get any other updates
      await fetchScheduleEvents();
    } catch (error) {
      console.error('Error creating service delivery:', error);
      showAlert(
        'Error',
        'Failed to start shift. Please try again.',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (scheduleEvent: Schedule, serviceDeliveryId?: string) => {
    const sdId = serviceDeliveryId || scheduleEvent.serviceDeliveryId;
    
    if (!sdId) {
      showAlert(
        'Error',
        'Please start shift first before checking in',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    // Navigate to check-in screen with params
    router.push({
      pathname: '/check-in',
      params: {
        scheduleEventId: scheduleEvent.id,
        serviceDeliveryId: sdId,
        patientId: scheduleEvent.patientId,
        patientName: scheduleEvent.patient.name,
      },
    });
  };

  const handleCheckOut = (scheduleEvent: Schedule) => {
    if (!scheduleEvent.serviceDeliveryId) {
      showAlert(
        'Error',
        'Service Delivery not found',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    // Navigate to check-out screen with params
    router.push({
      pathname: '/check-out',
      params: {
        serviceDeliveryId: scheduleEvent.serviceDeliveryId,
        patientId: scheduleEvent.patientId,
        patientName: scheduleEvent.patient.name,
      },
    });
  };

  const handleDailyNote = (scheduleEvent: Schedule) => {
    if (!scheduleEvent.serviceDeliveryId) {
      showAlert(
        'Error',
        'Service Delivery not found',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#f44336'
      );
      return;
    }

    // Navigate to daily note screen with params
    router.push({
      pathname: '/daily-note',
      params: {
        serviceDeliveryId: scheduleEvent.serviceDeliveryId,
        patientId: scheduleEvent.patientId,
        patientName: scheduleEvent.patient.name,
      },
    });
  };

  const handleDetails = (scheduleEvent: Schedule) => {
    showAlert(
      'Patient Details',
      `Name: ${scheduleEvent.patient.name}\nID: ${scheduleEvent.patientId}\nAddress: ${scheduleEvent.location}\nTime: ${scheduleEvent.startTime} - ${scheduleEvent.endTime}\nStatus: ${scheduleEvent.status}${scheduleEvent.notes ? `\nNotes: ${scheduleEvent.notes}` : ''}`,
      [{ text: 'OK', style: 'default' }],
      'information-circle',
      '#2196F3'
    );
  };

  const getStatusColor = (status: string) => {
    // Handle both TaskStatus enum and legacy status values
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'IN_PROGRESS':
      case 'IN-PROGRESS':
        return '#FF9800';
      case 'INCOMPLETE':
        return '#FB8C00'; // Orange for incomplete
      case 'NOT_STARTED':
        return '#2196F3'; // Blue for not started
      case 'CANCELLED':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = (status: string) => {
    // Handle both TaskStatus enum and legacy status values
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'IN_PROGRESS':
      case 'IN-PROGRESS':
        return 'play-circle';
      case 'INCOMPLETE':
        return 'alert-circle';
      case 'NOT_STARTED':
        return 'time';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const formatStatus = (status: string) => {
    // Handle both TaskStatus enum and legacy status values
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
      case 'IN-PROGRESS':
        return 'In Progress';
      case 'INCOMPLETE':
        return 'Incomplete';
      case 'NOT_STARTED':
        return 'Not Started';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Not Started';
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

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {(() => {
          // Filter schedules by selected date
          const filteredSchedule = schedule.filter((event) => {
            return event.date === formatDate(selectedDate);
          });
          
          // Show empty state if no schedules
          if (filteredSchedule.length === 0 && !loading) {
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
          return filteredSchedule.map((event) => {
          // Determine progress from actual check-in/check-out data
          const hasServiceDelivery = !!event.serviceDeliveryId;
          const progress = {
            checkedIn: !!event.checkInTime, // Check if CHECK_IN event exists
            checkedOut: !!event.checkOutTime, // Check if CHECK_OUT event exists
            dailyNoteCompleted: !!event.dailyNoteId, // Daily note exists if dailyNoteId is present
          };
          
          // Check if all steps are completed
          const allStepsCompleted = progress.checkedIn && progress.checkedOut && progress.dailyNoteCompleted;
          
          // Debug logging
          if (hasServiceDelivery) {
            console.log('[ScheduleScreen] Event progress:', {
              eventId: event.id,
              patientName: event.patient.name,
              serviceDeliveryId: event.serviceDeliveryId,
              serviceDeliveryStatus: event.serviceDeliveryStatus,
              checkInTime: event.checkInTime,
              checkOutTime: event.checkOutTime,
              dailyNoteId: event.dailyNoteId,
              progress,
              allStepsCompleted,
            });
          }
          
          // Consider completed if: status is 'completed' OR serviceDeliveryStatus is 'COMPLETED' OR all steps are done
          const allCompleted = event.status === 'completed' || 
                               event.serviceDeliveryStatus?.toUpperCase() === 'COMPLETED' ||
                               allStepsCompleted;
          
          // Check if cancelled from BOTH field and status (admin may set either)
          const isCancelled = event.cancelled === true || 
                             event.status?.toLowerCase() === 'cancelled' ||
                             event.serviceDeliveryStatus?.toUpperCase() === 'CANCELLED';
          
          // Use serviceDeliveryStatus (TaskStatus) if available, otherwise use schedule status
          const displayStatus = event.serviceDeliveryId && event.serviceDeliveryStatus 
            ? event.serviceDeliveryStatus 
            : event.status;

          return (
            <View key={event.id} style={[styles.patientCard, isCancelled && styles.cancelledCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                  <View style={styles.patientNameRow}>
                    <Text style={[styles.patientName, isCancelled && styles.cancelledText]}>
                      {event.patient.name}
                    </Text>
                    {/* Replacement Badge for unscheduled visits */}
                    {event.isUnscheduled && (
                      <View style={styles.replacementBadge}>
                        <Ionicons name="swap-horizontal" size={14} color="#FF9800" />
                        <Text style={styles.replacementBadgeText}>Replacement</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.patientId, isCancelled && styles.cancelledText]}>
                    ID: {event.patientId}
                  </Text>
                </View>
                {allCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : isCancelled ? (
                  <View style={styles.cancelledBadge}>
                    <Ionicons name="alert-circle" size={20} color="#f44336" />
                    <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayStatus) }]}>
                    <Ionicons
                      name={getStatusIcon(displayStatus) as any}
                      size={12}
                      color="white"
                    />
                    <Text style={styles.statusText}>{formatStatus(displayStatus)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                {/* Cancelled visit alert */}
                {isCancelled && (
                  <View style={styles.cancelledAlert}>
                    <View style={styles.cancelledAlertHeader}>
                      <Ionicons name="warning" size={18} color="#f44336" />
                      <Text style={styles.cancelledAlertTitle}>Visit Cancelled</Text>
                    </View>
                    <Text style={styles.cancelledAlertText}>
                      This visit has been cancelled. Please complete check-out if you have started.
                    </Text>
                    {event.cancellationReason && (
                      <Text style={styles.cancellationReason}>
                        Reason: {event.cancellationReason}
                      </Text>
                    )}
                  </View>
                )}
                
                {/* Unscheduled visit info (for replacement staff) */}
                {event.isUnscheduled && (
                  <View style={styles.replacementInfoCard}>
                    <View style={styles.replacementInfoRow}>
                      <Ionicons name="information-circle" size={18} color="#FF9800" />
                      <Text style={styles.replacementInfoTitle}>Staff Replacement</Text>
                    </View>
                    <View style={styles.replacementDetails}>
                      <Text style={styles.replacementDetailText}>
                        <Text style={styles.replacementDetailLabel}>Original: </Text>
                        {event.scheduledStaffName || 'N/A'}
                      </Text>
                      <Text style={styles.replacementDetailText}>
                        <Text style={styles.replacementDetailLabel}>Current: </Text>
                        {event.actualStaffName || 'You'}
                      </Text>
                      {event.unscheduledReason && (
                        <Text style={styles.replacementReason}>
                          Reason: {event.unscheduledReason}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                
                {/* Replaced notification (for original staff) */}
                {event.isReplaced && !event.isUnscheduled && (
                  <View style={styles.replacedNotificationCard}>
                    <View style={styles.replacedNotificationHeader}>
                      <Ionicons name="person-remove" size={18} color="#F44336" />
                      <Text style={styles.replacedNotificationTitle}>Schedule Replaced</Text>
                    </View>
                    <View style={styles.replacedNotificationBody}>
                      <Text style={styles.replacedNotificationText}>
                        This schedule has been assigned to another staff member.
                      </Text>
                      <Text style={styles.replacedStaffText}>
                        <Text style={styles.replacedStaffLabel}>Replacement Staff: </Text>
                        {event.replacementStaffName}
                      </Text>
                      {event.replacementReason && (
                        <Text style={styles.replacedReasonText}>
                          Reason: {event.replacementReason}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                  <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                    {event.startTime} - {event.endTime}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                  <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                    {event.location}
                  </Text>
                </View>
                {event.notes && (
                  <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={16} color={isCancelled ? "#999" : "#666"} />
                    <Text style={[styles.infoText, isCancelled && styles.cancelledText]}>
                      {event.notes}
                    </Text>
                  </View>
                )}
              </View>

              {/* Show actions for non-replaced schedules - allow check-out even if cancelled (soft cancel) */}
              {!event.isReplaced && (
                <>
                  {/* Start Shift Button - only if Service Delivery doesn't exist and not cancelled */}
                  {!hasServiceDelivery && !isCancelled && (
                    <TouchableOpacity 
                      style={styles.startShiftButton}
                      onPress={() => handleStartShift(event)}
                      disabled={loading}
                    >
                      <Ionicons name="play-circle" size={18} color="white" />
                      <Text style={styles.startShiftText}>Start Shift</Text>
                    </TouchableOpacity>
                  )}

                  {/* Progress Steps - only if Service Delivery exists */}
                  {hasServiceDelivery && (
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
                        {!progress.checkedIn && !isCancelled && (
                          <TouchableOpacity 
                            style={styles.stepButton}
                            onPress={() => handleCheckIn(event)}
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
                        {!progress.dailyNoteCompleted && progress.checkedIn && !isCancelled && (
                          <TouchableOpacity 
                            style={styles.stepButton}
                            onPress={() => handleDailyNote(event)}
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
                            onPress={() => handleCheckOut(event)}
                          >
                            <Ionicons name="log-out" size={14} color="white" />
                            <Text style={styles.stepButtonText}>Check-Out</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                </>
              )}
            </View>
          );
        });
        })()}
      </ScrollView>
      <AlertComponent />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  startShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  startShiftText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
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
  // Replacement badge and info styles
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  replacementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  replacementBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9800',
  },
  replacementInfoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  replacementInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  replacementInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  replacementDetails: {
    gap: 4,
  },
  replacementDetailText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
  replacementDetailLabel: {
    fontWeight: '600',
  },
  replacementReason: {
    fontSize: 12,
    color: '#FB8C00',
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Cancelled alert styles
  cancelledAlert: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  cancelledAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  cancelledAlertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
  },
  cancelledAlertText: {
    fontSize: 13,
    color: '#D32F2F',
    lineHeight: 18,
    marginBottom: 6,
  },
  cancellationReason: {
    fontSize: 12,
    color: '#E53935',
    fontStyle: 'italic',
  },
  // Replaced notification styles (for original staff)
  replacedNotificationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  replacedNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  replacedNotificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
  },
  replacedNotificationBody: {
    gap: 4,
  },
  replacedNotificationText: {
    fontSize: 13,
    color: '#D32F2F',
    lineHeight: 18,
    marginBottom: 4,
  },
  replacedStaffText: {
    fontSize: 13,
    color: '#E53935',
    lineHeight: 18,
  },
  replacedStaffLabel: {
    fontWeight: '600',
  },
  replacedReasonText: {
    fontSize: 12,
    color: '#EF5350',
    fontStyle: 'italic',
    marginTop: 4,
  },
});