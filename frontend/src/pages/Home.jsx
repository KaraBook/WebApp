import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

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
    <div className="flex flex-col min-h-screen relative">
      <section className="relative w-full h-[90vh] flex items-center justify-center">
        <img
          src="/bannerImg1.webp"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-5xl tracking-[2px] uppercase font-[500] mb-3">
            Discover Stays That Feel Like Home
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto">
            Find beautiful resorts, villas, and getaways across India — book your next escape effortlessly.
          </p>
        </motion.div>


        <div className="absolute -bottom-[50px] w-full flex justify-center px-4 z-10">
          <div className="max-w-6xl w-full">
            <PropertyFilters onFilter={handleFilter} />
          </div>
        </div>
      </section>



      {/* SECTION : Find Your Perfect Stay */}
      <section className="w-full bg-[#faf7f4] py-16 mt-36 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between md:grid-cols-2 gap-10">

          {/* LEFT TEXT BLOCK */}
          <div className="flex flex-col w- justify-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug text-gray-900">
              Find Your <br /> Perfect Stay
            </h2>

            <p className="text-gray-600 mt-4 max-w-sm leading-relaxed">
              Experience the best of Maharashtra, from city life to coastal and hill
              escapes. Find beautiful homes designed for comfort and style.
            </p>

            <button className="mt-6 inline-flex items-center gap-2 text-gray-900 font-medium group">
              Explore Beautiful Stays
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* RIGHT CATEGORY CARDS */}
          <div className="flex w-[60%] gap-6">

            {/* CARD 1 - Villas */}
            <div className="bg-white w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                className="h-[300px] object-cover"
              />
              <div className="p-3 flex items-center justify-between border-t">
                <span className="text-gray-900 font-medium">Villas</span>
                <span className="text-gray-900">↗</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pb-3">1,000 villas</p>
            </div>

            {/* CARD 2 - Apartments */}
            <div className="bg-white w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                className="h-[300px] object-cover"
              />
              <div className="p-3 flex items-center justify-between border-t">
                <span className="text-gray-900 font-medium">Apartments</span>
                <span className="text-gray-900">↗</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pb-3">3,000 villas</p>
            </div>

            {/* CARD 3 - Tents */}
            <div className="bg-white w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c"
                className="h-[300px] object-cover"
              />
              <div className="p-3 flex items-center justify-between border-t">
                <span className="text-gray-900 font-medium">Tents</span>
                <span className="text-gray-900">↗</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pb-3">2,000 tents</p>
            </div>

          </div>
        </div>
      </section>



      {/* Properties Smooth Carousel */}
      <section className="w-full py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between">
          <h2 className="text-3xl font-bold mb-6">Popular Stays</h2>
          <Button className="rounded-[0] mb-6" onClick={() => navigate('/properties')}>
            View All Properties
          </Button>
          </div>
          <div className="relative w-full overflow-hidden">
            {/* SCROLL WRAPPER */}
            <div className="flex gap-6 animate-infinite-scroll">
              {[...properties, ...properties].map((property, i) => (
                <div key={i} className="min-w-[270px]">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>




    </div>
  );
}
