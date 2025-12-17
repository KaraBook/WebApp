import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import { useSearchParams } from "react-router-dom";
import PropertyTopFilters from "@/components/PropertyTopFilters";
import { Star } from "lucide-react";

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
      <div className="relative w-full p-[20px] bg-[#E6F4F1]">
        <div className="flex items-center flex-col pt-[80px] pb-[140px]">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="h-4 w-4 text-accent fill-yellow-400" />
            <span className="text-sm font-medium text-primary">
              Curated stays across top destinations
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-center">
            <span className="block text-[#1F2A2E]">Discover Your</span>
            <span className="block pb-[18px] bg-gradient-to-b from-primary to-[#9AA06B] bg-clip-text text-transparent">
              Perfect Gateway
            </span>
          </h1>
        </div>

        {/* Floating images */}
        <img src="/banimg1.jpg" className="w-[160px] rounded-[12px] absolute top-[10%] left-[18%]" />
        <img src="/banimg1.jpg" className="w-[200px] rounded-[12px] absolute top-[48%] left-[10%]" />
        <img src="/banimg1.jpg" className="w-[200px] rounded-[12px] absolute top-[10%] right-[18%]" />
        <img src="/banimg1.jpg" className="w-[160px] rounded-[12px] absolute top-[54%] right-[10%]" />
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-[70px] z-[50]">
        <div className="max-w-6xl mx-auto px-4 -mt-[50px]">
          <PropertyFilters
            onFilter={fetchProperties}
            defaultValues={defaultValues}
          />
        </div>
      </div>


      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-[100px]">
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
