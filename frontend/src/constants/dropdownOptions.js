import {
  Wifi, Car, Sun, Tv, Snowflake, Utensils, Trees, Key, Bed, Droplets,
  Shield, Briefcase, PawPrint, Lock, Refrigerator, ShowerHead
} from "lucide-react";

export const amenitiesCategories = [
  {
    label: "Basics",
    key: "basics",
    items: [
      { label: "Free Wi-Fi", value: "wifi", icon: Wifi },
      { label: "Power backup / inverter", value: "powerBackup", icon: Key },
      { label: "Air conditioning", value: "ac", icon: Snowflake },
      { label: "Room heater", value: "heater", icon: Sun },
      { label: "Ceiling fan", value: "ceilingFan", icon: Sun },
    ]
  },

  {
    label: "Outdoor & Nature",
    key: "outdoor",
    items: [
      { label: "Garden", value: "garden", icon: Trees },
      { label: "Swimming Pool", value: "pool", icon: Droplets },
    ]
  },

  {
    label: "Safety & Security",
    key: "safety",
    items: [
      { label: "CCTV", value: "cctv", icon: Shield },
      { label: "Fire Extinguisher", value: "fireExt", icon: Shield },
      { label: "First Aid Kit", value: "firstAid", icon: Shield },
    ]
  },

  {
    label: "Work & Business",
    key: "work",
    items: [
      { label: "Work Desk", value: "workDesk", icon: Briefcase },
      { label: "High-speed Wifi", value: "highSpeedWifi", icon: Wifi },
    ]
  },

  {
    label: "Bedroom & Laundry",
    key: "bedroom",
    items: [
      { label: "King Bed", value: "kingBed", icon: Bed },
      { label: "Wardrobe", value: "wardrobe", icon: Lock },
      { label: "Shower", value: "shower", icon: ShowerHead },
    ]
  },

  {
    label: "Kitchen & Dining",
    key: "kitchen",
    items: [
      { label: "Kitchen", value: "kitchen", icon: Utensils },
      { label: "Refrigerator", value: "fridge", icon: Refrigerator },
      { label: "Tea", value: "tea", icon: Utensils },
      { label: "Dining Area", value: "diningArea", icon: Utensils },
    ]
  },

  {
    label: "Entertainment",
    key: "entertainment",
    items: [
      { label: "Television", value: "tv", icon: Tv },
      { label: "Music System", value: "musicSystem", icon: Tv },
    ]
  },

  {
    label: "Parking & Transport",
    key: "transport",
    items: [
      { label: "Parking", value: "parking", icon: Car },
    ]
  },

  {
    label: "Pets & Eco",
    key: "pets",
    items: [
      { label: "Pet Friendly", value: "petFriendlyAmenity", icon: PawPrint },
    ]
  },

  {
    label: "House Rules",
    key: "rules",
    items: [
      { label: "Smoking Allowed", value: "smoking", icon: Sun },
      { label: "Alcohol Allowed", value: "alcohol", icon: Sun },
    ]
  }
];
