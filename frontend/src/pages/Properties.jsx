import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import { useSearchParams } from "react-router-dom";
import PropertyTopFilters from "@/components/PropertyTopFilters";
import { Star, SlidersHorizontal } from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);


  const [topFilters, setTopFilters] = useState({
    type: "All Types",
    price: "All Prices",
    sort: "Recommended",
  });

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
    const filters = {};

    const state = searchParams.get("state");
    const city = searchParams.get("city");
    if (state) filters.state = state;
    if (city) filters.city = city;

    const guestsParam = searchParams.get("guests");
    if (guestsParam) {
      filters.guests = JSON.parse(guestsParam);
    }

    if (topFilters.type && topFilters.type !== "All Types") {
      filters.propertyType = topFilters.type.toLowerCase();
    }

    if (topFilters.price === "Under ₹5,000") {
      filters.maxPrice = 5000;
    }
    else if (topFilters.price === "₹5,000 - ₹10,000") {
      filters.minPrice = 5000;
      filters.maxPrice = 10000;
    }
    else if (topFilters.price === "₹10,000+") {
      filters.minPrice = 10000;
    }

    if (topFilters.sort === "Price: Low to High") {
      filters.sort = "price_asc";
    }
    else if (topFilters.sort === "Price: High to Low") {
      filters.sort = "price_desc";
    }

    fetchProperties(filters);
  }, [searchParams, topFilters]);


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
      <div className="relative w-full p-[10px] md:p-[20px] bg-[#E6F4F1]">
        <div className="flex items-center flex-col pt-[20px] gap-[10px] md:pt-[80px] pb-[20px] md:pb-[140px]">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="h-4 w-4 text-accent fill-yellow-400" />
            <span className="text-sm font-medium text-primary">
              Curated stays across top destinations
            </span>
          </div>

          <h1 className="font-display text-[42px] md:text-6xl lg:text-7xl font-bold leading-tight text-center">
            <span className="block text-[#1F2A2E]">Discover Your</span>
            <span className="block pb-[18px] bg-gradient-to-b from-primary to-[#9AA06B] bg-clip-text text-transparent">
              Perfect Gateway
            </span>
          </h1>
        </div>

        {/* Floating images */}
        <img src="/banimg1.jpg" className="hidden md:block w-[160px] rounded-[12px] absolute top-[10%] left-[18%]" />
        <img src="/banimg1.jpg" className="hidden md:block w-[200px] rounded-[12px] absolute top-[48%] left-[10%]" />
        <img src="/banimg1.jpg" className="hidden md:block w-[200px] rounded-[12px] absolute top-[10%] right-[16%]" />
        <img src="/banimg1.jpg" className="hidden md:block w-[160px] rounded-[12px] absolute top-[54%] right-[10%]" />
      </div>


      {/* Mobile Search Trigger + Inline Filters */}
      <div className="md:hidden px-2 -mt-[35px] z-30 relative">
        <button
          onClick={() => setShowMobileFilters((p) => !p)}
          className="w-full bg-white rounded-2xl shadow-sm border border-[#E5EAF1] px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAF4F2] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-[#1F2A2E]">Where to?</p>
              <p className="text-xs text-[#64748B]">
                Add dates · Add guests
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#F4F1EB] flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-[#1F2A2E]" />
          </div>
        </button>

        {/* 👇 INLINE FILTERS (EXPAND BELOW) */}
        {showMobileFilters && (
          <div className="mt-12 bg-white rounded-2xl shadow-sm p-0">
            <PropertyFilters
              onFilter={(filters) => {
                fetchProperties(filters);
                setShowMobileFilters(false);
              }}
              defaultValues={defaultValues}
            />
          </div>
        )}
      </div>

      {/* Sticky Filters (Desktop only) */}
      <div className="hidden md:block md:sticky md:top-[70px] z-[50]">
        <div className="max-w-6xl mx-auto px-4 -mt-[50px]">
          <PropertyFilters
            onFilter={fetchProperties}
            defaultValues={defaultValues}
            enableStickyGlass
          />
        </div>
      </div>


      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-[50px]">
        <PropertyTopFilters
          total={properties.length}
          value={topFilters}
          onChange={setTopFilters}
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
