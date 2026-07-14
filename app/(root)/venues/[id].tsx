import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import React, { useEffect, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { userStore } from "@/store/userStore";
import { useAuth } from "@clerk/expo";
import { Venue } from "@/types";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useSavedVenue } from "@/hooks/useSavedVenue";
import { formatPrice } from "@/lib/utils";

const { width } = Dimensions.get("window");

export default function VenueDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuth();
  const isAdmin = userStore((state) => state.isAdmin);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewer, setImageViewer] = useState(false);

  const { saveLoading, isSaved, toggleSave } = useSavedVenue(id);

  const authSupabase = useSupabase();

  const fetchVenue = async () => {
    const { data } = await supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();

    setLoading(false);
    setVenue(data);
  };

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const isLongDesc = (venue?.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? venue?.description
      : venue?.description?.slice(0, 150) + "...";

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    67.0356527 - 0.003
  }%2C${24.8239058 - 0.003}%2C${67.0356527 + 0.003}%2C${
    24.8239058 + 0.003
  }&layer=mapnik&marker=${venue?.latitude}%2C${venue?.longitude}`;

  if (!venue)
    return (
      <View>
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-500">Property not found</Text>
        </View>
      </View>
    );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);

    setActiveIndex(index);
  };

  const handleDelete = () => {
    Alert.alert("Delete Venue", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await authSupabase.from("venues").delete().eq("id", id);
          router.replace("/(root)/(tabs)/home");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View>
            <FlatList
              data={venue.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewer(true)}>
                  <Image
                    resizeMode="cover"
                    source={{ uri: item }}
                    style={{ width, height: 300 }}
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* Image count  */}
          <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">
              {activeIndex + 1}/{venue.images.length}
            </Text>
          </View>

          {/* back & save  */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Ionicons name="arrow-back" size={20} color="#111827" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? "#EF4444" : "#111827"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Details  */}
        <View className="px-5 pt-5 pb-8">
          {/* Badges */}
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-blue-600 text-xs font-semibold capitalize">
                {venue.type}
              </Text>
            </View>
            {venue.is_featured && (
              <View className="bg-amber-50 px-3 py-1 rounded-full">
                <Text className="text-amber-600 text-xs font-semibold">
                  Featured
                </Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {venue.title}
          </Text>
          <Text className="text-blue-600 text-xl font-bold mb-4">
            {formatPrice(venue.price_per_hour)}
            <Text className="text-blue-600 font-medium text-xs ml-0.5">
              /2hrs
            </Text>
          </Text>

          {/* Specs Row */}
          <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4 mb-5">
            <SpecItem
              icon="people-outline"
              label="Capacity"
              value={`${venue.capacity} guests`}
            />
            <SpecItem
              icon="expand-outline"
              label="Area"
              value={venue.area_sqft ? `${venue.area_sqft} ft²` : "N/A"}
            />
            <SpecItem icon="home-outline" label="Type" value={venue.type} />
          </View>

          {/* Description */}
          <Text className="text-base font-bold text-gray-900 mb-2">
            Description
          </Text>
          <Text className="text-gray-500 text-sm leading-6 mb-1">
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text className="text-blue-600 text-sm font-medium mb-5">
                {expanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* Location */}
          <Text className="text-base font-bold text-gray-900 mb-2">
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm flex-1">
              {venue.address}, {venue.city}
            </Text>
          </View>

          {/* Map Preview */}
          <TouchableOpacity
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ height: 200 }}
            onPress={() =>
              Linking.openURL(
                "https://www.google.com/maps?q=24.8239058,67.0356527",
              )
            }
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={12} color="#374151" />
              <Text className="text-gray-600 text-xs font-medium">
                Tap to expand
              </Text>
            </View>
          </TouchableOpacity>

          {/* contact button  */}
          <TouchableOpacity
            onPress={() => Linking.openURL("https://wa.me/+92-3485379552")}
            className="flex-row items-center justify-center gap-2 bg-blue-600 py-4 rounded-2xl mb-4"
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="text-white font-bold text-base">
              Contact Agent
            </Text>
          </TouchableOpacity>

          {/* Delete button  */}
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 py-4 rounded-2xl border border-red-100"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text className="text-red-500 font-semibold">Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={20} color="#2563EB" />
      <Text className="text-gray-900 font-bold text-sm">{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}
