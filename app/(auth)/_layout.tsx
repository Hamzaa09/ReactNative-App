import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={"/(root)/(tabs)/home"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1 }, // <-- this is the key
      }}
    />
  );
}
