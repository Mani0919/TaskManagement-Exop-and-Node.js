import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
  Platform,
  Animated,
  Easing,
} from "react-native";
import {
  Text,
  FAB,
  Dialog,
  Portal,
  Button,
  Provider as PaperProvider,
  Snackbar,
  Appbar,
  Card,
  Avatar,
  Chip,
  useTheme,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import AxiosService from "../../services/apiCalls";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../../context/authcontext";

const { width } = Dimensions.get("window");

// Utility function to generate a color based on the first letter
const getColorForLetter = (letter) => {
  const colors = [
    "#6200EE", // Deep Purple
    "#3700B3", // Dark Purple
    "#03DAC6", // Teal
    "#018786", // Dark Teal
    "#BB86FC", // Light Purple
    "#6200E8", // Vibrant Purple
    "#3F51B5", // Indigo
    "#2196F3", // Blue
    "#009688", // Teal
    "#4CAF50", // Green
  ];

  // Use the character code to consistently map to a color
  const index = letter?.toUpperCase()?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};

const HomeScreen = () => {
  const { message } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Animation values
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(1)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);
  const { RemoveToken } = useGlobalContext();
  const [Isfirst, setIsfirst] = useState(true);
  // Properly implemented useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      fetchUser()
      fetchTasks()
    }, [])
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (tasks) {
      filterTasks();
    }
  }, [searchQuery, tasks]);

  useEffect(() => {
    async function IsFirst() {
      const res = await AsyncStorage.getItem("first");
      if (res) {
        setIsfirst(false);
      }
    }
    IsFirst();
  }, []);
  const filterTasks = () => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  const toggleSearch = () => {
    const newSearchState = !isSearchActive;
    setIsSearchActive(newSearchState);

    if (newSearchState) {
      // Activate search
      Animated.parallel([
        // Animate search bar width
        Animated.timing(searchWidthAnim, {
          toValue: width - 100,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Fade out profile elements
        Animated.timing(profileOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Fade in search
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 250,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      });
    } else {
      // Deactivate search
      Animated.parallel([
        // Shrink search bar width
        Animated.timing(searchWidthAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        // Fade out search
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        // Fade in profile elements
        Animated.timing(profileOpacity, {
          toValue: 1,
          duration: 250,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSearchQuery("");
      });
    }
  };

  async function fetchTasks() {
    try {
      const data = await AxiosService.request("/alltasks", "POST");
      if (data.status === 200) {
        const formattedTasks = await data.data.tasks.map((task) => ({
          id: task._id,
          title: task.taskname,
          description: task.desc,
          priority: task.priority,
          dueDate: new Date(task.createdAt).toISOString().split("T")[0],
        }));

        setTasks(formattedTasks);
        setFilteredTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setSnackbarVisible(true);
      setSnackbarMessage("Failed to fetch tasks");
    }
  }

  async function fetchUser() {
    try {
      const response = await AxiosService.request("/profile", "POST");
      console.log(response.data)
      if (response.status === 200) {
        setUser(response.data.user.name);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser();
    fetchTasks();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    try {
      await RemoveToken();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed", error);
      setSnackbarVisible(true);
      setSnackbarMessage("Logout failed");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#4ECDC4";
      default:
        return "#A8DADC";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      default:
        return "Low";
    }
  };

  const renderTaskItem = ({ item }) => (
    <Card
      mode="elevated"
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: Platform.OS === "ios" ? "#FFFFFF" : "#FAFAFA",
      }}
      onPress={() =>
        router.push({
          pathname: "/taskdetails",
          params: { taskId: item.id },
        })
      }
    >
      <Card.Content style={{ paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text variant="titleMedium" style={{ flex: 1, fontWeight: "700" }}>
            {item.title}
          </Text>
          <Chip
            style={{
              backgroundColor: getPriorityColor(item.priority) + "20",
              borderRadius: 12,
            }}
            textStyle={{
              color: getPriorityColor(item.priority),
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {getPriorityLabel(item.priority)}
          </Chip>
        </View>

        <Text
          variant="bodyMedium"
          style={{ color: "#666", marginBottom: 10 }}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="calendar-outline" size={14} color="#6C757D" />
          <Text
            variant="labelSmall"
            style={{ marginLeft: 6, color: "#6C757D" }}
          >
            {item.dueDate}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar backgroundColor="#6200EE" style="light" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F5F5F5" }}
        edges={["right", "left"]}
      >
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <Appbar.Header
          style={{
            backgroundColor: "#6200EE",
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {/* Animated Profile Section */}
            <Animated.View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                opacity: profileOpacity,
                position: isSearchActive ? "absolute" : "relative",
                zIndex: isSearchActive ? -1 : 1,
                marginLeft: 15,
              }}
            >
              <Avatar.Text
                size={36}
                label={user?.charAt(0)?.toUpperCase() || "U"}
                style={{
                  backgroundColor: getColorForLetter(user?.charAt(0)),
                  marginRight: 12,
                }}
              />
              <View>
                <Text
                  variant="labelSmall"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {!Isfirst?"Welcome back":"welcome"}
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ color: "#fff", fontWeight: "700" }}
                >
                  {user}
                </Text>
              </View>
            </Animated.View>

            {/* Animated Search Input */}
            <Animated.View
              style={{
                width: searchWidthAnim,
                opacity: searchOpacity,
                position: isSearchActive ? "relative" : "absolute",
                zIndex: isSearchActive ? 1 : -1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                overflow: "hidden",
                height: 40,
              }}
            >
              <Ionicons
                name="search"
                size={20}
                color="#fff"
                style={{ marginLeft: 10, marginRight: 8 }}
              />
              <TextInput
                ref={searchInputRef}
                style={{
                  flex: 1,
                  color: "#fff",
                  height: "100%",
                  paddingVertical: 0,
                }}
                placeholder="Search tasks..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          <IconButton
            icon={isSearchActive ? "close" : "magnify"}
            iconColor="#fff"
            size={24}
            onPress={toggleSearch}
            style={{ margin: 0 }}
          />

          <IconButton
            icon="logout"
            iconColor="#fff"
            size={24}
            onPress={() => setLogoutDialogVisible(true)}
            style={{ margin: 0 }}
          />
        </Appbar.Header>

        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6200EE"]}
                tintColor="#6200EE"
              />
            }
            ListEmptyComponent={
              <View
                style={{
                  padding: 24,
                  minHeight: 260,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {searchQuery ? (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons
                      name="search"
                      size={56}
                      color="#A78BFA"
                      style={{ marginBottom: 16 }}
                    />
                    <Text
                      variant="headlineSmall"
                      style={{
                        fontWeight: "700",
                        marginBottom: 8,
                        color: "#1F2937",
                      }}
                    >
                      No matching tasks found
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        textAlign: "center",
                        marginBottom: 24,
                        color: "#6B7280",
                        paddingHorizontal: 16,
                      }}
                    >
                      We couldn't find any tasks matching "{searchQuery}". Try a
                      different search term.
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => setSearchQuery("")}
                      style={{ borderRadius: 8 }}
                    >
                      Clear Search
                    </Button>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons
                      name="list"
                      size={56}
                      color="#9CA3AF"
                      style={{ marginBottom: 16 }}
                    />
                    <Text
                      variant="headlineSmall"
                      style={{
                        fontWeight: "700",
                        marginBottom: 8,
                        color: "#1F2937",
                      }}
                    >
                      Your task list is empty
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        textAlign: "center",
                        marginBottom: 24,
                        color: "#6B7280",
                        paddingHorizontal: 16,
                      }}
                    >
                      Create your first task to get started tracking your daily
                      responsibilities!
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => router.push(`/task`)}
                      icon="plus"
                      style={{ borderRadius: 8 }}
                    >
                      Create New Task
                    </Button>
                  </View>
                )}
              </View>
            }
          />

          <FAB
            icon="plus"
            style={{
              position: "absolute",
              margin: 16,
              right: 0,
              bottom: 0,
              backgroundColor: "#6200EE",
              borderRadius: 28,
            }}
            color="#fff"
            onPress={() => router.push(`/task`)}
          />
        </View>

        <Portal>
          <Dialog
            visible={logoutDialogVisible}
            onDismiss={() => setLogoutDialogVisible(false)}
            style={{ borderRadius: 12 }}
          >
            <Dialog.Title>Logout</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">Are you sure you want to logout?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLogoutDialogVisible(false)}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={{ borderRadius: 4 }}
              >
                Logout
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: "#374151" }}
          action={{
            label: "Dismiss",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default HomeScreen;
