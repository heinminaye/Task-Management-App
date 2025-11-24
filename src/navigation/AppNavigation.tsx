import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ProjectListScreen from "../screens/Project/ProjectListScreen";
import ProjectDetailsScreen from "../screens/Project/ProjectDetailsScreen";
import TaskListScreen from "../screens/Task/TaskListScreen";
import TaskDetailsScreen from "../screens/Task/TaskDetailsScreen";
import CreateTaskScreen from "../screens/Task/CreateTaskScreen";
import CreateProjectScreen from "../screens/Project/CreateProjectScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import {
  RootStackParamList,
  MainTabParamList,
  TasksStackParamList,
  ProjectsStackParamList,
  CreateStackParamList,
} from "../types/navigation";
import UserManagementScreen from "../screens/User/UserManagementScreen";

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const TasksStack = createStackNavigator<TasksStackParamList>();
const ProjectsStack = createStackNavigator<ProjectsStackParamList>();
const CreateStack = createStackNavigator<CreateStackParamList>();

// Tasks Stack Navigator
function TasksStackNavigator() {
  return (
    <TasksStack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerBackTitle: "Back",
        headerTitleAlign: "center",
      }}
    >
      <TasksStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: "My Tasks",
          headerLeft: () => null,
        }}
      />
      <TasksStack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{
          title: "Task Details",
        }}
      />
      <TasksStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: "Create Task",
        }}
      />
    </TasksStack.Navigator>
  );
}

// Projects Stack Navigator
function ProjectsStackNavigator() {
  return (
    <ProjectsStack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f1f5f9",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerBackTitle: "Back",
        headerTitleAlign: "center",
      }}
    >
      <ProjectsStack.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{
          title: "Projects",
          headerLeft: () => null,
        }}
      />
      <ProjectsStack.Screen
        name="ProjectDetails"
        component={ProjectDetailsScreen}
        options={{
          title: "Project Details",
        }}
      />
      <ProjectsStack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{
          title: "Create Project",
        }}
      />
    </ProjectsStack.Navigator>
  );
}

// Admin Stack Navigator with loading state
function AdminStackNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen 
        name="UserManagement" 
        component={UserManagementScreen}
        options={{
          headerShown: false
        }}
      />
    </RootStack.Navigator>
  );
}

function MainTabs() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.isAdmin;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "Tasks") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Admin") {
            iconName = focused ? "shield" : "shield-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#64748b",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Projects"
        component={ProjectsStackNavigator}
        options={{
          title: "Projects",
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStackNavigator}
        options={{
          title: "Tasks",
        }}
      />
      {/* Conditionally show Admin tab only for admin users */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStackNavigator}
          options={{
            title: "Admin",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "shield" : "shield-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!accessToken ? (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}