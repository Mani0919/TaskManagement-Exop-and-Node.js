import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  Provider as PaperProvider,
} from "react-native-paper";
import { Stack, useRouter } from "expo-router";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AxiosService from "../../services/apiCalls";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

const AddTaskScreen = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [err, setErr] = useState("");
  // Animation values
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  // Refs
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Gesture handler for dismissing keyboard
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      if (event.translationY > height * 0.3) {
        // Swipe down enough to dismiss
        translateY.value = withTiming(height, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        router.back();
      } else {
        // Snap back
        translateY.value = withSpring(0);
      }
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(
        translateY.value,
        [0, height],
        [1, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  // Show screen with animation
  useEffect(() => {
    translateY.value = withSpring(0);
    opacity.value = withTiming(1);
  }, []);

  // Handle task creation
  const handleCreateTask = async () => {
    console.log("start");
    // if (!title.trim()) {
    //   // Shake animation on title input
    //   titleInputRef.current?.shake();
    //   return;
    // }

    // Create task logic here
    const newTask = {
      taskname: title,
      desc: description,
      priority: priority,
      createdAt: new Date(),
    };

    // TODO: Save to backend or state management
    console.log("New Task:", newTask);
    try {
      const add = await AxiosService.request("/addtask", "POST", newTask);
      if (add.status === 200) {
        console.log(add.data);
        // Toast.show({
        //   type: "success",
        //   text1: "Task Created",
        //   text2: "Task has been created successfully.",
        // });
        translateY.value = withTiming(height, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
    
        // Small delay to allow animation
        setTimeout(() => {
          router.replace({
            pathname: "/(Screens)",
            params: {
              screen: "Home",
            },
          });
        }, 300);
      }
      else {
        setErr(add.data.message);
      }
    } catch (error) {
      console.log(error);
    }
    // Animate out and go back
 
  };

  // Priority selection
  const PrioritySelector = () => {
    const priorities = [
      { key: "low", color: "#4CAF50", label: "Low" },
      { key: "medium", color: "#2196F3", label: "Medium" },
      { key: "high", color: "#F44336", label: "High" },
    ];

    return (
      <View className="flex-row justify-between">
        {priorities.map((item) => (
          <TouchableWithoutFeedback
            key={item.key}
            onPress={() => setPriority(item.key)}
          >
            <View
              className={`flex-1 mx-1 py-2.5 border rounded-lg items-center ${
                priority === item.key ? "" : "bg-transparent"
              }`}
              style={{
                backgroundColor:
                  priority === item.key ? item.color : "transparent",
                borderColor: item.color,
              }}
            >
              <Text
                className="font-bold"
                style={{
                  color: priority === item.key ? "white" : item.color,
                }}
              >
                {item.label}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    );
  };

  return (
    <PaperProvider>
      <GestureHandlerRootView className="flex-1 bg-black/50">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View className="flex-1 justify-end" style={animatedStyle}>
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
              />

              <Surface className="bg-white rounded-t-2xl p-5 pb-10 shadow-lg">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-xl font-bold">Create New Task</Text>
                  <TouchableWithoutFeedback onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#6C757D" />
                  </TouchableWithoutFeedback>
                </View>

                <TextInput
                  ref={titleInputRef}
                  label="Task Title"
                  value={title}
                  onChangeText={(e)=>
                  {
                    setTitle(e)
                    setErr("")
                  }
                  }
                  className="mb-4"
                  mode="outlined"
                  left={<TextInput.Icon icon="format-title" />}
                />

                <TextInput
                  ref={descriptionInputRef}
                  label="Description"
                  value={description}
                  onChangeText={(e)=>
                  {
                    setDescription(e)
                    setErr("")
                  }
                  }
                  className="mb-4"
                  style={{ maxHeight: 200 }} // Increased height for large data
                  multiline
                  mode="outlined"
                  left={<TextInput.Icon icon="text" />}
                />

                <View className="mb-5">
                  <Text className="text-base mb-2.5 font-bold">Priority</Text>
                  <PrioritySelector />
                </View>
                {err && (
                  <View className=" bg-red-50 p-3 rounded-lg w-full max-w-sm">
                    <Text className="text-red-600 text-center">{err}</Text>
                  </View>
                )}
                <Button
                  mode="contained"
                  onPress={handleCreateTask}
                  className="mt-2.5"
                >
                  Create Task
                </Button>
              </Surface>
            </Animated.View>
          </PanGestureHandler>
        </TouchableWithoutFeedback>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

export default AddTaskScreen;
