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
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { register, clearError, clearPendingConfirmation } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { RootStackParamList } from '../../types/navigation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, pendingConfirmationEmail } = useSelector((state: RootState) => state.auth);

  // Get initial step and email from route params
  const initialStep = route.params?.initialStep || 0;
  const initialEmail = route.params?.email || '';

  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(initialStep)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepTransitionAnim = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(clearError());
    
    // Only clear pending confirmation if we're starting from step 0
    if (initialStep === 0) {
      dispatch(clearPendingConfirmation());
    }
    
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
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, initialStep]);

  // Handle step progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 800,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handle when registration is successful OR when coming from login with unconfirmed account
  useEffect(() => {
  if (pendingConfirmationEmail) {
    Animated.timing(stepTransitionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(1);
      stepTransitionAnim.setValue(0);
    });
  }
}, [pendingConfirmationEmail]);

  // Pulsing animation for pending state
  useEffect(() => {
    if (currentStep === 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Success icon animation
      Animated.spring(successScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep]);

  // Handle back button press
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Clear pending confirmation when leaving the screen
      dispatch(clearPendingConfirmation());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const validateForm = () => {
    let valid = true;
    const errors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      valid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Include uppercase, lowercase & numbers';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log('Submitting registration for:', formData.email);
      const result = await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }));
      
      if (register.fulfilled.match(result)) {
        console.log('Registration successful, moving to confirmation');
      }
      
      if (register.rejected.match(result)) {
        console.log('Registration failed:', result.payload);
      }
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearPendingConfirmation());
    navigation.navigate('Login');
  };

  const handleTryLogin = () => {
    dispatch(clearPendingConfirmation());
    navigation.navigate('Login');
  };

  const steps = [
    { number: 1, title: 'Account Details', description: 'Enter your information' },
    { number: 2, title: 'Confirmation', description: 'Wait for approval' }
  ];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View 
            style={[
              styles.stepContent,
              {
                opacity: stepTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateX: stepTransitionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.inputGroup}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                error={formErrors.name}
                icon="person-outline"
                containerStyle={styles.input}
                autoComplete="name"
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
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
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                error={formErrors.password}
                isPassword={true}
                autoCapitalize="none"
                icon="lock-closed-outline"
                containerStyle={styles.input}
                autoComplete="password-new"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                }}
                error={formErrors.confirmPassword}
                isPassword={true}
                autoCapitalize="none"
                icon="lock-closed-outline"
                containerStyle={styles.input}
                autoComplete="password-new"
              />
            </View>

            <View style={styles.adminNote}>
              <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
              <Text style={styles.adminNoteText}>
                Your account requires admin confirmation before you can login
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.primaryButton}
              variant="primary"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      
      case 1:
        return (
          <Animated.View 
            style={[
              styles.stepContent,
              {
                opacity: stepTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateX: stepTransitionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 50],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.confirmationContainer}>
              <Animated.View 
                style={[
                  styles.successIcon,
                  {
                    transform: [
                      { scale: successScale },
                      { scale: pulseAnim },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.successGradient}
                >
                  <Ionicons name="checkmark-done" size={50} color="#ffffff" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.confirmationTitle}>
                {initialStep === 1 ? 'Account Pending Approval' : 'Account Created Successfully!'}
              </Text>
              <Text style={styles.confirmationSubtitle}>
                {initialStep === 1 
                  ? 'Your account is waiting for admin confirmation. You tried to login but your account is not yet approved.'
                  : 'Your account has been created and is pending admin approval'
                }
              </Text>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timelineStep}>
                  <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      {initialStep === 1 ? 'Account Exists' : 'Account Created'}
                    </Text>
                    <Text style={styles.timelineDescription}>
                      {initialStep === 1 
                        ? 'Your account information is saved' 
                        : 'Your information has been saved'
                      }
                    </Text>
                  </View>
                </View>
                
                <View style={styles.timelineConnector} />
                
                <View style={styles.timelineStep}>
                  <Animated.View 
                    style={[
                      styles.timelineDot,
                      styles.timelineDotPending,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <Ionicons name="time" size={16} color="#ffffff" />
                  </Animated.View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Admin Approval</Text>
                    <Text style={styles.timelineDescription}>Waiting for administrator confirmation</Text>
                    <Text style={styles.timelineTime}>Usually within 24-48 hours</Text>
                  </View>
                </View>
                
                <View style={styles.timelineConnector} />
                
                <View style={styles.timelineStep}>
                  <View style={[styles.timelineDot, styles.timelineDotUpcoming]}>
                    <Text style={styles.timelineDotText}>3</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Ready to Use</Text>
                    <Text style={styles.timelineDescription}>Start managing your projects</Text>
                  </View>
                </View>
              </View>

              <View style={styles.expectationBox}>
                <Ionicons name="notifications-outline" size={24} color="#6366f1" />
                <View style={styles.expectationContent}>
                  <Text style={styles.expectationTitle}>What to expect next?</Text>
                  <View style={styles.expectationList}>
                    <Text style={styles.expectationItem}>• Admin will review your account</Text>
                    <Text style={styles.expectationItem}>• You'll receive an email when approved</Text>
                    <Text style={styles.expectationItem}>• Then you can login normally</Text>
                    <Text style={styles.expectationItem}>• This usually takes 1-2 business days</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="Back to Login"
                  onPress={handleBackToLogin}
                  variant="outline"
                  style={styles.outlineButton}
                />
              </View>
            </View>
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

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
                  transform: [
                    { translateY: slideAnim },
                  ],
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
              <Text style={styles.appName}>
                {currentStep === 0 ? 'Join TaskFlow' : 'Almost There!'}
              </Text>
              <Text style={styles.appTagline}>
                {currentStep === 0 
                  ? 'Start managing projects efficiently' 
                  : 'Your account is being reviewed'
                }
              </Text>
            </Animated.View>
          </View>

          {/* Form Section */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                ],
              }
            ]}
          >
            {/* Enhanced Step Indicator - TOP POSITION */}
            <View style={styles.stepIndicatorContainer}>
              <View style={styles.stepsHeader}>
                <Text style={styles.stepsTitle}>
                  {currentStep === 0 ? 'Create Your Account' : 'Account Pending Approval'}
                </Text>
                <Text style={styles.stepsSubtitle}>
                  Step {currentStep + 1} of {steps.length}
                </Text>
              </View>
              
              <View style={styles.stepsWrapper}>
                {/* Progress Bar Background */}
                <View style={styles.progressBarBackground}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill,
                      { width: progressWidth }
                    ]} 
                  />
                </View>

                {/* Steps */}
                <View style={styles.stepsList}>
                  {steps.map((step, index) => (
                    <View key={step.number} style={styles.stepWrapper}>
                      <View style={styles.stepContentWrapper}>
                        <View style={[
                          styles.stepCircle,
                          index <= currentStep && styles.stepCircleActive,
                          index < currentStep && styles.stepCircleCompleted
                        ]}>
                          {index < currentStep ? (
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                          ) : (
                            <Text style={[
                              styles.stepNumber,
                              index <= currentStep && styles.stepNumberActive
                            ]}>
                              {step.number}
                            </Text>
                          )}
                        </View>
                        
                        <View style={styles.stepTextContainer}>
                          <Text style={[
                            styles.stepTitle,
                            index <= currentStep && styles.stepTitleActive
                          ]}>
                            {step.title}
                          </Text>
                          <Text style={styles.stepDescription}>
                            {step.description}
                          </Text>
                        </View>
                      </View>
                      
                      {index < steps.length - 1 && (
                        <View style={[
                          styles.stepConnector,
                          index < currentStep && styles.stepConnectorActive
                        ]} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {currentStep === 0 && error && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={20} color="#dc2626" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}
            
            {renderStepContent()}
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
    height: height * 0.25,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  // Enhanced Step Indicator Styles
  stepIndicatorContainer: {
    marginBottom: 32,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  stepsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  stepsWrapper: {
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#e2e8f0',
    zIndex: 0,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  stepsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepContentWrapper: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCircleActive: {
    backgroundColor: '#6366f1',
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepTextContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: '#1e293b',
  },
  stepDescription: {
    color: '#cbd5e1',
    fontSize: 10,
    textAlign: 'center',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    right: -20,
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    zIndex: 0,
  },
  stepConnectorActive: {
    backgroundColor: '#6366f1',
  },
  stepContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  adminNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  adminNoteText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    marginBottom: 16,
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
  outlineButton: {
    marginBottom: 12,
    width: '100%',
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
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    color: '#dc2626',
    flex: 1,
    fontWeight: '500',
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIcon: {
    marginBottom: 30,
  },
  successGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: 17,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  timelineContainer: {
    width: '100%',
    marginBottom: 40,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  timelineDotCompleted: {
    backgroundColor: '#10b981',
  },
  timelineDotPending: {
    backgroundColor: '#f59e0b',
  },
  timelineDotUpcoming: {
    backgroundColor: '#e2e8f0',
  },
  timelineDotText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  timelineDescription: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 2,
  },
  timelineTime: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginLeft: 15,
    marginBottom: 8,
  },
  expectationBox: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  expectationContent: {
    flex: 1,
  },
  expectationTitle: {
    color: '#0369a1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expectationList: {
    gap: 4,
  },
  expectationItem: {
    color: '#0369a1',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
});

export default RegisterScreen;