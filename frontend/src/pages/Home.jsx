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
import { Dot, SlidersHorizontal } from "lucide-react";
import { Fragment } from "react";
import TopDestinations from "@/components/TopDestinations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyFilterPopup from "@/components/PropertyFilterPopup";
import WelcomeSection from "@/components/WelcomeSection";
import ExperiencesSection from "@/components/FacilitiesExperience";
import WhyListWithUs from "@/components/WhyListWithUs";


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
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);


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

      <section className="relative w-full h-[70vh] md:h-[85vh] flex flex-col md:flex-row md:items-center pt-[15vh]">
        <img
          src="/bannerImg3.jpg"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center text-white px-4 mx-auto"
        >
          <span className="w-fit text-xs uppercase tracking-[1px] items-center mx-auto -mt-8 md:-mt-28 flex bg-white/20 px-2 md:px-4 rounded-full">
          <Dot className="w-6 md:w-10 h-10  text-yellow-500"/>Discover Maharashtra's Hidden Gems
          </span>
          <h1 className="ply md:text-6xl leading-[45px] mt-4 md:leading-[60px] tracking-[2px]  font-[600] mb-3">
            Your Perfect Gateway <br></br>Just A Click Away
          </h1>
          <p className="text-sm md:text-lg text-gray-200 max-w-xl mx-auto">
            Discover verified villas, farmhouses, and resorts across Maharashtra.
          </p>
          <Button className="bg-[#FBB017] text-black text-[16px] mt-6 px-10 py-6 rounded-[10px] font-semibold">
            Find Your Stay
          </Button>

        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute -bottom-[200px] md:-bottom-[50px] w-full flex justify-center px-4 z-10"
        >
          <div className="hidden md:block absolute -bottom-[20px] w-full px-4 z-10">
            <div className="max-w-6xl mx-auto">
              <PropertyFilters onFilter={handleFilter} />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="md:hidden px-2 -mt-[35px] z-30 relative">

        <button
          onClick={() => setShowMobileFilters((p) => !p)}
          className="w-full bg-white rounded-2xl shadow-sm border border-[#E5EAF1]
               px-4 py-2 flex items-center justify-between"
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

          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterPopup(true);
            }}
            className="w-12 h-12 -mr-2 shadow-sm border border-[#E5EAF1] rounded-[10px] bg-[#fff] flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-[#1F2A2E]" />
          </div>
        </button>

        <div
          className={`
      transition-all duration-300 ease-out
      ${showMobileFilters
              ? "max-h-[1200px] opacity-100 translate-y-0 mt-3"
              : "max-h-0 opacity-0 -translate-y-2 mt-0"
            }
    `}
        >
          <div className="pt-10 bg-white rounded-2xl">
            <div className="bg-white rounded-2xl shadow-sm">
              <PropertyFilters
                onFilter={(filters) => {
                  handleFilter(filters);
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
        className="max-w-7xl mx-auto px-4 z-[999999] mt-[50px] md:mt-[140px]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center jusstify-between">

          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 md:gap-5"
          >
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Curated stays across top destinations
            </span>

            <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="block text-[#1F2A2E]">Find Your</span>
              <span className="block bg-gradient-to-b from-primary to-[#9AA06B] bg-clip-text text-transparent pb-2">
                Perfect Stay
              </span>
            </h2>

            <p className="text-gray-600 max-w-md text-[15px] md:text-[16px]">
              From peaceful hill retreats to luxurious pool villas and coastal escapes —
              discover stays that match your travel mood.
            </p>

            <Button
              onClick={() => navigate("/properties")}
              className="relative overflow-hidden rounded-[10px] bg-primary text-white px-7 py-5 font-semibold group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Beautiful Stays
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-white/30 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </motion.div>

          <div className="block md:hidden relative mt-6">
            <button
              id="exp-prev"
              className="
      absolute left-[-14px] top-1/2 -translate-y-1/2 z-20
      h-9 w-9 rounded-full bg-white shadow-md
      flex items-center justify-center
    "
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              id="exp-next"
              className="
      absolute right-[-14px] top-1/2 -translate-y-1/2 z-20
      h-9 w-9 rounded-full bg-white shadow-md
      flex items-center justify-center
    "
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <Swiper
              modules={[Navigation]}
              slidesPerView={1.2}
              spaceBetween={14}
              navigation={{
                prevEl: "#exp-prev",
                nextEl: "#exp-next",
              }}
              className="px-2"
            >
              <SwiperSlide>
                <ExperienceCard
                  title="Luxury Villas"
                  subtitle="Private · Premium · Scenic"
                  img="/banimg1.jpg"
                />
              </SwiperSlide>

              <SwiperSlide>
                <ExperienceCard
                  title="Nature Tents"
                  subtitle="Calm · Green · Peaceful"
                  img="/bannerimg.webp"
                />
              </SwiperSlide>

              <SwiperSlide>
                <ExperienceCard
                  title="Hill Retreats"
                  subtitle="Cool · Quiet · Views"
                  img="/banimg1.jpg"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          <motion.div
            variants={fadeUp}
            className="
    hidden md:flex
    gap-6
    md:max-w-[640px]
    ml-auto
  "
          >
            <ExperienceCard
              title="Luxury Villas"
              subtitle="Private · Premium · Scenic"
              img="/banimg1.jpg"
            />
            <ExperienceCard
              title="Nature Tents"
              subtitle="Calm · Green · Peaceful"
              img="/bannerimg.webp"
            />
            <ExperienceCard
              title="Hill Retreats"
              subtitle="Cool · Quiet · Views"
              img="/banimg1.jpg"
            />
          </motion.div>


        </div>
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


      <section className="w-full bg-white py-8 mt-2 md:mt-0 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col justify-center items-center md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary text-center md:text-left font-[700]">
                Handpicked for you
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] text-center md:text-left mt-2">
                Featured Properties
              </h2>
              <p className="text-sm md:text-base text-slate-600 mt-2 max-w-xl text-center md:text-left">
                Explore our most loved stays, chosen for comfort, location, and experience.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/properties")}
                className="h-11 rounded-[10px] px-8 bg-primary text-white font-semibold hover:opacity-90"
              >
                View All →
              </Button>
            </div>
          </div>

          {/* SWIPER */}
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={18}
            slidesPerView={1.15}
            loop={properties.length > 4}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            onSwiper={setSwiperInstance}
            breakpoints={{
              480: { slidesPerView: 1.25 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="featuredPropsSwiper"
          >
            <div className="flex items-center justify-end p-4 gap-3">
              <button
                onClick={() => swiperInstance?.slidePrev()}
                className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-slate-400 bg-white shadow-sm hover:shadow-md transition"
              >
                ‹
              </button>
              <button
                onClick={() => swiperInstance?.slideNext()}
                className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-slate-400 bg-white shadow-sm hover:shadow-md transition"
              >
                ›
              </button>
            </div>
            {properties.map((property) => (
              <SwiperSlide key={property._id} className="!h-auto">
                <div className="h-full">
                  <PropertyCard property={property} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </section>


      <div>
        <WelcomeSection />
      </div>

      <section className="w-full bg-[#faf7f4] py-8 md:py-10 mt-20 md:mt-28">
        <TopDestinations />
      </section>

      <section>
        <ExperiencesSection />
      </section>

      <section>
        <WhyListWithUs />
      </section>


      <PropertyFilterPopup
        open={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        onApply={(filters) => {
          const params = new URLSearchParams();

          if (filters.propertyType && filters.propertyType !== "all") {
            params.set("propertyType", filters.propertyType);
          }

          if (filters.price) {
            params.set("minPrice", filters.price[0]);
            params.set("maxPrice", filters.price[1]);
          }

          if (filters.recommendation === "topRated") {
            params.set("sort", "rating_desc");
          }
          if (filters.recommendation === "trending") {
            params.set("sort", "popular");
          }
          if (filters.recommendation === "new") {
            params.set("sort", "latest");
          }

          navigate(`/properties?${params.toString()}`);

          setShowFilterPopup(false);
        }}
      />
    </div>
  );
}


function ExperienceCard({ title, subtitle, img }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="
        relative
        min-w-[180px] md:min-w-[200px]
        h-[280px]
        rounded-[22px]
        overflow-hidden
        shadow-none
        md:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
        cursor-pointer
        group
        flex-shrink-0
      "
    >
      <img
        src={img}
        alt={title}
        className="
          absolute inset-0
          w-full h-full
          object-cover
          transition-transform duration-700
          group-hover:scale-110
        "
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      <div className="absolute bottom-5 left-5 right-5 text-white">
        <h3 className="text-[15px] font-semibold leading-tight">
          {title}
        </h3>
        <p className="text-xs text-white/80 mt-1">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}
