import { useAuth } from "@clerk/expo";
import { useSupabase } from "./useSupabase";
import { useEffect, useState, useCallback } from "react";

export function useSavedVenue(venueId: string) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();

  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const checkIsSaved = useCallback(async () => {
    if (!userId || !venueId) return;

    const { data, error } = await authSupabase
      .from("saved_venues")
      .select("*")
      .eq("user_clerk_id", userId)
      .eq("venue_id", venueId)
      .maybeSingle();

    if (error) {
      console.error("Failed to check saved venue:", error);
      return;
    }

    setIsSaved(!!data);
  }, [userId, venueId, authSupabase]);

  useEffect(() => {
    checkIsSaved();
  }, [checkIsSaved]);

  const toggleSave = async () => {
    if (!userId || saveLoading) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        const { error } = await authSupabase
          .from("saved_venues")
          .delete()
          .eq("user_clerk_id", userId)
          .eq("venue_id", venueId);

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await authSupabase
          .from("saved_venues")
          .insert({ user_clerk_id: userId, venue_id: venueId });

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle saved venue:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  return { isSaved, saveLoading, toggleSave };
}
