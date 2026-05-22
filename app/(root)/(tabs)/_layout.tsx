import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Text, View } from "react-native";

export default function TabsLayout() {

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <Icon sf="heart.fill" />
        <Label>Saved</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}