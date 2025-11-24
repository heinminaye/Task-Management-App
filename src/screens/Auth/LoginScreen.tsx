import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { login, clearError, clearPendingConfirmation } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { RootStackParamList } from '../../types/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, pendingConfirmationEmail } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearPendingConfirmation());
    
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  // Handle navigation to confirmation when pending confirmation is detected
  useEffect(() => {
    if (pendingConfirmationEmail) {
      navigation.navigate('Register', { 
        initialStep: 1, 
        email: pendingConfirmationEmail 
      });
    }
  }, [pendingConfirmationEmail]);

  const validateForm = () => {
    let valid = true;
    const errors = { email: '', password: '' };

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch(login(formData));
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register', { 
        initialStep: 0, 
        email: "" 
      });
  };

  const isConfirmationError = error?.includes('Account pending admin confirmation');

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.logo,
                  {
                    transform: [
                      {
                        rotate: logoRotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="rocket" size={32} color="#6366f1" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.appName}>TaskFlow</Text>
              <Text style={styles.appTagline}>Manage Projects Efficiently</Text>
            </Animated.View>
          </View>

          {/* Form Section */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue your work</Text>
            </View>

            {error && (
              <View style={[
                styles.errorBanner,
                isConfirmationError && styles.warningBanner
              ]}>
                <Ionicons 
                  name={isConfirmationError ? "time-outline" : "warning-outline"} 
                  size={20} 
                  color={isConfirmationError ? "#f59e0b" : "#dc2626"} 
                />
                <View style={styles.errorContent}>
                  <Text style={[
                    styles.errorBannerText,
                    isConfirmationError && styles.warningBannerText
                  ]}>
                    {error}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  // Clear email error when user starts typing
                  if (formErrors.email) {
                    setFormErrors({ ...formErrors, email: '' });
                  }
                }}
                error={formErrors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                icon="mail-outline"
                containerStyle={styles.input}
                autoComplete="email"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  // Clear password error when user starts typing
                  if (formErrors.password) {
                    setFormErrors({ ...formErrors, password: '' });
                  }
                }}
                error={formErrors.password}
                isPassword={true}
                autoCapitalize="none"
                icon="lock-closed-outline"
                containerStyle={styles.input}
                autoComplete="password"
              />
            </View>

            <Button
              title="Sign In"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.primaryButton}
              variant="primary"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleCreateAccount}>
                <Text style={styles.link}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: height * 0.35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 15,
  },
  primaryButton: {
    marginBottom: 24,
    width: '100%',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 10,
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  link: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
  },
  errorContent: {
    flex: 1,
  },
  errorBannerText: {
    color: '#dc2626',
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  warningBannerText: {
    color: '#92400e',
  },
  contactSupportText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;