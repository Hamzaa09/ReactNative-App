import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSupabase } from "@/hooks/useSupabase";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { userStore } from "@/store/userStore";

const TYPES = ["hall", "outdoor", "rooftop", "banquet", "conference"];
type VenueType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputClass =
  "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800";
const labelClass = "text-sm font-semibold text-gray-700 mb-1.5";
const sectionClass = "mb-5";

interface FormState {
  title: string;
  description: string;
  price_per_hour: string;
  type: VenueType;
  capacity: string;
  area_sqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const InitialForm: FormState = {
  title: "",
  description: "",
  price_per_hour: "",
  type: "hall",
  capacity: "",
  area_sqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function create() {
  const router = useRouter();
  const authSupabase = useSupabase();
  const isAdmin = userStore((state) => state.isAdmin);

  const [form, setForm] = useState(InitialForm);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handleImageUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult)
        Alert.alert(
          "Permission Required",
          "Please provide access to your photo library.",
        );

      setUploadingImages(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        base64: true,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 6,
      });

      if (result.canceled) return;

      const uploadedUrls: string[] = [];
      const previewUris: string[] = [];

      for (const asset of result.assets) {
        try {
          const filename = `venue_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.jpg`;

          const base64 = asset.base64!;
          const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

          const { error } = await authSupabase.storage
            .from("venue-images")
            .upload(filename, buffer, {
              contentType: "image/jpeg",
              upsert: false,
            });

          if (error) throw error;

          const { data: urlData } = authSupabase.storage
            .from("venue-images")
            .getPublicUrl(filename);

          uploadedUrls.push(urlData.publicUrl);
          previewUris.push(asset.uri);
        } catch (err) {
          console.error("Upload error:", err);
          Alert.alert("Upload Failed", "One or more images failed to upload.");
        }
      }

      updateForm({
        images: [...form.images, ...uploadedUrls],
        localImages: [...form.localImages, ...previewUris],
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error updating profile, Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };
  const handleImageRemove = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  const handleFormSubmit = async () => {
    if (!isAdmin) {
      Alert.alert(
        "Access Denied",
        "You must be an admin to perform this action.",
      );

      return;
    }

    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");

    if (!form.price_per_hour)
      return Alert.alert("Validation", "Price is required.");

    const priceNum = Number(form.price_per_hour);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₹0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString("en-IN")}.`,
      );

    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");

    setSubmitting(true);

    const { error } = await authSupabase.from("venues").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price_per_hour: Number(form.price_per_hour),
      type: form.type,
      capacity: Number(form.capacity),
      area_sqft: Number(form.area_sqft),
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      is_featured: form.isFeatured,
      images: form.images,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert("Error", "Failed to create venue. Please try again.");
      console.error(error);
      return;
    }

    setForm(InitialForm);
    Alert.alert("Success! 🎉", "Venue listed successfully.", [
      { text: "OK", onPress: () => router.replace("/(root)/(tabs)/home") },
    ]);
  };

  const handleLocationPick = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to detect coordinates.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch (err) {
      Alert.alert("Error", "Could not detect location. Enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Add Venue
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View className={sectionClass}>
            <Text className={labelClass}>
              Photos{" "}
              <Text className="text-gray-400 font-normal">(up to 6)</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-2xl"
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View className="absolute top-1 left-1 bg-blue-600 px-1.5 py-0.5 rounded-full">
                      <Text className="text-white text-[9px] font-bold">
                        COVER
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleImageRemove(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handleImageUpload}
                  disabled={uploadingImages}
                  className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 items-center justify-center"
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-400 text-xs mt-1">Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View className={sectionClass}>
            <Text className={labelClass}>Title</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. Seaheaven Outdoor Garden"
              placeholderTextColor="#9CA3AF"
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>Description</Text>
            <TextInput
              className={`${inputClass} h-24`}
              placeholder="Describe the venue..."
              placeholderTextColor="#9CA3AF"
              value={form.description ?? ""}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View className={sectionClass}>
            <Text className={labelClass}>Price (2hrs)</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. 5000000"
              placeholderTextColor="#9CA3AF"
              value={form.price_per_hour}
              onChangeText={(v) => updateForm({ price_per_hour: v })}
              keyboardType="numeric"
            />
            <Text className="text-xs text-gray-400 mt-1.5 ml-1">
              Valid range: Rs.1 - Rs.{MAX_PRICE.toLocaleString("en-PK")}
            </Text>
          </View>

          {/* Veneue Type */}
          <View className={sectionClass}>
            <Text className={labelClass}>Veneue Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  className={`px-4 py-2 rounded-full border ${
                    form.type === t
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      form.type === t ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity */}
          <View className={sectionClass}>
            <Text className={labelClass}>Guests Capacity</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. 200"
              placeholderTextColor="#9CA3AF"
              value={form.capacity}
              onChangeText={(v) => updateForm({ capacity: v })}
              keyboardType="numeric"
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>Area (sq ft)</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. 1200"
              placeholderTextColor="#9CA3AF"
              value={form.area_sqft}
              onChangeText={(v) => updateForm({ area_sqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View className={sectionClass}>
            <Text className={labelClass}>Address</Text>
            <TextInput
              className={inputClass}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>City</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. Karachi"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          {/* Coordinates */}
          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className={labelClass}>Coordinates</Text>
              <TouchableOpacity
                onPress={handleLocationPick}
                disabled={detectingLocation}
                className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons name="locate-outline" size={13} color="#2563EB" />
                )}
                <Text className="text-blue-600 text-xs font-semibold">
                  {detectingLocation ? "Detecting..." : "Detect Location"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Toggles */}
          <View className="gap-3 mb-5">
            <Toggle
              label="Featured Venue"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleFormSubmit}
            disabled={submitting || uploadingImages}
            className="bg-blue-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                List Property
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Toggle = ({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    className={`flex-row items-center justify-between p-4 rounded-2xl border ${
      value ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
    }`}
  >
    <View className="flex-1 mr-3">
      <Text
        className={`font-semibold ${value ? "text-blue-700" : "text-gray-700"}`}
      >
        {label}
      </Text>
      {description && (
        <Text className="text-xs text-gray-400 mt-0.5">{description}</Text>
      )}
    </View>
    <View
      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
        value ? "bg-blue-600 border-blue-600" : "border-gray-300"
      }`}
    >
      {value && <Ionicons name="checkmark" size={14} color="white" />}
    </View>
  </TouchableOpacity>
);
