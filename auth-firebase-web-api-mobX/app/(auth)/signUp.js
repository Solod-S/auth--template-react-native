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
import { CustomKeyboardView, Loading } from "../../components";

import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import authStore from "../../store/authStore";
import Toast from "react-native-toast-message";

export default function signUp() {
  const { register } = authStore;
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const router = useRouter();

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const userNameRef = useRef("");
  const profileUrlRef = useRef("");

  const handleRegister = async () => {
    try {
      if (!emailRef.current || !passwordRef.current || !userNameRef.current) {
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

      // registration process
      setLoading(true);
      const response = await register(
        emailRef.current,
        passwordRef.current,
        userNameRef.current,
        profileUrlRef.current
      );
      console.log(`got response`, response);
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
        style={{ paddingTop: hp(7), paddingHorizontal: wp(5) }}
        className="flex-1 gap-12"
      >
        <View className="item-center">
          {/* Sign in image */}
          <Image
            style={{ width: wp(100), height: hp(25) }}
            resizeMode="contain"
            source={require("../../assets/images/register.png")}
          />
        </View>
        <View className="gap-10">
          <Text
            style={{ fontSize: hp(4) }}
            className="font-bold tracking-wider text-center text-neutral-800"
          >
            Sign Up
          </Text>
          {/* Inputs */}
          <View className="gap-4">
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <Feather name="user" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value => (userNameRef.current = value)}
                style={{ fontSize: hp(2) }}
                placeholder="Username"
                placeholderTextColor={"gray"}
                className="flex-1 font-semibold text-neutral-700"
              />
            </View>

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
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl"
            >
              <Feather name="image" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={value => (profileUrlRef.current = value)}
                style={{ fontSize: hp(2) }}
                placeholder="Avatar Url"
                placeholderTextColor={"gray"}
                className="flex-1 font-semibold text-neutral-700"
              />
            </View>

            {/* Submit btn */}
            <View>
              {loading ? (
                <View className="flex-row justify-center">
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleRegister}
                  style={{ height: hp(6.5) }}
                  className="bg-indigo-500 rounded-xl justify-center items-center"
                >
                  <Text
                    style={{ fontSize: hp(2.7) }}
                    className="text-white font-bold tracking-wider"
                  >
                    Sign Up
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
                Already have an account?{" "}
              </Text>
              <Pressable>
                <Text
                  style={{ fontSize: hp(1.8) }}
                  className="font-bold text-indigo-500"
                  onPress={() => router.push("signIn")}
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}
