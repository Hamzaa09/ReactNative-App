import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useSignUp } from "@clerk/expo";
import { Link } from "expo-router";

export default function Page() {
  const { errors, fetchStatus, signUp } = useSignUp();

  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  const handleSignUP = async () => {
    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress: email,
      password
    })

    if (error) alert(error.message)

    if (!error) await signUp.verifications.sendEmailCode()
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="bg-white h-screen"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex justify-center px-6 py-12">
        <View className="w-full flex justify-center items-center">
          <Image
            source={require("../../assets/images/logo.png")}
            resizeMode="contain"
            className="w-56 h-56
          "
          />
        </View>
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Create account
        </Text>
        <Text className="text-gray-500 mb-8">Find your dream home today</Text>

        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            placeholder="First Name"
            placeholderTextColor={"#9ca3af"}
            value="First Name"
            onChangeText={setfirstName}
            autoCapitalize="words"
          />

          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            placeholder="Last Name"
            placeholderTextColor={"#9ca3af"}
            value="Last Name"
            onChangeText={setlastName}
            autoCapitalize="words"
          />
        </View>

        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Email"
          placeholderTextColor={"#9ca3af"}
          value="Email"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <Text className="text-red-500 mb-4">
            {errors.fields.emailAddress.message};
          </Text>
        )}

        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Password"
          placeholderTextColor={"#9ca3af"}
          value="Password"
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.fields.password && (
          <Text className="text-red-500 mb-4">
            {errors.fields.password.message};
          </Text>
        )}
        <TouchableOpacity
          onPress={handleSignUP}
          disabled={isLoading}
          className="bg-blue-600 w-full py-4 mb-4 rounded-xl items-center"
        >
          {!isLoading ? (
            <Text className="text-white font-bold text-base">Sign Up</Text>
          ) : (
            <ActivityIndicator color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center">
        <Text className="text-gray-500">Already have an account?</Text>
        <Link href="/sign-in" className="text-blue-600 font-semibold">
          {" "}
          Sign In
        </Link>

        <View nativeID="clerk-captcha"/>
      </View>
    </ScrollView>
  );
}
