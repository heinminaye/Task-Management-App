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
import { useAppDispatch, useAppSelector } from '../../store/hook';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Picker } from '@react-native-picker/picker';
import { createTask } from '../../store/slices/taskSlice';
import { fetchProjects } from '../../store/slices/projectSlice';
import { TaskStatus } from '../../types/task';
import { Ionicons } from '@expo/vector-icons';

const CreateTaskScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { projects, isLoading: projectsLoading } = useAppSelector((state) => state.projects);
  const { isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 1 as 0 | 1 | 2,
    dueDate: '',
    assignedTo: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    projectId: '',
    dueDate: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    dispatch(fetchProjects());
  }, [dispatch]);

  const validateForm = () => {
    let valid = true;
    const errors = { title: '', projectId: '', dueDate: '' };

    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
      valid = false;
    }

    if (!formData.projectId) {
      errors.projectId = 'Please select a project';
      valid = false;
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
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
      const taskData = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo || undefined,
        status: TaskStatus.PENDING,
      };

      await dispatch(createTask(taskData)).unwrap();
      
      Alert.alert(
        'Success 🎉',
        'Task created successfully!',
        [
          {
            text: 'OK',
            onPress: () => resetForm(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to create task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
      priority: 1,
      dueDate: '',
      assignedTo: '',
    });
    setFormErrors({
      title: '',
      projectId: '',
      dueDate: '',
    });
  };

  const handleCreateProject = () => {
    navigation.navigate('CreateProject');
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Medium';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return '#10b981';
      case 1: return '#f59e0b';
      case 2: return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const isLoading = tasksLoading || projectsLoading;

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

          {/* No Projects Banner */}
          {projects.length === 0 && (
            <View style={styles.noProjectsBanner}>
              <View style={styles.bannerIcon}>
                <Ionicons name="warning" size={24} color="#f59e0b" />
              </View>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>No Projects Found</Text>
                <Text style={styles.bannerSubtitle}>
                  Create a project first to organize your tasks
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.createProjectButton}
                onPress={handleCreateProject}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.createProjectButtonText}>New Project</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Task Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Task Details</Text>
            </View>

            <Input
              label="Task Title *"
              placeholder="What needs to be done?"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              error={formErrors.title}
              icon="text"
            />

            <Input
              label="Description"
              placeholder="Add details about this task..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              icon="document-text-outline"
            />
          </View>

          {/* Project & Settings Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Task Settings</Text>
            </View>

            {/* Project Selection */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Project *</Text>
                <TouchableOpacity 
                  style={styles.createProjectLink}
                  onPress={handleCreateProject}
                >
                  <Ionicons name="add-circle" size={16} color="#6366f1" />
                  <Text style={styles.createProjectLinkText}>New Project</Text>
                </TouchableOpacity>
              </View>
              <View style={[
                styles.pickerWrapper,
                formErrors.projectId && styles.pickerError
              ]}>
                <Picker
                  selectedValue={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  enabled={!projectsLoading && projects.length > 0}
                >
                  <Picker.Item label="Select a project" value="" />
                  {projects.map((project: any) => (
                    <Picker.Item 
                      key={project.id} 
                      label={project.name} 
                      value={project.id} 
                    />
                  ))}
                </Picker>
              </View>
              {formErrors.projectId ? (
                <Text style={styles.errorText}>{formErrors.projectId}</Text>
              ) : null}
            </View>

            {/* Priority Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityButtons}>
                {[
                  { value: 0, label: 'Low', color: '#10b981' },
                  { value: 1, label: 'Medium', color: '#f59e0b' },
                  { value: 2, label: 'High', color: '#ef4444' },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority.value && [
                        styles.priorityButtonActive,
                        { backgroundColor: priority.color + '20', borderColor: priority.color }
                      ]
                    ]}
                    onPress={() => setFormData({ ...formData, priority: priority.value as 0 | 1 | 2 })}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                    <Text style={[
                      styles.priorityButtonText,
                      formData.priority === priority.value && { color: priority.color }
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Due Date */}
            <View style={styles.fieldContainer}>
              <Input
                label="Due Date *"
                placeholder="YYYY-MM-DD"
                value={formData.dueDate}
                onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                error={formErrors.dueDate}
                icon="calendar"
              />
            </View>

            {/* Assigned To */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Assign To (Optional)</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <Picker.Item label="Unassigned" value="" />
                  <Picker.Item label="Assign to myself" value={user?.id || ''} />
                </Picker>
              </View>
            </View>
          </View>

          {/* Quick Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="eye" size={20} color="#6366f1" />
              <Text style={styles.cardTitle}>Quick Preview</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Ionicons name="text" size={16} color="#64748b" />
                <Text style={styles.summaryLabel}>Title</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {formData.title || 'Not set'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="folder" size={16} color="#64748b" />
                <Text style={styles.summaryLabel}>Project</Text>
                <Text style={styles.summaryValue}>
                  {projects.find((p: any) => p.id === formData.projectId)?.name || 'Not selected'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="flag" size={16} color="#64748b" />
                <Text style={styles.summaryLabel}>Priority</Text>
                <View style={styles.priorityBadge}>
                  <View 
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(formData.priority) }
                    ]} 
                  />
                  <Text style={styles.summaryValue}>
                    {getPriorityLabel(formData.priority)}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar" size={16} color="#64748b" />
                <Text style={styles.summaryLabel}>Due Date</Text>
                <Text style={styles.summaryValue}>
                  {formData.dueDate || 'Not set'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Create Task"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.createButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            * Required fields
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
  noProjectsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#b45309',
  },
  createProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createProjectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  createProjectLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  createProjectLinkText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  },
});

export default CreateTaskScreen;