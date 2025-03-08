import { View, Text } from "react-native";
import { Stack, Slot, useRouter, useSegments } from "expo-router";
import { Provider, useDispatch, useSelector } from "react-redux";
// Import your global CSS file
import "../global.css";
import { useEffect } from "react";

import store from "../redux/store";
import { initAuthListener } from "@/redux/slices/authSlice";
import Toast from "react-native-toast-message";

const MainLayout = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = dispatch(initAuthListener());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(`isAuthenticated`, isAuthenticated);
    if (typeof isAuthenticated == "undefined") return;

    const inApp = segments[0] == "(tabs)";
    if (isAuthenticated && !inApp) {
      router.replace("home");
    } else if (isAuthenticated == false) {
      router.replace("signIn");
    }
  }, [isAuthenticated]);

  return <View></View>;
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
      <MainLayout />
      <Toast />
    </Provider>
  );
}
