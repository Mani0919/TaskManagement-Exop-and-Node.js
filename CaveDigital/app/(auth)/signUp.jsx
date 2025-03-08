import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import AxiosService from "../../services/apiCalls";
import Toast from "react-native-toast-message";

export default function SignUpScreen() {
  // State for form inputs
  const [name, setName] = useState("");
  const [useremail, setUseremail] = useState("");
  const [password, setUserpassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

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

  // Button press animation
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

  // Signup handler
  const handleSignUp = async() => {
    setIsLoading(true);
    try {
      const data={
        name:name,
        email:useremail,
        password:password
      }
      const res=await AxiosService.request("/register", "POST",data)
      console.log(res)
      if(res.status===201)
      {
        Toast.show({
          type:"success",
          text1:"Registration Successful",
          text2:"Please login to continue"
        })
        router.back();
      }
      else {
        setError(res.data.message);
      }
    } catch (error) {
      console.log(error)
    }finally{
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    router.back();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              <MaterialIcons name="person-add" size={40} color="#2563EB" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </Text>
            <Text className="text-gray-500 text-center">
              Sign up to get started with Event App
            </Text>
          </View>

          {/* Sign Up Form */}
          <View className="w-full max-w-sm space-y-4 mb-6">
            {/* Full Name Input */}
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium ml-1">Full Name</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={(e)=>
                  {
                    setName(e)
                    setError(null)
                  }
                  }
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium ml-1">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <MaterialIcons name="email" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  value={useremail}
                  onChangeText={(e)=>
                  {
                    setUseremail(e)
                    setError(null)
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium ml-1">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <MaterialIcons name="lock-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(e)=>
                  {
                    setUserpassword(e)
                    setError(null)
                  }}
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  className="ml-2"
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 ml-1">
                Must be at least 8 characters long
              </Text>
            </View>

            {/* Sign Up Button */}
            <Animated.View
              style={{
                transform: [{ scale: buttonScaleAnim }],
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                className="bg-blue-600 rounded-xl p-4 items-center"
                onPress={handleSignUp}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Error Message */}
          {error && (
            <View className=" bg-red-50 p-3 rounded-lg w-full max-w-sm">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          <View className="mt-3">
            <View className="flex flex-row items-center">
              <Text className="text-gray-500 text-center text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)")}>
                <Text className="text-blue-600 font-medium">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}