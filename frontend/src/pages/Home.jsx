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
import { House, Tent, } from "lucide-react";
import CarouselCard from "@/components/CarouselCard";

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

      {/* HERO SECTION */}
      <section className="relative w-full h-[60vh] md:h-[85vh] flex md:items-center items:start md:justify-center justify-start pt-[15vh]">
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
          <h1 className="text-3xl md:text-5xl tracking-[2px] uppercase font-[600] mb-3 leading-snug">
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


      <section className="max-w-7xl w-full mx-auto md:h-[20vh] mt-[130px] flex items-center flex-wrap justify-between">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-primary">
            Curated stays across top destinations
          </span>
          <h1 className="font-display text-4xl md:text-4xl lg:text-5xl font-bold leading-tight text-left">
            <span className="block text-[#1F2A2E]">Find Your</span>
            <span className="block pb-[18px] pt-[10px] bg-gradient-to-b from-primary to-[#9AA06B] bg-clip-text text-transparent">
              Perfect Stay
            </span>
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-sm">
            Experience the best of Maharashtra, from city life to coastal and hill escapes.
          </p>

          <button className="inline-flex items-center gap-2 text-white px-4 w-fit py-2 rounded-[10px] font-medium group bg-primary">
            Explore Beautiful Stays
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
        <div className="relative w-[55%] mt-4">

          {/* LEFT WHITE GRADIENT */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-20
    bg-gradient-to-r from-white via-white/80 to-transparent" />

          {/* SCROLL CONTAINER */}
          <div className="relative z-10 overflow-hidden">
            <div className="carousel-track flex gap-4">
              {/* ORIGINAL CARDS */}
              <CarouselCard
                title="Villas"
                subtitle="Experience Luxury"
                img="/banimg1.jpg"
              />
              <CarouselCard
                title="Tents"
                subtitle="Close to Nature"
                img="/bannerimg.webp"
              />
              <CarouselCard
                title="Hotels"
                subtitle="Comfort & Convenience"
                img="/bannerImg1.webp"
              />

              {/* DUPLICATE FOR SEAMLESS LOOP */}
              <CarouselCard
                title="Villas"
                subtitle="Experience Luxury"
                img="/banimg1.jpg"
              />
              <CarouselCard
                title="Tents"
                subtitle="Close to Nature"
                img="/bannerimg.webp"
              />
              <CarouselCard
                title="Hotels"
                subtitle="Comfort & Convenience"
                img="/bannerImg1.webp"
              />
            </div>
          </div>

        </div>


      </section>

      <section className="w-full bg-[#faf7f4] py-[20px] md:pb-[80px] md:py-[40px] md:mt-[280px] px-4 md:px-12">
        <FindByExperience />
      </section>

      {/* PROPERTIES CAROUSEL */}
      <section className="w-full py-16 md:mt-[50px] bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Stays</h2>
            <Button className="rounded-[10px] mt-2 md:mt-0" onClick={() => navigate("/properties")}>
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
