import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";

const ios = Platform.OS == "ios";

export function CustomKeyboardView({ children }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={ios ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
