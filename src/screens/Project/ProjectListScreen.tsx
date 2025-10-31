import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { fetchProjects, setCurrentProject } from '../../store/slices/projectSlice';
import { Project } from '../../types/project';
import { Ionicons } from '@expo/vector-icons';

const ProjectListScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      await dispatch(fetchProjects()).unwrap();
    } catch (error) {
      console.log('Failed to load projects');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleProjectPress = (project: Project) => {
    dispatch(setCurrentProject(null));
    navigation.navigate('ProjectDetails', { projectId: project.id });
  };

  const handleCreateProject = () => {
    navigation.navigate('CreateProject');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#6b7280';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => handleProjectPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <View style={[
            styles.projectIcon,
            { backgroundColor: item.isActive ? '#e0e7ff' : '#f1f5f9' }
          ]}>
            <Ionicons 
              name="folder" 
              size={20} 
              color={item.isActive ? '#6366f1' : '#64748b'} 
            />
          </View>
          <View style={styles.projectTextContainer}>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {item.description || 'No description provided'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </View>

       <Text style={styles.createdDate}>
          Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
      </Text>
      
      <View style={styles.projectFooter}>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {item.members.length} member{item.members.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getStatusColor(item.isActive) }
              ]} 
            />
            <Text style={styles.statusText}>
              {getStatusText(item.isActive)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content"/>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.subtitle}>
            {projects.length} active project{projects.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateProject}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="folder-open-outline" size={80} color="#e2e8f0" />
            </View>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first project to start collaborating with your team
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={handleCreateProject}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.emptyButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  projectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectTextContainer: {
    flex: 1,
    gap: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  projectFooter: {
    marginTop:10,
    gap: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  createdDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 8,
    gap: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectListScreen;