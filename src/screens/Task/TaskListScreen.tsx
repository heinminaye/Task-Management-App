import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { fetchUserTasks, setCurrentTask } from "../../store/slices/taskSlice";
import { Task, TaskStatus } from "../../types/task";
import { Ionicons } from "@expo/vector-icons";

const TaskListScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      await dispatch(fetchUserTasks()).unwrap();
    } catch (error) {
      Alert.alert("Error", "Failed to load tasks");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    dispatch(setCurrentTask(task));
    navigation.navigate("TaskDetails", { taskId: task.id });
  };

  const handleCreateTask = () => {
    navigation.navigate("CreateTask");
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return "#ef4444"; // High
      case 1:
        return "#f59e0b"; // Medium
      case 0:
        return "#10b981"; // Low
      default:
        return "#6b7280";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 2:
        return "High";
      case 1:
        return "Medium";
      case 0:
        return "Low";
      default:
        return "Low";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "#10b981";
      case TaskStatus.IN_PROGRESS:
        return "#3b82f6";
      case TaskStatus.PENDING:
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "Completed";
      case TaskStatus.IN_PROGRESS:
        return "In Progress";
      case TaskStatus.PENDING:
        return "Pending";
      default:
        return status;
    }
  };

  const filteredTasks = tasks.filter(
    (task) => filter === "all" || task.status === filter
  );

  const FilterButton = ({
    status,
    label,
    count,
  }: {
    status: "all" | TaskStatus;
    label: string;
    count: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === status && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(status)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === status && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.filterCount,
          filter === status && styles.filterCountActive,
        ]}
      >
        <Text
          style={[
            styles.filterCountText,
            filter === status && styles.filterCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <View
            style={[
              styles.taskIcon,
              { backgroundColor: getStatusColor(item.status) + "15" },
            ]}
          >
            <Ionicons
              name={
                item.status === TaskStatus.COMPLETED
                  ? "checkmark-circle"
                  : item.status === TaskStatus.IN_PROGRESS
                  ? "time"
                  : "hourglass"
              }
              size={20}
              color={getStatusColor(item.status)}
            />
          </View>
          <View style={styles.taskTextContainer}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) },
          ]}
        >
          <Text style={styles.priorityText}>
            {getPriorityText(item.priority)}
          </Text>
        </View>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="calendar-outline" size={14} color="#64748b" />
        <Text style={styles.metaText}>
          {item.dueDate
            ? new Date(item.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "No due date"}
        </Text>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>
              {item.assignedTo ? "Assigned" : "Unassigned"}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.subtitle}>
            {filteredTasks.length} {filter === "all" ? "total" : filter} task
            {filteredTasks.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTask}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton status="all" label="All" count={tasks.length} />
        <FilterButton
          status={TaskStatus.PENDING}
          label="Pending"
          count={tasks.filter((t) => t.status === TaskStatus.PENDING).length}
        />
        <FilterButton
          status={TaskStatus.IN_PROGRESS}
          label="In Progress"
          count={
            tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
          }
        />
        <FilterButton
          status={TaskStatus.COMPLETED}
          label="Completed"
          count={tasks.filter((t) => t.status === TaskStatus.COMPLETED).length}
        />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={20} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={80}
                color="#e2e8f0"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === "all"
                ? "Create your first task to get started"
                : `You don't have any ${filter.toLowerCase()} tasks`}
            </Text>
            {filter === "all" && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateTask}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.emptyButtonText}>Create Task</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  filterCount: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  filterCountTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  taskTextContainer: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 22,
  },
  taskDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    marginBottom: 16,
    gap: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TaskListScreen;
