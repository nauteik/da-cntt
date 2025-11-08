import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../store/authStore';
import { useCustomAlert } from '../../components/common/CustomAlert';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const { state: authState, logout: authLogout } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  
  // Get user data from auth context
  const currentUser = authState.user;
  const userInfo = {
    name: currentUser?.name || 'N/A',
    employeeId: currentUser?.staffId || currentUser?.id || 'N/A',
    email: currentUser?.email || 'N/A',
    department: 'Patient Care', // TODO: Get from backend
    role: currentUser?.role || 'N/A',
    phone: currentUser?.phone || 'N/A',
  };

  const handleLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Clear auth state
            authLogout();
            // Navigate back to login screen
            router.replace('../login');
          },
        },
      ],
      'log-out',
      '#f44336'
    );
  };

  const handleChangePassword = () => {
    showAlert(
      'Change Password', 
      'This feature will redirect to the password change page.',
      [{ text: 'OK', style: 'default' }],
      'key',
      '#2196F3'
    );
  };

  const handleSyncData = () => {
    showAlert(
      'Sync Data', 
      'Data synchronization started...',
      [{ text: 'OK', style: 'default' }],
      'sync',
      '#4CAF50'
    );
  };

  const handleContactSupport = () => {
    showAlert(
      'Support', 
      'Contacting support team...',
      [{ text: 'OK', style: 'default' }],
      'help-circle',
      '#2196F3'
    );
  };

  const renderUserInfoItem = (icon: string, label: string, value: string) => (
    <View style={styles.infoItem}>
      <View style={styles.infoItemLeft}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={22}
          color={danger ? '#f44336' : '#666'}
        />
        <View style={styles.settingItemText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent ? (
        rightComponent
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#2196F3" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userInfo.name}</Text>
              <Text style={styles.profileRole}>{userInfo.role}</Text>
              <Text style={styles.profileDepartment}>{userInfo.department}</Text>
            </View>
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          {renderUserInfoItem('card-outline', 'Employee ID', userInfo.employeeId)}
          {renderUserInfoItem('mail-outline', 'Email', userInfo.email)}
          {renderUserInfoItem('call-outline', 'Phone', userInfo.phone)}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {renderSettingItem(
            'notifications-outline',
            'Push Notifications',
            'Receive alerts for new schedules',
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ddd', true: '#2196F3' }}
            />
          )}
          {renderSettingItem(
            'sync-outline',
            'Auto Sync',
            'Automatically sync data when connected',
            undefined,
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#ddd', true: '#2196F3' }}
            />
          )}
          {renderSettingItem(
            'refresh-outline',
            'Sync Data Now',
            'Manually sync your data',
            handleSyncData
          )}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem(
            'key-outline',
            'Change Password',
            'Update your login password',
            handleChangePassword
          )}
          {renderSettingItem(
            'help-circle-outline',
            'Help & Support',
            'Get help or contact support',
            handleContactSupport
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem('information-circle-outline', 'App Version', '1.0.0')}
          {renderSettingItem('business-outline', 'Company', 'Blue Angels Care')}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          {renderSettingItem(
            'log-out-outline',
            'Logout',
            'Sign out from your account',
            handleLogout,
            undefined,
            true
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Blue Angels Care
          </Text>
          <Text style={styles.footerText}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>

      {/* Alert Component */}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 2,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    maxWidth: '50%',
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dangerText: {
    color: '#f44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});