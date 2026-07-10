import FeaturedCard from "@/components/FeaturedCard";
import VenureCard from "@/components/VenureCard";
import { supabase } from "@/lib/supabase";
import { Venue } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { PropsFilter } from "react-native-reanimated/lib/typescript/createAnimatedComponent/PropsFilter";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  const [recommended, setRecommended] = useState<Venue[]>([]);
  const [featured, setFeatured] = useState<Venue[]>([]);

  const fetchVenues = async () => {
    setLoading(true);

    try {
      const { data: featuredVenues } = await supabase
        .from("venues")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: true });

      const { data: recommendedVenues } = await supabase
        .from("venues")
        .select("*")
        .eq("is_featured", false)
        .order("created_at", { ascending: true });

      // console.log(recommendedVenues);
      // console.log(featuredVenues);

      setRecommended(recommendedVenues ?? []);
      setFeatured(featuredVenues ?? []);
    } catch (error) {
      console.log("Error fetching venues!");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVenues();
    }, []),
  );

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <FlatList
        data={recommended}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* HEader  */}
            <View className="flex-row items-center justify-between pr-5 py-5">
              <Image
                source={require("@/assets/images/logo_2.png")}
                resizeMode="contain"
                style={{ width: 90, height: 56 }}
              />

              <View className="items-end">
                <Text>Welcome back!</Text>
                <Text className="text-gray-900 text-base font-bold">
                  {user?.lastName ?? "User"}
                </Text>
              </View>
            </View>

            {/* Search Bar  */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="mx-5 mb-6 flex-row items-center bg-white rounded-2xl py-3 px-4 gap-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 flex-1 text-sm">
                Search Venues...
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                className="h-8 w-8 bg-blue-600 rounded-xl justify-center items-center"
              >
                <Ionicons name="options-outline" size={15} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured  */}
            <View>
              <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
                Featured
              </Text>

              {loading ? (
                <ActivityIndicator
                  size={"small"}
                  className="py-10"
                  color={"#2563EB"}
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard venue={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              )}
            </View>

            {/* Recommended  */}
            <Text className="text-gray-900 text-lg font-bold px-5 my-4">
              Recommended
            </Text>
          </View>
        }
        renderItem={({ item }) => <VenureCard venue={item} />}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10">
              <Text className="text-gray-400">No venue found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
