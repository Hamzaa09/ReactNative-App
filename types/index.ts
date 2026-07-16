export type VenueType = 'hall' | 'outdoor' | 'rooftop' | 'banquet' | 'conference';

export interface Venue {
  id: string;                    // uuid
  title: string;
  description: string | null;
  price_per_hour: number;        // numeric → number
  type: VenueType;
  capacity: number;              // max guests
  area_sqft: number | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];              // array of URLs
  is_featured: boolean;
  is_available: boolean;
  created_at: string;            // ISO 8601 timestamp string
}