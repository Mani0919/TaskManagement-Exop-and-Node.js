import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import AxiosService from "../../services/apiCalls";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "../../context/authcontext";
import { ActivityIndicator } from "react-native-paper";

export default function LoginScreen() {
  // State for form inputs
  const [useremail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [Isfirst,setIsfirst]=useState(true)
  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const {SettingToken}=useGlobalContext()
  const [spin,setSpin]=useState(false)
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
   useEffect(()=>
  {
    async function IsFirst()
    {
      const res=await AsyncStorage.getItem("first")
      if(res)
      {
        setIsfirst(false)
      }
    }
    IsFirst()
  },[])
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      setSpin(true)
      const data = {
        email: useremail,
        password: userPassword,
      };
      const response = await AxiosService.request("/login", "POST", data);
      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Login Successful",
        });
        console.log(response.data.token)
        await AsyncStorage.setItem("first", "no");
        await SettingToken(response.data.token)
        router.replace("/(Screens)");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setSpin(false)
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
        {/* Header Section with Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 mb-6 bg-blue-50 rounded-full items-center justify-center">
            <MaterialIcons name="lock" size={40} color="#2563EB" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
           {!Isfirst? "Welcome Back":"Welcome"}
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to continue to your account
          </Text>
        </View>

        {/* Email/Password Form */}
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
                autoCapitalize="none"
                value={useremail}
                onChangeText={(e) => {
                  setUserEmail(e);
                  setError(null);
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
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={userPassword}
                onChangeText={(e) => {
                  setUserPassword(e);
                  setError(null);
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
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="items-end"
            onPress={() => router.push("/(auth)/forgotpassword")}
          >
            <Text className="text-blue-600 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button with Animation */}
          <Animated.View
            style={{
              transform: [{ scale: buttonScaleAnim }],
            }}
          >
            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 items-center"
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
              disabled={spin}
            >
              {spin?<ActivityIndicator color="white"/>:<Text className="text-white font-semibold text-lg">Sign In</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
        {error && (
          <View className=" bg-red-50 p-3 rounded-lg w-full max-w-sm">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}
        {/* Footer Section */}
        <View className="mt-3">
          <View className="flex flex-row items-center">
            <Text className="text-gray-500 text-center text-sm">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
              <Text className="text-blue-600 font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
