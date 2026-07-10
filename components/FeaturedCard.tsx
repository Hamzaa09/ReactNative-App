import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Venue } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "expo-router";

export default function FeaturedCard({ venue }: { venue: Venue }) {
  const router = useRouter()
  return (
    <TouchableOpacity
      className="w-72 mr-2 rounded-3xl overflow-hidden bg-white"
      onPress={() => router.push(`/(root)/venue/${venue.id}`)}
    >
      <Image source={{ uri: venue.images[0] }} className="w-full h-44" />

      <View className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1">
        <Text className="text-sm font-semibold text-blue-600 capitalize">
          {venue.type}
        </Text>
      </View>

      <View className="p-4">
        <Text
          className="font-bold text-base text-gray-800 mb-1"
          numberOfLines={1}
        >
          {venue.title}
        </Text>

        <View className="flex-row items-center gap-1 mb-3">
          <Ionicons name="location-outline" size={13} color={"#6B7280"} />
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {venue.address + " - " + venue.city}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-baseline">
            <Text className="text-blue-600 font-bold text-base">
              {formatPrice(venue.price_per_hour)}
            </Text>
            <Text className="text-blue-600 font-medium text-xs ml-0.5">
              /2hrs
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={13} color={"#FBBF24"} />
            <Text className="text-xs text-gray-500">4.5 (120)</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
