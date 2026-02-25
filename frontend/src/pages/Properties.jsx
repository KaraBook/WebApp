import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropertyTopFilters from "@/components/PropertyTopFilters";
import { Star, SlidersHorizontal } from "lucide-react";
import PropertyFilterPopup from "@/components/PropertyFilterPopup";

const PROPERTY_TYPE_LABELS = {
  villa: "Villa",
  tent: "Tent",
  cottage: "Cottage",
  hotel: "Hotel",
  apartment: "Apartment",
};


export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const navigate = useNavigate();

  const propertyTypeFromUrl = searchParams.get("propertyType");

  const [topFilters, setTopFilters] = useState({
    type: propertyTypeFromUrl
      ? PROPERTY_TYPE_LABELS[propertyTypeFromUrl] || "All Types"
      : "All Types",
    price: "All Prices",
    sort: "Recently Added",
  });

  const fetchProperties = async (filters = {}) => {
    setLoading(true);

    const apiParams = { ...filters };

    if (apiParams.guests) {
      apiParams.guests = JSON.stringify(apiParams.guests);
    }

    const res = await Axios.get(SummaryApi.getPublishedProperties.url, {
      params: apiParams,
    });

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

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (checkIn && checkOut) {
      filters.checkIn = checkIn;
      filters.checkOut = checkOut;
    }

    const propertyType = searchParams.get("propertyType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");

    if (propertyType) filters.propertyType = propertyType;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (sort) filters.sort = sort;

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
    else if (topFilters.sort === "Highest Rated") {
      filters.sort = "rating_desc";
    }
    else if (topFilters.sort === "Recently Added") {
      filters.sort = "latest";
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
            <span className=" text-[11px] md:text-xs uppercase tracking-widest text-primary font-semibold">
              Curated stays across top destinations
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-center font-extrabold leading-tight">
            <span className="block text-[#1F2A2E] mb-1">Discover Your</span>
            <span className="block bg-gradient-to-b from-primary text-center to-[#9AA06B] bg-clip-text text-transparent pb-6 md:pb-2">
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
      <div
        className={`
    md:hidden px-2 -mt-[35px] relative
    ${showMobileFilters || showFilterPopup ? "z-40" : "z-9"}
  `}
      >

        <div className="flex gap-2">
          <button
            onClick={() => setShowMobileFilters((p) => !p)}
            className="w-full bg-white rounded-2xl shadow-sm border border-[#E5EAF1] px-4 py-2 flex items-center justify-between"
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
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterPopup(true);
              }}
              className="w-12 h-12 -mr-2 shadow-sm border border-[#E5EAF1] rounded-[10px] bg-[#fff] flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-[#1F2A2E]" />
            </div>

          </button>
        </div>

        <div
          className={`
    transition-all duration-300 ease-out
    ${showMobileFilters
              ? "max-h-[1200px] opacity-100 translate-y-0 mt-3"
              : "max-h-0 opacity-0 -translate-y-2 mt-0"
            }
  `}
        >
          <div className="pt-10 bg-white rounded-2xl ">
            <div className="bg-white rounded-2xl shadow-sm">
              <PropertyFilters
                onFilter={(filters) => {
                  const params = new URLSearchParams();

                  if (filters.state) params.set("state", filters.state);
                  if (filters.city) params.set("city", filters.city);
                  if (filters.area) params.set("area", filters.area);

                  if (filters.checkIn)
                    params.set("checkIn", filters.checkIn.toISOString());
                  if (filters.checkOut)
                    params.set("checkOut", filters.checkOut.toISOString());

                  if (filters.guests)
                    params.set("guests", JSON.stringify(filters.guests));

                  navigate(`/properties?${params.toString()}`);
                }}
                defaultValues={defaultValues}
                enableStickyGlass
              />
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Filters (Desktop only) */}
      <div className="hidden md:block md:sticky md:top-[70px] z-[50]">
        <div className="max-w-7xl mx-auto px-4 -mt-[50px]">
          <PropertyFilters
            onFilter={(filters) => {
              const params = new URLSearchParams();

              if (filters.state) params.set("state", filters.state);
              if (filters.city) params.set("city", filters.city);
              if (filters.area) params.set("area", filters.area);

              if (filters.checkIn)
                params.set("checkIn", filters.checkIn.toISOString());
              if (filters.checkOut)
                params.set("checkOut", filters.checkOut.toISOString());

              if (filters.guests)
                params.set("guests", JSON.stringify(filters.guests));

              navigate(`/properties?${params.toString()}`);
            }}
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
          onChange={(newFilters) => {
            setTopFilters(newFilters);

            const params = new URLSearchParams(searchParams);

            if (newFilters.type && newFilters.type !== "All Types") {
              params.set("propertyType", newFilters.type);
            } else {
              params.delete("propertyType");
            }

            navigate(`/properties?${params.toString()}`);
          }}
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


      <PropertyFilterPopup
        open={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApply={(filters) => {
          const apiFilters = {};

          if (filters.propertyType && filters.propertyType !== "all") {
            apiFilters.propertyType = filters.propertyType;
          }

          if (filters.price) {
            apiFilters.minPrice = filters.price[0];
            apiFilters.maxPrice = filters.price[1];
          }

          if (filters.recommendation === "topRated") {
            apiFilters.sort = "rating_desc";
          }
          if (filters.recommendation === "trending") {
            apiFilters.sort = "popular";
          }
          if (filters.recommendation === "new") {
            apiFilters.sort = "latest";
          }
          const params = new URLSearchParams(searchParams);

          Object.entries(apiFilters).forEach(([k, v]) => {
            params.set(k, v);
          });

          navigate(`/properties?${params.toString()}`);
          setShowFilterPopup(false);
        }}
      />


    </div>
  );
}
