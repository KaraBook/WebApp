import {
  Wifi, Car, Sun, Tv, Snowflake, Utensils, Trees, Key, Bed, Droplets,
  Shield, Briefcase, PawPrint, Lock, Refrigerator, ShowerHead, CoffeeIcon, Coffee, Moon
} from "lucide-react";

export const propertyTypeOptions = [
  { label: "Villa", value: "villa" },
  { label: "Tent", value: "tent" },
  { label: "Cottage", value: "cottage" },
  { label: "Apartment", value: "apartment" },
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
      { label: "Wi-Fi", value: "wifi", icon: Wifi },
      { label: "Power Backup", value: "powerBackup", icon: Key },
      { label: "Air Conditioning", value: "ac", icon: Snowflake },
      { label: "Ceiling Fan", value: "ceilingFan", icon: Sun },
    ],
  },
  {
    label: "Outdoor & Nature",
    key: "outdoor",
    items: [
      { label: "Garden", value: "garden", icon: Trees },
      { label: "Swimming Pool", value: "pool", icon: Droplets },
    ],
  },
  {
    label: "Kitchen & Dining",
    key: "kitchen",
    items: [
      { label: "Kitchen", value: "kitchen", icon: Utensils },
      { label: "Refrigerator", value: "fridge", icon: Refrigerator },
      { label: "Dining Area", value: "diningArea", icon: Utensils },
    ],
  },
  {
    label: "Entertainment",
    key: "entertainment",
    items: [
      { label: "Television", value: "tv", icon: Tv },
    ],
  },
  {
    label: "Parking",
    key: "parking",
    items: [
      { label: "Parking", value: "parking", icon: Car },
    ],
  },
  {
    label: "Pets",
    key: "pets",
    items: [
      { label: "Pet Friendly", value: "petFriendlyAmenity", icon: PawPrint },
    ],
  },
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

export const petFriendlyOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];