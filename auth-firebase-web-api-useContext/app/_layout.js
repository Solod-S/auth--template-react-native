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
