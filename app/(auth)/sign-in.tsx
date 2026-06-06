import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";

export default function Page() {
  const { errors, fetchStatus, signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const isLoading = fetchStatus === "fetching";

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({
      code,
    });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return;
          }

          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };

  const handleSignIn = async () => {
    const { error } = await signIn.password({
      identifier: email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return;
          }

          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
      setPendingVerification(true);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="bg-white"
        >
          <View className="flex justify-center px-6 py-12 bg-white">
            <View className="w-full flex justify-center items-center">
              <Image
                source={require("../../assets/images/logo.png")}
                resizeMode="contain"
                className="w-56 h-56
          "
              />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Verify account
            </Text>
            <Text className="text-gray-500 mb-8">Sent code to {email}</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Enter Verification Code"
              placeholderTextColor={"#9ca3af"}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            {errors?.fields?.code && (
              <Text className="text-red-500 mb-4">
                {errors?.fields?.code.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={isLoading}
              className="bg-blue-600 w-full py-4 mb-4 rounded-xl items-center"
            >
              {!isLoading ? (
                <Text className="text-white font-bold text-base">Verify</Text>
              ) : (
                <ActivityIndicator color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => signIn.mfa.sendEmailCode()}
              className="py-2"
            >
              <Text className="text-blue-600">Resend Code</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  } else {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="bg-white"
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
              Welcome Back
            </Text>
            <Text className="text-gray-500 mb-8">Login to your account</Text>

            <TextInput
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Email"
              placeholderTextColor={"#9ca3af"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {errors?.fields?.identifier && (
              <Text className="text-red-500 mb-4">
                {errors?.fields?.identifier.message}
              </Text>
            )}

            <TextInput
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Password"
              placeholderTextColor={"#9ca3af"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors?.fields?.password && (
              <Text className="text-red-500 mb-4">
                {errors?.fields?.password.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className="bg-blue-600 w-full py-4 mb-4 rounded-xl items-center"
            >
              {!isLoading ? (
                <Text className="text-white font-bold text-base">Sign In</Text>
              ) : (
                <ActivityIndicator color="white" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don&apos;t have an account?</Text>
            <Link href="/sign-up" className="text-blue-600 font-semibold">
              {" "}
              Sign Up
            </Link>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
