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
import FindByExperience from "@/components/FindByExperience";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import CarouselCard from "@/components/CarouselCard";
import WhyChooseUs from "@/components/WhyChooseUs";
import { SlidersHorizontal } from "lucide-react";
import { Fragment } from "react";


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardFade = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Home() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      state: filters.state || "",
      city: filters.city || "",
      area: filters.area || "",
      guests: JSON.stringify(filters.guests || {}),
      checkIn: filters.checkIn?.toISOString(),
      checkOut: filters.checkOut?.toISOString(),
    }).toString();

    navigate(`/properties?${query}`);
  };

  return (
    <div className="flex flex-col min-h-screen relative">

      <section className="relative w-full h-[60vh] md:h-[85vh] flex flex-col md:flex-row md:items-center pt-[15vh]">
        <img
          src="/bannerImg1.webp"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center text-white px-4 mx-auto"
        >
          <h1 className="text-3xl md:text-5xl tracking-[2px] uppercase font-[600] mb-3">
            Discover Stays That Feel Like Home
          </h1>
          <p className="text-sm md:text-lg text-gray-200 max-w-xl mx-auto">
            Find beautiful resorts, villas, and getaways across India — book your next escape effortlessly.
          </p>
        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute -bottom-[200px] md:-bottom-[50px] w-full flex justify-center px-4 z-10"
        >
          <div className="hidden md:block absolute -bottom-[50px] w-full px-4 z-10">
            <div className="max-w-6xl mx-auto">
              <PropertyFilters onFilter={handleFilter} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= MOBILE SEARCH TRIGGER + INLINE FILTERS ================= */}
      <div className="md:hidden px-2 -mt-[35px] z-30 relative">

        {/* WHERE TO BUTTON */}
        <button
          onClick={() => setShowMobileFilters((p) => !p)}
          className="w-full bg-white rounded-2xl shadow-sm border border-[#E5EAF1]
               px-4 py-4 flex items-center justify-between"
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
              <p className="text-sm font-semibold text-[#1F2A2E]">
                Where to?
              </p>
              <p className="text-xs text-[#64748B]">
                Add dates · Add guests
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#F4F1EB] flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-[#1F2A2E]" />
          </div>
        </button>

        {/* INLINE FILTERS (EXPAND BELOW) */}
        <div
          className={`
      transition-all duration-300 ease-out
      ${showMobileFilters
              ? "max-h-[1200px] opacity-100 translate-y-0 mt-3"
              : "max-h-0 opacity-0 -translate-y-2 mt-0"
            }
    `}
        >
          <div className="overflow-hidden pt-10 bg-white rounded-2xl">
            <div className="bg-white rounded-2xl shadow-sm">
              <PropertyFilters
                onFilter={(filters) => {
                  handleFilter(filters);   // 🔥 NAVIGATES TO /properties
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        </div>

      </div>


      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl w-full mx-auto mt-[50px] md:mt-[130px] flex flex-wrap justify-between items-center"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center md:items-start gap-4">
          <span className="text-sm font-medium text-primary">
            Curated stays across top destinations
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold">
            <span className="block text-[#1F2A2E] text-center md:text-left">Find Your</span>
            <span className="block bg-gradient-to-b from-primary text-center md:text-left to-[#9AA06B] bg-clip-text text-transparent">
              Perfect Stay
            </span>
          </h1>
          <p className="text-gray-600 max-w-sm text-center text-[14px] md:text-[16px] md:text-left">
            Experience the best of Maharashtra, from city life to coastal and hill escapes.
          </p>

          <Button
            onClick={() => navigate("/properties")}
            className=" relative w-fit overflow-hidden rounded-[10px] bg-primary text-white px-6 py-5 font-medium group">
            <span className="relative z-10 flex items-center gap-2">
              Explore Beautiful Stays
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-primary via-white/30 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Button>
        </motion.div>

        {/* AUTO CAROUSEL */}
        <motion.div
          variants={fadeUp}
          className="
    relative
    w-full lg:w-[55%]
    mt-6 lg:mt-4
  "
        >
          {/* LEFT GRADIENT — DESKTOP ONLY */}
          <div className="hidden lg:block absolute left-0 top-0 h-full w-16 z-20 bg-gradient-to-r from-white to-transparent" />

          <div className="overflow-hidden">
            <div
              className="
        carousel-track
        flex gap-4
        animate-scroll
        md:animate-scroll-slow
      "
            >
              {[...Array(2)].flatMap((_, idx) => (
                <Fragment key={idx}>
                  <CarouselCard title="Villas" subtitle="Experience Luxury" img="/banimg1.jpg" />
                  <CarouselCard title="Tents" subtitle="Close to Nature" img="/bannerimg.webp" />
                  <CarouselCard title="Hotels" subtitle="Comfort & Convenience" img="/bannerImg1.webp" />
                </Fragment>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.section>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full bg-[#faf7f4] py-[40px] mt-[70px] md:mt-[120px]"
      >
        <FindByExperience />
      </motion.section>

      <div className="mt-12 md:mt-20">
        <WhyChooseUs />
      </div>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full mt-[0px] md:mt-[50px] py-16 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Stays</h2>
            <Button
              onClick={() => navigate("/properties")}
              className=" relative overflow-hidden rounded-[10px] bg-primary text-white px-6 py-5 font-medium group">
              <span className="relative z-10 flex items-center gap-2">
                View All Properties
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span
                className="absolute inset-0 bg-gradient-to-r from-primary via-white/30 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>

          </div>

          <Swiper
            modules={[Navigation, Autoplay, FreeMode]}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            loop
            autoplay={{ delay: 1, disableOnInteraction: false }}
            speed={5000}
            freeMode
            slidesPerView="auto"
            spaceBetween={16}
          >
            {properties.map((property, i) => (
              <SwiperSlide key={i} style={{ width: "250px", height: "100%" }} className="flex">
                <motion.div
                  variants={cardFade}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  className="md:h-[470px] h-[420px] w-full pt-[20px] md:pt-[40px] pb-[30px] md:pb-[70px] flex"
                >
                  <PropertyCard property={property} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ARROWS */}
          <div className="hidden md:flex justify-end gap-3 mt-6">
            <button ref={prevRef} className="w-10 h-10 bg-gray-100">←</button>
            <button ref={nextRef} className="w-10 h-10 bg-gray-100">→</button>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
