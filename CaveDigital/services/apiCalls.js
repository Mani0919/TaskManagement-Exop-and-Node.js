import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "https://diet.jayasindoor.com/api",
  timeout: 60000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // console.log("Request Config:", {
    //   url: config.url,
    //   method: config.method,
    //   baseURL: config.baseURL,
    //   headers: config.headers,
    //   data: config.data,
    // });
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
// Add response interceptor for logging and handling authorization
api.interceptors.response.use(
  (response) => {
    return response; // Return the response if successful
  },
  (error) => {
    console.error("Detailed Response Error:", {
      message: error.message,
      code: error.code,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers,
      config: error?.config,
    });

    // Handle Unauthorized or Forbidden
    // if (error.response?.status === 422) {
    //   router.replace("/(quesdetails)/paymentplans");
    //   Toast.show({
    //     type: "info",
    //     text1: "Subscription Required",
    //     text2: "Please subscribe to access the features.",
    //   });
    // }
    if (error.response?.status === 403) {
      Toast.show({
        type: "error",
        text1: "Forbidden",
        text2: "You do not have permission to access this resource.",
      });
    } else if (error.response?.status === 503) {
      Toast.show({
        type: "error",
        text1: "Service Unavailable",
      });
    } else if (error.response?.status === undefined) {
      // showTimeManipulation()
    } else if (error.response.status === 500) {
      Toast.show({
        type: "error",
        text1: "Network error",
      });
    }
    return Promise.reject(error);
  }
);

const AxiosService = {
  async request(url, method = "POST", data = {}, headers = {}) {
    try {
      // Ensure full URL is used
      const fullUrl = `https://cavedigitalbackend-assesment-1.onrender.com/api${url}`;
      console.log(fullUrl);
      const token = await AsyncStorage.getItem("token");
      //   const isFormData = data instanceof FormData;
      console.log(token);
      const response = await api({
        url: fullUrl,
        method,
        data,
        headers: {
          ...headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response;
    } catch (error) {
      console.error("AxiosService Request Error:", error);
      if (error.response.status === 400) {
        // Toast.show({
        //     type:"info",
        //     text1:error.response.data.message
        // })
      }
      return error.response;
    }
  },
};

export default AxiosService;
