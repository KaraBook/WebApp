import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  // Fetch featured properties for the scrolling section
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await Axios.get(SummaryApi.getPublishedProperties.url);
        if (res.data.success) {
          setProperties(res.data.data.slice(0, 10)); // show top 10
        }
      } catch (err) {
        console.error("Failed to fetch featured properties:", err);
      }
    };
    fetchFeatured();
  }, []);

  const handleFilter = (filters) => {
    const query = new URLSearchParams({
      state: filters.state,
      city: filters.city,
      guests: filters.guests,
      checkIn: filters.checkIn.toISOString(),
      checkOut: filters.checkOut.toISOString(),
    }).toString();
    navigate(`/properties?${query}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ---------- HERO BANNER ---------- */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">
            Discover Stays That Feel Like <span className="text-[#efcc61]">Home</span>
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto">
            Find beautiful resorts, villas, and getaways across India — book your next escape effortlessly.
          </p>
        </motion.div>

        {/* Filter Box (overlapping bottom) */}
        <div className="absolute bottom-[20px] w-full flex justify-center px-4">
          <div className="max-w-6xl w-full">
            <PropertyFilters onFilter={handleFilter} />
          </div>
        </div>
      </section>

      {/* ---------- DISCOVER SECTION ---------- */}
      <section className="bg-white py-32 px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-10 max-w-7xl mx-auto">
        {/* Left Text */}
        <div className="lg:w-1/3 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#233b19] mb-3">
            Explore Handpicked Resorts
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            Each property is selected to give you an unforgettable experience — from hillside retreats to beachfront villas.
          </p>
          <button
            onClick={() => navigate("/properties")}
            className="bg-[#efcc61] text-black px-6 py-2.5 rounded-full font-medium hover:bg-[#e6be49] transition-all"
          >
            View All Properties
          </button>
        </div>

        {/* Right Scroll Section */}
        <div className="lg:w-2/3 relative overflow-hidden">
          <div className="flex gap-4 animate-scroll">
            {[...properties, ...properties].map((property, i) => (
              <div key={i} className="min-w-[260px] flex-shrink-0">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
