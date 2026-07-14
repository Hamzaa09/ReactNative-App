import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import VenureCard from "@/components/VenueCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { Venue } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useSupabase } from "@/hooks/useSupabase";

interface SavedVenue {
  id: string;
  venue_id: string;
  properties: Venue;
}

export default function saved() {
  const router = useRouter();
  const { userId } = useAuth();
  const authSupabase = useSupabase();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedVenue[]>([]);

  const fetchSavedVenues = async () => {
    if (!userId) return;

    setLoading(true);
    const { data } = await authSupabase
      .from("saved_venues")
      .select("id, venue_id, venues(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });

    setSaved(
      (data ?? []).map((item: any) => ({
        id: item.id,
        venue_id: item.venue_id,
        properties: item.venues,
      })),
    );

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedVenues();
    }, [userId]),
  );

  const handleUnsave = (venue_id: string) => {
    setSaved((prev) => prev.filter((item) => item.venue_id !== venue_id));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Saved</Text>
        {!loading && (
          <Text className="text-sm text-gray-400 mt-1">
            {saved.length} {saved.length === 1 ? "property" : "properties"}{" "}
            saved
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <VenureCard
              venue={item.properties}
              onUnsave={() => handleUnsave(item.venue_id)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={36} color="#EF4444" />
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-1">
                No saved properties
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold">
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
