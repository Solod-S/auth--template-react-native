import { View, Text } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import Toast from "react-native-toast-message";
// Import your global CSS file
import "../global.css";
import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore.js";

const MainLayout = () => {
  const { user, isAuthenticated, initAuthListener } = useAuthStore();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    //  check if the user is authenticated or not
    if (typeof isAuthenticated == "undefined") return;
    // user in app group
    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      // if user authenticated
      // and not in (app) => redirect home
      router.replace("home");
    } else if (isAuthenticated == false) {
      // if user is not authenticated
      //  redirect to signIn
      router.replace("signIn");
    }
  }, [isAuthenticated]);

  return <View></View>;
};

export default function RootLayout() {
  return (
    <>
      <Slot />
      <MainLayout />
      <Toast />
    </>
  );
}
