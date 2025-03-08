import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/authcontext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(Screens)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthProvider>
      </PaperProvider>
      <Toast position="top" />
    </GestureHandlerRootView>
  );
}
