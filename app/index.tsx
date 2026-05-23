import { Text, View } from "react-native";
import '../global.css'
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  return (
    <Redirect href="/(root)/(tabs)/home" />
  );
}
