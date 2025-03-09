import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Redirect, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function index() {
  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        router.replace('/(auth)')
      } else {
        router.replace('/(Screens)')
      }
    }
    checkAuth()
  }, [])
  return (
   <View>
   </View>
  )
}