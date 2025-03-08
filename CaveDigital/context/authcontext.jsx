import AsyncStorage from "@react-native-async-storage/async-storage";
import { Children, createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export const useGlobalContext = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  useEffect(() => {
    async function fun() {
      try {
        const res = await AsyncStorage.getItem("token");
        setToken(res);
      } catch (error) {
        console.log(error);
      }
    }
    fun();
  }, []);
  async function SettingToken(token) {
    setToken(token);
    await AsyncStorage.setItem("token", token);
  }
  async function RemoveToken() {
    setToken("");
    await AsyncStorage.removeItem("token");
  }
  return (
    <AuthContext.Provider value={{ token, SettingToken, RemoveToken }}>
      {children}
    </AuthContext.Provider>
  );
};
