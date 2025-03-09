import { View } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import Toast from "react-native-toast-message";
import "../global.css";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import authStore from "../store/authStore";

const MainLayout = observer(() => {
  const { user, isAuthenticated, initAuthListener } = authStore;

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if the user is authenticated or not
    console.log(`isAuthenticated`, isAuthenticated);
    if (typeof isAuthenticated == "undefined") return;
    // user in app group
    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      // if user authenticated and not in (app) => redirect to home
      router.replace("home");
    } else if (isAuthenticated == false) {
      // if user is not authenticated => redirect to signIn
      router.replace("signIn");
    }
  }, [isAuthenticated, segments]);

  return <View></View>;
});

const RootLayout = () => {
  return (
    <>
      <Slot />
      <MainLayout />
      <Toast />
    </>
  );
};

export default RootLayout;
