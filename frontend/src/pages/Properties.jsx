import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import { useSearchParams } from "react-router-dom";
import PropertyTopFilters from "@/components/PropertyTopFilters";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const fetchProperties = async (filters = {}) => {
    setLoading(true);

    if (filters.guests) {
      filters.guests = JSON.stringify(filters.guests);
    }

    try {
      const res = await Axios.get(SummaryApi.getPublishedProperties.url, {
        params: filters,
      });
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch published properties");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";
    const area = searchParams.get("area") || "";
    const guests = searchParams.get("guests") ? JSON.parse(searchParams.get("guests")) : null;
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const filters = {
      state,
      city,
      area,
      guests,
      checkIn,
      checkOut,
    };
    fetchProperties(filters);
  }, [searchParams]);


  const handleTopFilters = ({ type, price, sort }) => {
    const filters = {};

    if (type && type !== "All Types") {
      filters.propertyType = type;
    }

    if (price === "Under ₹5,000") {
      filters.maxPrice = 5000;
    } else if (price === "₹5,000 - ₹10,000") {
      filters.minPrice = 5000;
      filters.maxPrice = 10000;
    } else if (price === "₹10,000+") {
      filters.minPrice = 10000;
    }

    if (sort === "Price: Low to High") {
      filters.sort = "price_asc";
    } else if (sort === "Price: High to Low") {
      filters.sort = "price_desc";
    } else if (sort === "Highest Rated") {
      filters.sort = "rating_desc";
    }

    fetchProperties(filters);
  };


  const defaultValues = {
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    area: searchParams.get("area") || "",
    guests: searchParams.get("guests") ? JSON.parse(searchParams.get("guests")) : null,
    checkIn: searchParams.get("checkIn"),
    checkOut: searchParams.get("checkOut"),
  };


  return (
    <div className="max-w-full mx-auto">
      {/* Banner */}
      <div className="relative w-full">
        <img
          src="/propertiesBanner.jpg"
          alt="Properties Banner"
          className="w-full h-72 object-cover"
        />
        <div className="absolute left-1/2 -translate-x-1/2 -mt-[10px] w-full max-w-6xl px-4 z-[9]">
          <PropertyFilters onFilter={fetchProperties} defaultValues={defaultValues} />
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 py-[90px]">

        <PropertyTopFilters
          total={properties.length}
          onChange={handleTopFilters}
        />
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 text-sm">Loading resorts...</p>
          </div>
        ) : !properties.length ? (
          <p className="text-center text-gray-500 py-20">No resorts found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
