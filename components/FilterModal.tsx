import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { filterStore } from "@/store/filterStore";
import { Ionicons } from "@expo/vector-icons";
import { VenueType } from "@/types/index";

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
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
    resetFilters,
  } = filterStore();

  const [localMinPrice, setLocalMinPrice] = useState(
    minPrice ? String(minPrice) : "",
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    minPrice ? String(maxPrice) : "",
  );

  const activeFilters = [type, location, maxPrice, minPrice].filter(
    (v) => v !== null,
  ).length;

  const handleApply = () => {
    setMinPrice(localMinPrice ? Number(localMinPrice) : null);
    setMaxPrice(localMaxPrice ? Number(localMaxPrice) : null);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    onClose();
  };

  const types: { label: string; value: VenueType | null }[] = [
    { label: "All", value: null },
    { label: "Hall", value: "hall" },
    { label: "Outdoor", value: "outdoor" },
    { label: "Rooftop", value: "rooftop" },
    { label: "Banquet", value: "banquet" },
    { label: "Conference", value: "conference" },
  ];

  const local_location = [
    { label: "Any", value: null },
    { label: "Karachi", value: "karachi" },
    { label: "Lahore", value: "lahore" },
    { label: "Islamabad", value: "islamabad" },
    { label: "Peshawar", value: "peshawar" },
    { label: "Quetta", value: "quetta" },
  ];

  const price_presets = [
    { label: "Under 5K", min: null, max: 5000 },
    { label: "5K - 10K", min: 5000, max: 10000 },
    { label: "10K - 100K", min: 10000, max: 100000 },
    { label: "Above 100k", min: 100000, max: null },
  ];

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full border ${
      active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
    }`;

  const chipText = (active: boolean) =>
    `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

  return (
    <Modal
      visible={visible}
      className="rounded-xl"
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Header */}
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-5 pt-6 pb-4 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-blue-600 font-semibold text-sm">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Venue */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Venue Type
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-6">
            {types.map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                onPress={() => setType(item.value as VenueType)}
                className={chip(type === item.value)}
              >
                <Text className={chipText(type === item.value)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location  */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Location
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-6">
            {local_location.map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                onPress={() => setLocation(item.value)}
                className={chip(location === item.value)}
              >
                <Text className={chipText(location === item.value)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* price range  */}
          <Text className="text-base font-bold text-gray-800 mb-3">
            Price Range (PKR)
          </Text>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1.5 font-medium">
                Min Price
              </Text>

              <View className="flex-row items-center bg-white rounded-2xl px-3 border border-gray-200">
                <Text className="text-gray-400 text-sm mr-1">Rs.</Text>

                <TextInput
                  className="flex-1 py-3 text-gray-800"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={localMinPrice}
                  onChangeText={setLocalMinPrice}
                />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1.5 font-medium">
                Max Price
              </Text>

              <View className="flex-row items-center bg-white rounded-2xl px-3 border border-gray-200">
                <Text className="text-gray-400 text-sm mr-1">Rs.</Text>

                <TextInput
                  className="flex-1 py-3 text-gray-800"
                  placeholder="Any"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={localMaxPrice}
                  onChangeText={setLocalMaxPrice}
                />
              </View>
            </View>
          </View>

          {/* Presets  */}
          <View className="flex-row flex-wrap gap-2">
            {price_presets.map((p) => {
              const active = p.min === minPrice && maxPrice === p.max;

              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => {
                    setLocalMinPrice(p.min ? String(p.min) : "");
                    setLocalMaxPrice(p.max ? String(p.max) : "");
                    setMinPrice(p.min);
                    setMaxPrice(p.max);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      active ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleApply}
            className="bg-blue-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-bold text-base">
              Apply Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
