import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { createProject } from '../../store/slices/projectSlice';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserProfile } from '../../store/slices/authSlice';

const CreateProjectScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { isLoading, error } = useAppSelector((state: RootState) => state.projects);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[],
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);


  const validateForm = () => {
    let valid = true;
    const errors = { name: '', description: '' };

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
      valid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Project name must be at least 3 characters';
      valid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
      valid = false;
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: formData.members,
      };

      await dispatch(createProject(projectData)).unwrap();
      
      Alert.alert(
        'Success 🎉',
        'Project created successfully!',
        [
          {
            text: 'OK',
            onPress: () => resetForm(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to create project');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      members: [],
    });
    setFormErrors({
      name: '',
      description: '',
    });
    setMemberEmail('');
  };

  const addMember = () => {
    const email = memberEmail.trim().toLowerCase();
    
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (email === user?.email?.toLowerCase()) {
      Alert.alert('Notice', 'You are automatically added as the project creator');
      return;
    }

    if (!formData.members.includes(email)) {
      setFormData({
        ...formData,
        members: [...formData.members, email],
      });
      setMemberEmail('');
    } else {
      Alert.alert('Duplicate', 'This member is already added to the project');
    }
  };

  const removeMember = (email: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter(member => member !== email),
    });
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const index = email.length % colors.length;
    return colors[index];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* Project Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Project Details</Text>
            </View>
            
            <Input
              label="Project Name *"
              placeholder="Enter project name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={formErrors.name}
              maxLength={50}
              icon="business"
            />

            <Input
              label="Description *"
              placeholder="Describe what this project is about..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              error={formErrors.description}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              maxLength={500}
              icon="document-text-outline"
            />
          </View>

          {/* Team Members Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Team Members</Text>
              <View style={styles.memberCount}>
                <Text style={styles.memberCountText}>{formData.members.length + 1}</Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>
              Add team members by their email addresses
            </Text>

            {/* Project Creator */}
            <View style={styles.creatorCard}>
              <View style={styles.memberInfo}>
                <View 
                  style={[
                    styles.avatar,
                    { backgroundColor: getAvatarColor(user?.email || '') }
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user?.email || '')}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{user?.name}</Text>
                  <Text style={styles.memberEmail}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.creatorBadge}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.creatorText}>Creator</Text>
              </View>
            </View>

            {/* Add Member Section */}
            <View style={styles.addMemberSection}>
              <Text style={styles.addMemberLabel}>Add Team Member</Text>
              <View style={styles.addMemberContainer}>
                <Input
                  label=""
                  placeholder="Enter member email"
                  value={memberEmail}
                  onChangeText={setMemberEmail}
                  onSubmitEditing={addMember}
                  returnKeyType="done"
                  containerStyle={styles.memberInputContainer}
                  style={styles.memberInput}
                  icon="mail-outline"
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !memberEmail.trim() && styles.addButtonDisabled
                  ]}
                  onPress={addMember}
                  disabled={!memberEmail.trim()}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Members List */}
            {formData.members.length > 0 && (
              <View style={styles.membersList}>
                <Text style={styles.membersListTitle}>Team Members ({formData.members.length})</Text>
                {formData.members.map((member, index) => (
                  <View key={index} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <View 
                        style={[
                          styles.avatar,
                          { backgroundColor: getAvatarColor(member) }
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {getInitials(member)}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberEmail}>{member}</Text>
                        <Text style={styles.memberRole}>Member</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMember(member)}
                    >
                      <Ionicons name="close-circle" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Quick Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="clipboard" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Quick Summary</Text>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Ionicons name="text" size={16} color="#6366f1" />
                <Text style={styles.summaryLabel}>Name</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {formData.name || 'Not set'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="people" size={16} color="#6366f1" />
                <Text style={styles.summaryLabel}>Team Size</Text>
                <Text style={styles.summaryValue}>
                  {formData.members.length + 1} members
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Create Project"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.createButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Reset Form</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            * Required fields. You'll be automatically added as the project creator.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  memberCount: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  memberCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  creatorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  memberRole: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  creatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  addMemberSection: {
    marginBottom: 8,
  },
  addMemberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  memberInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  memberInput: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    minWidth: 45,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  membersList: {
    marginTop: 16,
  },
  membersListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  removeButton: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 'auto',
  },
  summaryValue: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CreateProjectScreen;