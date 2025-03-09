import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import AxiosService from '../../services/apiCalls';
import Toast from 'react-native-toast-message';

export default function PasswordResetScreen() {
  const {email}=useLocalSearchParams()
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;

  // Animation setup
  useEffect(() => {
    // Parallel animations for fade and translate
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 7) strength++;
    if (pwd.match(/[a-z]+/)) strength++;
    if (pwd.match(/[A-Z]+/)) strength++;
    if (pwd.match(/[0-9]+/)) strength++;
    if (pwd.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const handlePasswordChange = (newPassword) => {
    setError(null);
    setPassword(newPassword);
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);

    // Animate strength indicator
    Animated.timing(strengthAnim, {
      toValue: strength / 5,
      duration: 500,
      useNativeDriver: false
    }).start();
  };

  // Button press animations
  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Back button press animation
  const handleBackPressIn = () => {
    Animated.spring(backButtonScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(backButtonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Handle back navigation
  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit =async () => {
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }




    try {
          // Reset loading and error states
    setIsLoading(true);
    setError(null);
      const res=await AxiosService.request("/resetpassword", "POST", {email:email,password:password});
      if (res.status === 200) {
        Toast.show({
          type: "success",
          text1: "Password reset successfully",
        });
        router.replace("/(auth)");
        
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
    finally{
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '#EF4444'; // Red for weak
      case 2:
        return '#F59E0B'; // Yellow for medium
      default:
        return '#10B981'; // Green for strong
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center py-14">
      {/* Back Button */}
      <Animated.View 
        style={{
          position: 'absolute', 
          top: 40, 
          left: 20, 
          zIndex: 10,
          transform: [{ scale: backButtonScaleAnim }]
        }}
      >
        <TouchableOpacity 
          onPress={handleGoBack}
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          className="bg-gray-100 p-2 rounded-full shadow-md"
        >
          <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        {/* Header Section */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 mb-6 bg-blue-50 rounded-full items-center justify-center">
            <MaterialIcons name="lock-reset" size={40} color="#2563EB" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Reset Password
          </Text>
          <Text className="text-gray-500 text-center px-6">
            Create a strong, unique password
          </Text>
        </View>

        {/* Reset Form */}
        <View className="w-full max-w-sm space-y-4 mb-6">
          {/* Password Input */}
          <View className="space-y-2">
            <Text className="text-gray-700 font-medium ml-1">New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
              <MaterialIcons name="lock-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter new password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={!showPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            {/* Password Strength Indicator */}
            <View className="h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
              <Animated.View 
                style={{
                  height: '100%',
                  width: strengthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getStrengthColor()
                }} 
              />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="space-y-2">
            <Text className="text-gray-700 font-medium ml-1">Confirm Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
              <MaterialIcons name="lock-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(e)=>
                {
                  setConfirmPassword(e);
                  setError(null);
                }
                }
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons 
                  name={!showConfirmPassword ? "visibility-off" : "visibility"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Button */}
          <Animated.View
            style={{
              transform: [{ scale: buttonScaleAnim }],
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 items-center"
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Error Message */}
          {error && (
            <View className="mt-4 bg-red-50 p-3 rounded-lg">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}