// components/Input.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  icon?: string;
  containerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  icon,
  containerStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : styles.inputNormal,
      ]}>
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={error ? '#dc2626' : '#64748b'} 
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithButton,
          ]}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  inputNormal: {
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  icon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  inputWithIcon: {
    paddingLeft: 12,
  },
  inputWithButton: {
    paddingRight: 12,
  },
  visibilityButton: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Input;