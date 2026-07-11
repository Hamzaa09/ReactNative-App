import { create } from "zustand";
import { VenueType } from "@/types/index";

interface FilterStore {
  search: string;
  type: VenueType | null;
  minPrice: Number | null;
  maxPrice: Number | null;
  location: string | null;

  setSearch: (search: string) => void;
  setType: (type: VenueType) => void;
  setMinPrice: (minPrice: Number | null) => void;
  setMaxPrice: (maxPrice: Number | null) => void;
  setLocation: (location: string | null) => void;
  resetFilters: () => void;
}

export const filterStore = create<FilterStore>((set) => ({
  search: "",
  type: null,
  minPrice: null,
  maxPrice: null,
  location: null,

  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setLocation: (location) => set({ location }),
  resetFilters: () =>
    set({
      search: "",
      type: null,
      minPrice: null,
      maxPrice: null,
      location: null,
    }),
}));
