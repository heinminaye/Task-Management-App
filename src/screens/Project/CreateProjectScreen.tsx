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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { createProject } from '../../store/slices/projectSlice';
import { Ionicons } from '@expo/vector-icons';

const CreateProjectScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { isLoading, error } = useAppSelector((state: RootState) => state.projects);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[], // Array of user IDs
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
  });
  const [memberEmail, setMemberEmail] = useState('');

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
        members: formData.members, // Include selected members
      };

      await dispatch(createProject(projectData)).unwrap();
      
      Alert.alert(
        'Success',
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
    if (memberEmail.trim() && !formData.members.includes(memberEmail.trim())) {
      setFormData({
        ...formData,
        members: [...formData.members, memberEmail.trim()],
      });
      setMemberEmail('');
    }
  };

  const removeMember = (email: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter(member => member !== email),
    });
  };

  const handleMemberEmailSubmit = () => {
    if (memberEmail.trim()) {
      addMember();
    }
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
        <View style={styles.content}>

          <Input
            label="Project Name *"
            placeholder="Enter project name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            error={formErrors.name}
            maxLength={50}
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
          />

          {/* Team Members Section */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <Text style={styles.sectionSubtitle}>
              Add team members by their email addresses
            </Text>

            {/* Current User (Auto-added) */}
            <View style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.memberName}>You ({user?.name})</Text>
                  <Text style={styles.memberEmail}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.creatorBadge}>
                <Text style={styles.creatorText}>Creator</Text>
              </View>
            </View>

            {/* Add Member Input */}
            <View style={styles.addMemberContainer}>
              <Input
                label="Add Team Member"
                placeholder="Enter member email"
                value={memberEmail}
                onChangeText={setMemberEmail}
                onSubmitEditing={handleMemberEmailSubmit}
                returnKeyType="done"
                style={styles.memberInput}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !memberEmail.trim() && styles.addButtonDisabled
                ]}
                onPress={addMember}
                disabled={!memberEmail.trim()}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Members List */}
            {formData.members.length > 0 && (
              <View style={styles.membersList}>
                <Text style={styles.membersListTitle}>Added Members:</Text>
                {formData.members.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={16} color="#6b7280" />
                      </View>
                      <Text style={styles.memberEmail}>{member}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMember(member)}
                    >
                      <Ionicons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Project Summary */}
          <View style={styles.formSummary}>
            <Text style={styles.summaryTitle}>Project Summary:</Text>
            <Text style={styles.summaryText}>
              • Name: {formData.name || 'Not set'}
            </Text>
            <Text style={styles.summaryText}>
              • Team Size: {formData.members.length + 1} members
            </Text>
            <Text style={styles.summaryText}>
              • Description: {formData.description ? `${formData.description.substring(0, 50)}${formData.description.length > 50 ? '...' : ''}` : 'Not set'}
            </Text>
          </View>

          <Button
            title="Create Project"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />

          <Text style={styles.note}>
            * Required fields. You'll be automatically added as the project creator.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  memberInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    minWidth: 52,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  membersList: {
    marginTop: 8,
  },
  membersListTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  memberEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  creatorBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  creatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
  },
  removeButton: {
    padding: 4,
  },
  formSummary: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  note: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default CreateProjectScreen;