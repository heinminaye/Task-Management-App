import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { SocketProvider } from "./src/context/SocketContext";
import { checkAuthToken, fetchUserProfile } from "./src/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./src/store/hook";
import { SafeAreaProvider } from "react-native-safe-area-context";
function AuthChecker({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(checkAuthToken());
  }, [dispatch]);
  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, accessToken, user]);

  return <>{children}</>;
}
export default function App() {
  return (
      <SafeAreaView style={styles.safeContainer}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthChecker>
              <SocketProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </SocketProvider>
            </AuthChecker>
          </PersistGate>
        </Provider>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#ffff",
  },
});
