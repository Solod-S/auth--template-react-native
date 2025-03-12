import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import React, { useRef, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { Loading, CustomKeyboardView } from "../../components";

import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import authStore from "../../store/authStore";
import Toast from "react-native-toast-message";

export default function SignIn() {
  const { login } = authStore;
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const router = useRouter();

  const emailRef = useRef("");
  const passwordRef = useRef("");

  const handleLogin = async () => {
    try {
      if (!emailRef.current || !passwordRef.current) {
        Toast.show({
          type: "info",
          position: "top",
          text2: "Please fill all the fields",
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 50,
        });
        return;
      }
      setLoading(true);
      const response = await login(emailRef.current, passwordRef.current);
      setLoading(false);
      if (!response.success) {
        Toast.show({
          type: "error",
          position: "top",
          text2: response.message,
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text2: error.message,
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomKeyboardView>
      <StatusBar style="dark" />
      <View
        style={{ paddingTop: hp(8), paddingHorizontal: wp(5) }}
        className="flex-1 gap-12"
      >
        <View className="item-center">
          {/* Sign in image */}
          <Image
            style={{ width: wp(100), height: hp(20) }}
            resizeMode="contain"
            source={require("../../assets/images/login.png")}
          />
        </View>
        <View className="gap-10">
          <Text
            style={{ fontSize: hp(4) }}
            className="font-bold tracking-wider text-center text-neutral-800"
          >
            Sign In
          </Text>
          {/* Inputs */}
          <View className="gap-4 ">
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <Octicons name="mail" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value => (emailRef.current = value)}
                style={{ fontSize: hp(2) }}
                placeholder="Email Address"
                placeholderTextColor={"gray"}
                className="flex-1 font-semibold text-neutral-700"
              />
            </View>
            <View className="gap-3">
              <View
                style={{ height: hp(7) }}
                className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
              >
                <Pressable
                  onPress={() => setSecureTextEntry(prevState => !prevState)}
                >
                  <Octicons name="lock" size={hp(2.7)} color="gray" />
                </Pressable>
                <TextInput
                  onChangeText={value => (passwordRef.current = value)}
                  style={{ fontSize: hp(2) }}
                  placeholder="Password"
                  secureTextEntry={secureTextEntry}
                  placeholderTextColor={"gray"}
                  className="flex-1 font-semibold text-neutral-700"
                />
              </View>
              <Text
                style={{ fontSize: hp(1.8) }}
                className="font-semibold text-right text-neutral-500"
              >
                Forget password?
              </Text>
            </View>
            {/* Submit btn */}
            <View>
              {loading ? (
                <View className="flex-row justify-center">
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{ height: hp(6.5) }}
                  className="bg-indigo-500 rounded-xl justify-center items-center"
                >
                  <Text
                    style={{ fontSize: hp(2.7) }}
                    className="text-white font-bold tracking-wider"
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* sign up text */}
            <View className="flex-row justify-center">
              <Text
                style={{ fontSize: hp(1.8) }}
                className="font-semibold text-neutral-500"
              >
                Don't have an account?{" "}
              </Text>
              <Pressable>
                <Text
                  style={{ fontSize: hp(1.8) }}
                  className="font-bold text-indigo-500"
                  onPress={() => router.push("/signUp")}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}
