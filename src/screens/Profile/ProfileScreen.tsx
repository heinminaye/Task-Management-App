import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout, fetchUserProfile } from '../../store/slices/authSlice';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const loadUserProfile = async () => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          }
        },
      ]
    );
  };

  // Show loading indicator
  if (isLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to Load Profile</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button
          title="Try Again"
          onPress={loadUserProfile}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6366f1']}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#6366f1" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
      </View>

      {/* Account Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Full Name</Text>
          </View>
          <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Email Address</Text>
          </View>
          <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Ionicons name="shield-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Role</Text>
          </View>
          <View style={[
            styles.roleBadge,
            { backgroundColor: user?.isAdmin ? '#6366f1' : '#6b7280' }
          ]}>
            <Text style={styles.roleText}>
              {user?.isAdmin ? 'Administrator' : 'User'}
            </Text>
          </View>
        </View>

        <View style={styles.infoItemLast}>
          <View style={styles.infoLeft}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Account Status</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: user?.isConfirmed ? '#10b981' : '#f59e0b' }
          ]}>
            <Text style={styles.statusText}>
              {user?.isConfirmed ? 'Verified' : 'Pending Approval'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <Button
          title="Refresh Profile"
          onPress={loadUserProfile}
          variant="outline"
          style={styles.refreshButton}
        />
        <Button
          title="Edit Profile"
          onPress={() => Alert.alert('Info', 'Edit profile feature coming soon!')}
          variant="outline"
          style={styles.editButton}
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>

      {/* Debug Info - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>User ID: {user?.id || 'N/A'}</Text>
          <Text style={styles.debugText}>Has User: {user ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Error: {error || 'None'}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoItemLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  refreshButton: {
    borderColor: '#6366f1',
  },
  editButton: {
    borderColor: '#10b981',
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
  debugSection: {
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
});

export default ProfileScreen;