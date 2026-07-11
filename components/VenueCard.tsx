import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Venue } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "@/lib/utils";

export default function VenureCard({ venue }: { venue: Venue }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/venue/${venue.id}`)}
      className="flex-row bg-white rounded-2xl mb-4 overflow-hidden mx-5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Image */}
      <Image
        source={{ uri: venue.images[0] }}
        className="w-28 h-28"
        resizeMode="cover"
      />

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text
            className="text-sm font-bold text-gray-800 mb-1"
            numberOfLines={1}
          >
            {venue.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={11} color="#6B7280" />
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {venue.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-blue-600 font-bold text-sm">
            PKR: {formatPrice(venue.price_per_hour)}
          </Text>

          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={13} color={"#FBBF24"} />
            <Text className="text-xs text-gray-500">4.5 (120)</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="w-10 items-center pt-3">
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#EF4444" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
