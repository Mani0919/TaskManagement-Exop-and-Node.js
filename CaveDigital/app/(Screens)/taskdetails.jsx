import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import {
  Text,
  Surface,
  TextInput,
  Button,
  Dialog,
  Portal,
  Provider as PaperProvider,
  Chip,
  Snackbar,
  ActivityIndicator,
  IconButton,
  Divider,
  Menu,
} from "react-native-paper";
import {
  Stack,
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AxiosService from "../../services/apiCalls";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const TaskDetailsScreen = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
   console.log(taskId)
  // State variables
  const [task, setTask] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [titleError, setTitleError] = useState("");

  // Fade in animation effect
  useFocusEffect(
    useCallback(() => {
      fetchTaskDetails();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      };
    }, [taskId])
  );

  useEffect(()=>
  {
fetchTaskDetails()
  },[])
  // Fetch single task data
  const fetchTaskDetails = async () => {
    setLoading(true);
    console.log("startr",taskId)
    try {
      const response = await AxiosService.request(
        `/singletask/${taskId}`,
        "POST"
      );
      console.log("data---",response)
      if (response.status === 200) {
        const taskData = response.data.task;
        setTask(taskData);
        setEditedTask(taskData);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      showSnackbar("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async () => {
    console.log("update",editedTask)
    // Validate task data
    if (!editedTask.taskname || editedTask.taskname.trim() === "") {
      setTitleError("Task title cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await AxiosService.request(
        `/updatetask/${taskId}`,
        "PUT",
        editedTask
      );
      if (response.status === 200) {
        setTask(editedTask);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSnackbar("Task updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showSnackbar("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  // Delete task
  const deleteTask = async () => {
    try {
      const response = await AxiosService.request(
        `/deletetask/${taskId}`,
        "DELETE"
      );
      if (response.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({
          pathname:"/(Screens)",
          params: { message: "message" },
        });
        // showSnackbar("Task deleted successfully");
        // setTimeout(() => showSnackbar("Task deleted successfully"), 500);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showSnackbar("Failed to delete task");
      setDeleteDialogVisible(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      updateTask();
    } else {
      setEditedTask({ ...task });
      setTitleError("");
      setIsEditing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Priority configuration
  const priorityConfig = {
    high: {
      color: "#E53E3E",
      bgColor: "#FEE2E2",
      icon: "flag",
      label: "HIGH PRIORITY",
    },
    medium: {
      color: "#D97706",
      bgColor: "#FEF3C7",
      icon: "flag",
      label: "MEDIUM PRIORITY",
    },
    low: {
      color: "#059669",
      bgColor: "#D1FAE5",
      icon: "flag",
      label: "LOW PRIORITY",
    },
  };

  // Get priority configuration
  const getPriorityConfig = (priority) => {
    return (
      priorityConfig[priority] || {
        color: "#6B7280",
        bgColor: "#F3F4F6",
        icon: "flag-outline",
        label: "NO PRIORITY",
      }
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-500">Loading task details...</Text>
      </View>
    );
  }

  const priorityInfo = getPriorityConfig(task.priority);

  return (
    <PaperProvider>
      <View className="flex-1 bg-gray-50">
        <Stack.Screen
          options={{
            headerTitle: "Task Details",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 18,
            },
            headerRight: () => (
              <View className="flex-row items-center">
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsEditing(false);
                        setEditedTask({ ...task });
                      }}
                      className="p-2 mr-2"
                      disabled={saving}
                    >
                      <Ionicons
                        name="close-outline"
                        size={26}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleEditMode}
                      disabled={saving}
                      className="p-2"
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#6366F1" />
                      ) : (
                        <Ionicons name="checkmark" size={26} color="#6366F1" />
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <></>
                  // <Menu
                  //   visible={menuVisible}
                  //   onDismiss={() => setMenuVisible(false)}
                  //   anchor={
                  //     <IconButton
                  //       icon="dots-vertical"
                  //       size={24}
                  //       onPress={() => {
                  //         Haptics.impactAsync(
                  //           Haptics.ImpactFeedbackStyle.Light
                  //         );
                  //         setMenuVisible(true);
                  //       }}
                  //       color="#6B7280"
                  //     />
                  //   }
                  // >
                  //   <Menu.Item
                  //     onPress={() => {
                  //       setMenuVisible(false);
                  //       toggleEditMode();
                  //     }}
                  //     title="Edit Task"
                  //     leadingIcon="pencil-outline"
                  //   />
                  //   <Menu.Item
                  //     onPress={() => {
                  //       setMenuVisible(false);
                  //       setDeleteDialogVisible(true);
                  //     }}
                  //     title="Delete Task"
                  //     leadingIcon="delete-outline"
                  //     titleStyle={{ color: "#EF4444" }}
                  //   />
                  // </Menu>
                )}
              </View>
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} className="p-2">
                <Ionicons name="arrow-back" size={24} color="#6366F1" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: "#FFFFFF",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            },
            headerShadowVisible: false,
          }}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Surface
              className="m-4 rounded-xl bg-white overflow-hidden"
              elevation={2}
            >
              {/* Priority Banner */}
              <View
                style={{
                  backgroundColor: priorityInfo.bgColor,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: priorityInfo.bgColor,
                }}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name={priorityInfo.icon}
                    size={18}
                    color={priorityInfo.color}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: priorityInfo.color,
                      fontSize: 12,
                      fontWeight: "600",
                      letterSpacing: 0.5,
                    }}
                  >
                    {priorityInfo.label}
                  </Text>
                </View>
              </View>

              <View className="p-6">
                {isEditing ? (
                  <View className="mb-5">
                    <TextInput
                      label="Task Title"
                      value={editedTask.taskname}
                      onChangeText={(taskname) => {
                        setEditedTask((prev) => ({ ...prev, taskname }));
                        if (taskname.trim() !== "") {
                          setTitleError("");
                        }
                      }}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor="#6366F1"
                      error={!!titleError}
                      style={{ backgroundColor: "#FFFFFF" }}
                    />
                    {titleError ? (
                      <Text className="text-red-500 text-xs mt-1">
                        {titleError}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className="text-2xl font-bold mb-4 text-gray-800">
                    {task.taskname}
                  </Text>
                )}

                {isEditing ? (
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </Text>
                    <TextInput
                      value={editedTask.desc}
                      onChangeText={(desc) =>
                        setEditedTask((prev) => ({ ...prev, desc }))
                      }
                      multiline
                      numberOfLines={5}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor="#6366F1"
                      placeholder="Add a description for your task..."
                      style={{ backgroundColor: "#FFFFFF", minHeight: 120 }}
                    />
                  </View>
                ) : (
                  <>
                    <Text className="text-base text-gray-600 mb-5">
                      {task.desc || "No description provided for this task."}
                    </Text>
                    <Divider className="mb-5" />
                  </>
                )}

                <Text className="text-sm font-medium text-gray-700 mb-3">
                  PRIORITY LEVEL
                </Text>

                {isEditing ? (
                  <View className="flex-row flex-wrap mb-2">
                    {["low", "medium", "high"].map((priority) => {
                      const config = getPriorityConfig(priority);
                      const isSelected = editedTask.priority === priority;

                      return (
                        <TouchableOpacity
                          key={priority}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            setEditedTask((prev) => ({ ...prev, priority }));
                          }}
                          className="mr-3 mb-3"
                        >
                          <Surface
                            elevation={isSelected ? 2 : 0}
                            className={`px-4 py-2 rounded-full flex-row items-center ${
                              isSelected ? "border-0" : "border border-gray-200"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? config.color
                                : "#FFFFFF",
                            }}
                          >
                            <MaterialCommunityIcons
                              name={isSelected ? "flag" : "flag-outline"}
                              size={16}
                              color={isSelected ? "#FFFFFF" : config.color}
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={{
                                color: isSelected ? "#FFFFFF" : config.color,
                                fontWeight: "600",
                                textTransform: "capitalize",
                              }}
                            >
                              {priority}
                            </Text>
                          </Surface>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View className="mb-5">
                    <Surface
                      className="px-4 py-2 self-start rounded-full flex-row items-center"
                      style={{ backgroundColor: priorityInfo.color }}
                      elevation={2}
                    >
                      <MaterialCommunityIcons
                        name="flag"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-white font-semibold capitalize">
                        {task.priority || "None"}
                      </Text>
                    </Surface>
                  </View>
                )}

                {!isEditing && (
                  <View className="mt-8">
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        toggleEditMode();
                      }}
                      className="mb-3"
                    >
                      <LinearGradient
                        colors={["#6366F1", "#4F46E5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-3 px-4 rounded-lg"
                      >
                        <View className="flex-row justify-center items-center">
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text className="text-white font-bold ml-2">
                            Edit Task
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setDeleteDialogVisible(true);
                      }}
                      className="py-3 px-4 rounded-lg border border-red-500"
                    >
                      <View className="flex-row justify-center items-center">
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                        <Text className="text-red-500 font-bold ml-2">
                          Delete Task
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Surface>
          </Animated.View>
        </ScrollView>

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={deleteDialogVisible}
            onDismiss={() => setDeleteDialogVisible(false)}
            style={{ borderRadius: 12, backgroundColor: "white" }}
          >
            <View className="items-center mt-4">
              <View className="bg-red-100 p-3 rounded-full">
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={28}
                  color="#EF4444"
                />
              </View>
            </View>
            <Dialog.Title
              style={{ textAlign: "center", fontWeight: "bold", marginTop: 8 }}
            >
              Delete Task
            </Dialog.Title>
            <Dialog.Content>
              <Text className="text-center text-gray-600 mb-2">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </Text>
              <Text className="text-center font-medium text-gray-800">
                "{task.taskname}"
              </Text>
            </Dialog.Content>
            <Dialog.Actions className="justify-center pb-4">
              <Button
                mode="outlined"
                onPress={() => setDeleteDialogVisible(false)}
                className="mr-2"
                contentStyle={{ paddingHorizontal: 8 }}
                labelStyle={{ fontSize: 14 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={deleteTask}
                buttonColor="#EF4444"
                className="ml-2"
                contentStyle={{ paddingHorizontal: 8 }}
                labelStyle={{ fontSize: 14 }}
              >
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Snackbar for notifications */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: "#374151", marginBottom: 8 }}
          action={{
            label: "Dismiss",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

export default TaskDetailsScreen;
