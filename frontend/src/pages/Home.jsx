import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await Axios.get(SummaryApi.getPublishedProperties.url);
        if (res.data.success) {
          setProperties(res.data.data.slice(0, 10));
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

      {/* HERO SECTION */}
      <section className="relative w-full h-[65vh] md:h-[90vh] flex md:items-center items:start md:justify-center justify-start pt-[15vh]">
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
          <h1 className="text-3xl md:text-5xl tracking-[2px] uppercase font-[500] mb-3 leading-snug">
            Discover Stays That Feel Like Home
          </h1>
          <p className="text-sm md:text-lg text-gray-200 max-w-xl mx-auto">
            Find beautiful resorts, villas, and getaways across India — book your next escape effortlessly.
          </p>
        </motion.div>

        {/* FILTERS */}
        <div className="absolute -bottom-[200px] md:-bottom-[50px] w-full flex justify-center px-4 z-10">
          <div className="max-w-6xl w-full">
            <PropertyFilters onFilter={handleFilter} />
          </div>
        </div>
      </section>

      {/* SECTION : Find Your Perfect Stay */}
      <section className="w-full bg-[#faf7f4] py-[20px] md:py-[80px] mt-[200px] px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

          {/* LEFT TEXT BLOCK */}
          <div className="flex flex-col w-full md:w-[40%]">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug text-gray-900">
              Find Your <br /> Perfect Stay
            </h2>

            <p className="text-gray-600 mt-4 leading-relaxed max-w-sm">
              Experience the best of Maharashtra, from city life to coastal and hill escapes.
            </p>

            <button className="mt-6 inline-flex items-center gap-2 text-gray-900 font-medium group">
              Explore Beautiful Stays
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* RIGHT CATEGORY CARDS */}
          <div className="flex md:w-[60%] w-full justify-between gap-4 md:gap-6 flex-wrap md:flex-nowrap">

            {/* CARD 1 */}
            <div className="bg-white w-[100%] md:w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                className="h-[220px] w-[100%] md:h-[300px] object-cover"
              />
              <div className="p-3 flex items-center justify-between border-t">
                <span className="text-gray-900 font-medium">Villas</span>
                <span className="text-gray-900">↗</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pb-3">1,000 villas</p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white w-[100%] md:w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                className="h-[220px] w-[100%] md:h-[300px] object-cover"
              />
              <div className="p-3 flex items-center justify-between border-t">
                <span className="text-gray-900 font-medium">Apartments</span>
                <span className="text-gray-900">↗</span>
              </div>
              <p className="text-xs text-gray-500 px-3 pb-3">3,000 apartments</p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white w-full md:w-[33%] shadow-sm border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c"
                className="h-[220px] md:h-[300px] w-[100%] object-cover"
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

      {/* PROPERTIES CAROUSEL */}
      <section className="w-full py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Stays</h2>
            <Button className="rounded-none mt-2 md:mt-0" onClick={() => navigate("/properties")}>
              View All Properties
            </Button>
          </div>

          {/* SLIDER */}
          <Swiper
            modules={[Navigation, Autoplay, FreeMode]}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            loop={true}
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
            }}
            speed={5000}
            freeMode={true}
            freeModeMomentum={false}
            slidesPerView="auto"
            spaceBetween={16}
            grabCursor={true}
            className="relative"
          >
            {properties.map((property, i) => (
              <SwiperSlide key={i} style={{ width: "250px" }}>
                <div className="h-[350px] md:h-[380px] flex">
                  <PropertyCard property={property} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ARROWS */}
          <div className="hidden md:flex justify-end gap-3 mt-6 pr-2">
            <button
              ref={prevRef}
              className="w-10 h-10 bg-gray-100 hover:bg-primary hover:text-white transition flex items-center justify-center"
            >
              ←
            </button>

            <button
              ref={nextRef}
              className="w-10 h-10 bg-gray-100 hover:bg-primary hover:text-white transition flex items-center justify-center"
            >
              →
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
