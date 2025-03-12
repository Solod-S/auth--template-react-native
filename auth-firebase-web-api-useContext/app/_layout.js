import { View, Text } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthContextProvider, useAuth } from "@/context/authContext";
// Import your global CSS file
import "../global.css";
import { useEffect } from "react";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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

  return (
    <View className="flex-1 bg-white">
      <Slot />
    </View>
  );
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
