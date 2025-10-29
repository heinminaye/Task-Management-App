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
import { useAppDispatch, useAppSelector } from '../store/hook';
import Input from '../components/Input';
import Button from '../components/Button';
import { Picker } from '@react-native-picker/picker';
import { createTask } from '../store/slices/taskSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { TaskStatus } from '../types/task';
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

  useEffect(() => {
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
        'Success',
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
    navigation.navigate('CreateProjectBy');
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Medium';
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
        <View style={styles.content}>
          {/* Quick Project Creation */}
          {projects.length === 0 && (
            <View style={styles.noProjectsBanner}>
              <Ionicons name="warning-outline" size={24} color="#f59e0b" />
              <View style={styles.noProjectsText}>
                <Text style={styles.noProjectsTitle}>No Projects Found</Text>
                <Text style={styles.noProjectsSubtitle}>
                  You need to create a project first before adding tasks
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.createProjectButton}
                onPress={handleCreateProject}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.createProjectButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          )}

          <Input
            label="Task Title *"
            placeholder="Enter task title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            error={formErrors.title}
          />

          <Input
            label="Description"
            placeholder="Enter task description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {/* Project Selection */}
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.label}>Project *</Text>
              <TouchableOpacity 
                style={styles.createProjectLink}
                onPress={handleCreateProject}
              >
                <Ionicons name="add" size={16} color="#6366f1" />
                <Text style={styles.createProjectLinkText}>New Project</Text>
              </TouchableOpacity>
            </View>
            <View style={[
              styles.picker,
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
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <Picker.Item label="Low" value={0} />
                <Picker.Item label="Medium" value={1} />
                <Picker.Item label="High" value={2} />
              </Picker>
            </View>
          </View>

          {/* Due Date */}
          <Input
            label="Due Date *"
            placeholder="YYYY-MM-DD"
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            error={formErrors.dueDate}
          />

          {/* Assigned To (Optional) */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Assign To (Optional)</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <Picker.Item label="Unassigned" value="" />
                <Picker.Item label="Myself" value={user?.id || ''} />
              </Picker>
            </View>
          </View>

          <View style={styles.formSummary}>
            <Text style={styles.summaryTitle}>Task Summary:</Text>
            <Text style={styles.summaryText}>
              • Title: {formData.title || 'Not set'}
            </Text>
            <Text style={styles.summaryText}>
              • Project: {projects.find((p: any) => p.id === formData.projectId)?.name || 'Not selected'}
            </Text>
            <Text style={styles.summaryText}>
              • Priority: {getPriorityLabel(formData.priority)}
            </Text>
            <Text style={styles.summaryText}>
              • Due Date: {formData.dueDate || 'Not set'}
            </Text>
          </View>

          <Button
            title="Create Task"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />

          <Text style={styles.note}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noProjectsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  noProjectsText: {
    flex: 1,
  },
  noProjectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 2,
  },
  noProjectsSubtitle: {
    fontSize: 12,
    color: '#b45309',
  },
  createProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createProjectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  formSummary: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  button: {
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CreateTaskScreen;
