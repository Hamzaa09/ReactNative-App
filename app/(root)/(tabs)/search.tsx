import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { filterStore } from "@/store/filterStore";
import FilterModal from "@/components/FilterModal";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Venue } from "@/types";
import VenureCard from "@/components/VenueCard";

export default function search() {
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Venue[]>([]);

  const {
    search,
    type,
    location,
    maxPrice,
    minPrice,
    setLocation,
    setMaxPrice,
    setMinPrice,
    setType,
    setSearch,
  } = filterStore();

  const activeFilterCount = [
    type !== null,
    location !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  const fetchResults = async () => {
    setLoading(true);

    let query = supabase.from("venues").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (location) {
      query = query.ilike("city", `%${location}%`);
    }

    if (minPrice !== null) {
      query = query.gte("price_per_hour", minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte("price_per_hour", maxPrice);
    }

    const { data } = await query.order("created_at", { ascending: true });

    setLoading(false);
    setResults(data ?? []);
  };

  useEffect(() => {
    fetchResults();
  }, [search, type, location, minPrice, maxPrice]);

  return (
    <SafeAreaView>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl text-gray-900 font-bold mb-4">
          Find Venues
        </Text>
      </View>

      <View className="flex-row items-center gap-3 px-5">
        <View
          className="flex-1 flex-row items-center bg-white rounded-2xl px-4 gap-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3 text-gray-800"
            placeholder="Search by title or city..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={"#9ca3af"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button  */}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          className={`w-12 h-12 rounded-2xl items-center justify-center ${
            activeFilterCount > 0 ? "bg-blue-600" : "bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFilterCount > 0 ? "#fff" : "#374151"}
          />
          {activeFilterCount > 0 && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-[9px] font-bold">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters  */}
      {activeFilterCount > 0 && (
        <View className="flex-row flex-wrap gap-3 mt-3 px-5">
          {[
            {
              key: "type",
              onClear: () => setType(null),
              show: !!type,
              label: type
                ? String(type).at(0)?.toUpperCase() + String(type).slice(1)
                : "",
            },
            {
              key: "location",
              onClear: () => setLocation(null),
              show: !!location,
              label: location
                ? String(location).at(0)?.toUpperCase() +
                  String(location).slice(1)
                : "",
            },
            {
              key: "price",
              onClear: () => {
                setMinPrice(null);
                setMaxPrice(null);
              },
              show: !!(minPrice || maxPrice),
              label:
                minPrice && maxPrice
                  ? `PKR: ${formatPrice(Number(minPrice))} - ${formatPrice(Number(maxPrice))}`
                  : minPrice
                    ? `PKR: ${formatPrice(Number(minPrice))}+`
                    : `PKR: up to ${formatPrice(Number(maxPrice))}`,
            },
          ].map((filter) => {
            if (!filter.show) return null;
            return (
              <View
                key={filter.key}
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1 mb-4"
              >
                <Text className="text-blue-700 text-xs font-semibold">
                  {filter.label}
                </Text>
                <TouchableOpacity onPress={filter.onClear}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Results  */}
      <FlatList
        data={results}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="text-sm px-8 mb-4">
            <Text className="text-gray-400">
              {loading ? "Searching..." : `${results.length} venues found`}
            </Text>
          </View>
        }
        renderItem={({ item }) => <VenureCard venue={item} />}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10">
              <Text className="text-gray-400">No venue found</Text>
              <Text className="text-gray-400 mt-1 text-sm">
                Try a different search or adjust your filters.
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size={"large"}
              className="py-20"
              color={"#2563EB"}
            />
          )
        }
      />

      {/* Filter Modal  */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
