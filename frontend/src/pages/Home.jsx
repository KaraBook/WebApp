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

      <section className="relative w-full h-[60vh] md:h-[85vh] flex md:items-center pt-[15vh]">
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
          <div className="max-w-6xl w-full">
            <PropertyFilters onFilter={handleFilter} />
          </div>
        </motion.div>
      </section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl w-full mx-auto mt-[130px] flex flex-wrap justify-between items-center"
      >
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <span className="text-sm font-medium text-primary">
            Curated stays across top destinations
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold">
            <span className="block text-[#1F2A2E]">Find Your</span>
            <span className="block bg-gradient-to-b from-primary to-[#9AA06B] bg-clip-text text-transparent">
              Perfect Stay
            </span>
          </h1>
          <p className="text-gray-600 max-w-sm">
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
        <motion.div variants={fadeUp} className="relative w-[55%] mt-4">
          <div className="absolute left-0 top-0 h-full w-16 z-20 bg-gradient-to-r from-white to-transparent" />
          <div className="overflow-hidden">
            <div className="carousel-track flex gap-4 animate-scroll">
              {[...Array(2)].flatMap(() => [
                <CarouselCard key="villa" title="Villas" subtitle="Experience Luxury" img="/banimg1.jpg" />,
                <CarouselCard key="tent" title="Tents" subtitle="Close to Nature" img="/bannerimg.webp" />,
                <CarouselCard key="hotel" title="Hotels" subtitle="Comfort & Convenience" img="/bannerImg1.webp" />,
              ])}
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full bg-[#faf7f4] py-[40px] mt-[120px]"
      >
        <FindByExperience />
      </motion.section>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full mt-[50px] py-16 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
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
                  className="h-[470px] w-full pt-[40px] pb-[70px] flex"
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
