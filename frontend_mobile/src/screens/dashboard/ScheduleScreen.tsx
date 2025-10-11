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
  status: 'upcoming' | 'completed' | 'in-progress';
  notes?: string;
}

const mockSchedule: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    patientId: 'P001',
    address: '123 Main St, Downtown',
    time: '09:00 AM - 11:00 AM',
    date: '2024-10-10',
    status: 'upcoming',
    notes: 'Regular checkup and medication review1',
  },
  {
    id: '2',
    name: 'Mary Johnson',
    patientId: 'P002',
    address: '456 Oak Ave, Uptown',
    time: '02:00 PM - 04:00 PM',
    date: '2024-10-10',
    status: 'in-progress',
    notes: 'Physical therapy session',
  },
  {
    id: '3',
    name: 'Robert Wilson',
    patientId: 'P003',
    address: '789 Pine St, Midtown',
    time: '05:00 PM - 06:30 PM',
    date: '2024-10-10',
    status: 'upcoming',
    notes: 'Daily care assistance',
  },
];

export default function ScheduleScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState(mockSchedule);

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
    // Navigate to check-in screen
    router.push('/check-in');
  };

  const handleCheckOut = (patient: Patient) => {
    // Navigate to check-out screen
    router.push('/check-out');
  };

  const handleDailyNote = (patient: Patient) => {
    // Navigate to daily note screen
    router.push('/(tabs)/daily-note');
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
      default:
        return 'Upcoming';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <Text style={styles.headerDate}>October 10, 2024</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {schedule.map((patient) => (
          <TouchableOpacity key={patient.id} style={styles.patientCard}>
            <View style={styles.cardHeader}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientId}>ID: {patient.patientId}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) }]}>
                <Ionicons
                  name={getStatusIcon(patient.status) as any}
                  size={12}
                  color="white"
                />
                <Text style={styles.statusText}>{formatStatus(patient.status)}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{patient.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{patient.address}</Text>
              </View>
              {patient.notes && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{patient.notes}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCheckIn(patient)}>
                <Ionicons name="log-in-outline" size={18} color="#4caf50" />
                <Text style={[styles.actionText, { color: '#4caf50' }]}>Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCheckOut(patient)}>
                <Ionicons name="log-out-outline" size={18} color="#f44336" />
                <Text style={[styles.actionText, { color: '#f44336' }]}>Check Out</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDailyNote(patient)}>
                <Ionicons name="document-text-outline" size={18} color="#2196F3" />
                <Text style={styles.actionText}>Daily Note</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDetails(patient)}>
                <Ionicons name="information-circle-outline" size={18} color="#2196F3" />
                <Text style={styles.actionText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={() => handleCancelSchedule(patient)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#f44336" />
                <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
});