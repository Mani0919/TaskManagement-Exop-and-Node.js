import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function layout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="task" options={{ headerShown: false }} />
        <Stack.Screen name="taskdetails" options={{ headerShown: true }} />
    </Stack>
  )
}