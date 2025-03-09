import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import useAuthStore from "../../store/useAuthStore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const handleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("error in logout:", error.message);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <View className=" flex-1 gap-12 items-center py-4">
        <Text style={{ fontSize: hp(3.7) }} className="font-bold">
          Welcome!
        </Text>
        <View className="item-center">
          {/* Sign in image */}
          <Image
            style={{ width: wp(100), height: hp(20) }}
            resizeMode="contain"
            source={require("../../assets/images/partial-react-logo.png")}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogOut}
          className="bg-red-500 rounded-xl justify-center items-center p-3 "
        >
          <Text
            style={{ fontSize: hp(2.7) }}
            className="text-white font-bold tracking-wider "
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
