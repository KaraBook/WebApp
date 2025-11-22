import { Wifi, Car, Sun, Tv, Snowflake, Utensils, Trees, Key, Bed, Droplets } from "lucide-react";

export const propertyTypeOptions = [
  { label: "Villa", value: "villa" },
  { label: "Tent", value: "tent" },
  { label: "Cottage", value: "cottage" },
  { label: "Apartment", value: "apartment" },
];

export const foodOptions = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
];

export const amenitiesOptions = [
  { label: "WiFi", value: "wifi", icon: Wifi },
  { label: "Parking", value: "parking", icon: Car },
  { label: "Swimming Pool", value: "pool", icon: Droplets },
  { label: "Air Conditioning", value: "ac", icon: Snowflake },
  { label: "Television", value: "tv", icon: Tv },
  { label: "Kitchen", value: "kitchen", icon: Utensils },
  { label: "Garden", value: "garden", icon: Trees },
  { label: "Private Entrance", value: "privateEntrance", icon: Key },
  { label: "King Bed", value: "kingBed", icon: Bed },
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
  { id: 2, title: "Location Details" },
  { id: 3, title: "Accomodation & Pricing" },
  { id: 4, title: "Features" },
  { id: 5, title: "Legal & Admin" },
  { id: 6, title: "Media Uploads" }
];

export const petFriendlyOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];