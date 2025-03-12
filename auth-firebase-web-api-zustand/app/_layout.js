import { View, Text } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import Toast from "react-native-toast-message";
// Import your global CSS file
import "../global.css";
import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore.js";

const MainLayout = ({ children }) => {
  const { user, isAuthenticated, initAuthListener } = useAuthStore();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if the user is authenticated or not
    // console.log(`isAuthenticated`, isAuthenticated);
    if (typeof isAuthenticated === "undefined") return;
    // user in app group
    // console.log(`segments[0]`, segments[0]);
    const inApp = segments[0] === "(app)";
    const inAuth = segments[0] === "(auth)";
    if (isAuthenticated && !inApp) {
      // if user authenticated and not in (app) => redirect to home
      router.replace("home");
    } else if (isAuthenticated === false && !inAuth) {
      // if user is not authenticated => redirect to signIn
      router.replace("signIn");
    }
  }, [isAuthenticated, segments]);

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default function RootLayout() {
  return (
    <MainLayout>
      <Slot />
      <Toast />
    </MainLayout>
  );
}
