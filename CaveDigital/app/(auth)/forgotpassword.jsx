import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import AxiosService from "../../services/apiCalls";
import Toast from "react-native-toast-message";

export default function ForgotPasswordScreen() {
  // State for email input
  const [useremail, setUseremail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;

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

  // // Button press animation
  // const handlePressIn = () => {
  //   Animated.spring(buttonScaleAnim, {
  //     toValue: 0.95,
  //     useNativeDriver: true,
  //   }).start();
  // };

  // const handlePressOut = () => {
  //   Animated.spring(buttonScaleAnim, {
  //     toValue: 1,
  //     friction: 3,
  //     tension: 40,
  //     useNativeDriver: true,
  //   }).start();
  // };

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

  // Reset password handler
  const handleResetPassword = async() => {
    // Reset password logic
  
    try {
      setIsLoading(true);
      setError(null);
      const res=await AxiosService.request("/forgotpassword", "POST", {email:useremail});
      if (res.status === 200) {
        Toast.show({
          type: "success",
          text1: "Email verified successfully",
        });
        router.replace({
          pathname:"/(auth)/resetpassword",
          params:{email:useremail}
        });
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

  // Handle back navigation
  const handleGoBack = () => {
    router.back();
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
            <MaterialIcons name="email" size={40} color="#2563EB" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Email Verification
          </Text>
          <Text className="text-gray-500 text-center px-6">
            Enter your email to reset your password
          </Text>
        </View>

        {/* Reset Form */}
        <View className="w-full max-w-sm space-y-4 mb-6">
          {/* Email Input */}
          <View className="space-y-2">
            <Text className="text-gray-700 font-medium ml-1">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
              <MaterialIcons name="email" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                // keyboardType="email-address"
                autoCapitalize="none"
                value={useremail}
                onChangeText={(e)=>
                {
                  setUseremail(e);
                  setError(null);
                  setSuccess(false);
                }
                }
              />
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
              onPress={handleResetPassword}
              // onPressIn={handlePressIn}
              // onPressOut={handlePressOut}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Next
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

          {/* Success Message */}
          {success && (
            <View className="mt-4 bg-green-50 p-3 rounded-lg">
              <Text className="text-green-600 text-center">
                Password reset link sent to your email
              </Text>
            </View>
          )}

          {/* Back to Sign In */}
          <View className="mt-3">
            <View className="flex flex-row items-center justify-center">
              <Text className="text-gray-500 text-center text-sm">
                Remember your password?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)")}>
                <Text className="text-blue-600 font-medium">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}