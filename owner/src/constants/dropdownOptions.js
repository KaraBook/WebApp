import {
  Wifi, Car, Sun, Tv, Snowflake, Utensils, Trees, Key, Bed, Droplets,
  Shield, Briefcase, PawPrint, Lock, Refrigerator, ShowerHead, CoffeeIcon, Coffee, Moon
} from "lucide-react";

export const propertyTypeOptions = [
  { label: "Villa", value: "villa" },
  { label: "Tent", value: "tent" },
  { label: "Cottage", value: "cottage" },
  { label: "Apartment", value: "apartment" },
  { label: "Hotel", value: "hotel" },
];

export const foodOptions = [
  { label: "Breakfast", value: "breakfast", icon: Coffee },
  { label: "Lunch", value: "lunch", icon: Sun },
  { label: "Dinner", value: "dinner", icon: Moon },
];

export const amenitiesOptions = [
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
      { label: "Dining Area", value: "diningArea", icon: Utensils },
      { label: "Glasses", value: "glasses", icon: Utensils },
      { label: "Tea", value: "tea", icon: Utensils },
      { label: "Microwave", value: "microwave", icon: Utensils },
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
      { label: "Transport", value: "transport", icon: Car },
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

export const confirmationTypeOptions = [
  { label: "Auto", value: "auto" },
  { label: "Manual", value: "manual" },
];

export const approvalStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const kycVerifiedOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const publishNowOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const featuredOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];


export const formSteps = [
  { id: 1, title: "Owner & Property" },
  { id: 2, title: "Accomodation & Pricing" },
  { id: 3, title: "Features" },
  { id: 4, title: "Legal & Admin" },
  { id: 5, title: "Media Uploads" }
];

