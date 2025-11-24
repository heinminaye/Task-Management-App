import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { confirmUser, getUsers } from '../../store/slices/adminSlice';
import { socketService } from '../../services/socketService';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Input from '../../components/Input';

const { width } = Dimensions.get('window');

interface User {
  _id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  lastSeen?: string;
}

const UserManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, loading, error } = useSelector((state: RootState) => state.admin);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'online'>('all');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    if (user?.isAdmin) {
      loadInitialData();
      setupSocketListeners();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && initialLoading) {
      setInitialLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const loadInitialData = async () => {
    try {
      await dispatch(getUsers()).unwrap();
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const setupSocketListeners = () => {
    socketService.onUserOnline((userId: string) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    socketService.onUserOffline((userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socketService.removeListener('user:online');
      socketService.removeListener('user:offline');
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getUsers()).unwrap();
    } catch (error) {
      console.error('Failed to refresh users:', error);
    }
    setRefreshing(false);
  };

  const handleConfirmUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Confirm User',
      `Are you sure you want to confirm ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              await dispatch(confirmUser(userId)).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm user');
            }
          },
        },
      ]
    );
  };

  const handleUserAction = (userItem: User) => {
    Alert.alert(
      'User Actions',
      `Choose action for ${userItem.name}`
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !user.isConfirmed && user.isActive :
      filter === 'confirmed' ? user.isConfirmed :
      filter === 'online' ? onlineUsers.has(user._id) : true;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (user: User) => {
    if (!user.isActive) return '#ef4444';
    if (onlineUsers.has(user._id)) return '#10b981';
    if (user.isConfirmed) return '#3b82f6';
    return '#f59e0b';
  };

  const getStatusText = (user: User) => {
    if (!user.isActive) return 'Inactive';
    if (onlineUsers.has(user._id)) return 'Online';
    if (user.isConfirmed) return 'Confirmed';
    return 'Pending';
  };

  const getStatusIcon = (user: User) => {
    if (!user.isActive) return 'close-circle';
    if (onlineUsers.has(user._id)) return 'wifi';
    if (user.isConfirmed) return 'checkmark-circle';
    return 'time';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Compact Stats Component
  const StatsPills = () => (
    <View style={styles.statsPills}>
      <View style={styles.statPill}>
        <View style={[styles.statDot, { backgroundColor: '#6366f1' }]} />
        <Text style={styles.statPillText}>{users.length}</Text>
      </View>
      <View style={styles.statPill}>
        <View style={[styles.statDot, { backgroundColor: '#f59e0b' }]} />
        <Text style={styles.statPillText}>
          {users.filter(u => !u.isConfirmed && u.isActive).length}
        </Text>
      </View>
      <View style={styles.statPill}>
        <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
        <Text style={styles.statPillText}>{onlineUsers.size}</Text>
      </View>
    </View>
  );

  // Loading State
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (!user?.isAdmin) {
    return (
      <View style={styles.centered}>
        <Ionicons name="shield" size={64} color="#6b7280" />
        <Text style={styles.accessDeniedText}>Admin Access Required</Text>
        <Text style={styles.accessDeniedSubtext}>
          You need administrator privileges to access this page.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerMain}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
              {filteredUsers.length} of {users.length} users
            </Text>
          </View>
          <StatsPills />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Input
              label=""
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="search"
              containerStyle={styles.searchInputContainer}
              style={styles.searchInputField}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Enhanced Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {[
            { key: 'all', label: 'All', icon: 'people' },
            { key: 'online', label: 'Online', icon: 'wifi' },
            { key: 'pending', label: 'Pending', icon: 'time' },
            { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
          ].map((filterType) => (
            <TouchableOpacity
              key={filterType.key}
              style={[
                styles.filterChip,
                filter === filterType.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(filterType.key as any)}
            >
              <View style={styles.filterChipContent}>
                <Ionicons 
                  name={filterType.icon as any} 
                  size={14} 
                  color={filter === filterType.key ? '#ffffff' : '#6366f1'} 
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filter === filterType.key && styles.filterChipTextActive,
                  ]}
                >
                  {filterType.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Users List */}
      <Animated.ScrollView
        style={[styles.usersList, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.usersListContent}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingStateText}>Updating users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "people-outline"} 
              size={80} 
              color="#e2e8f0" 
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No users found' : 'No users available'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms or filters' 
                : 'Users will appear here once they register'
              }
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                style={styles.clearSearchButtonLarge}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredUsers.map((userItem) => (
            <Animated.View 
              key={userItem._id} 
              style={[
                styles.userCard,
                {
                  opacity: fadeAnim,
                }
              ]}
            >
              {/* User Avatar */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <View 
                    style={[
                      styles.userAvatar,
                      { backgroundColor: getStatusColor(userItem) + '20' }
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: getStatusColor(userItem) }]}>
                      {getInitials(userItem.name)}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(userItem) }
                    ]} 
                  />
                </View>
              </View>
              
              {/* User Details */}
              <View style={styles.userDetails}>
                <View style={styles.nameSection}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userItem.name}
                  </Text>
                  {onlineUsers.has(userItem._id) && (
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlinePulse} />
                      <Text style={styles.onlineText}>LIVE</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userItem.email}
                </Text>
                
                <View style={styles.metaInfo}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(userItem) + '15' }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(userItem) as any} 
                      size={12} 
                      color={getStatusColor(userItem)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(userItem) }]}>
                      {getStatusText(userItem)}
                    </Text>
                  </View>
                  
                  <View style={styles.lastSeen}>
                    <Ionicons name="time-outline" size={10} color="#94a3b8" />
                    <Text style={styles.lastSeenText}>
                      {userItem.lastSeen ? getTimeAgo(userItem.lastSeen) : 'Never'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsSection}>
                {!userItem.isConfirmed && userItem.isActive && (
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleConfirmUser(userItem._id, userItem.name)}
                  >
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => handleUserAction(userItem)}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </Animated.ScrollView>
    </View>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingStateText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statsPills: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  searchSection: {
    marginBottom: 14,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  searchInputField: {
    fontSize: 16,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
    padding: 4,
  },
  filterContainer: {
    maxHeight: 40,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  usersList: {
    flex: 1,
  },
  usersListContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  clearSearchButtonLarge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  avatarSection: {
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8fafc',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  onlineBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlinePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  lastSeen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lastSeenText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  menuButton: {
    padding: 4,
  },
});

export default UserManagementScreen;