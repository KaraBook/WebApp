import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const destinations = [
  {
    title: "Goa",
    count: 245,
    img: "/goa.jpg",
  },
  {
    title: "Kerala",
    count: 189,
    img: "/kerala.jpg",
  },
  {
    title: "Rajasthan",
    count: 312,
    img: "/rajasthan.jpg",
  },
  {
    title: "Himalayas",
    count: 156,
    img: "/himalayas.jpg",
  },
];

export default function TopDestinations() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-center md:text-left text-[#0F172A]">
            Top Destinations
          </h2>
          <p className="text-slate-600 mt-1 text-center md:text-left">
            Trending destinations to explore this season
          </p>
        </div>

        <button
          onClick={() => navigate("/destinations")}
          className="hidden sm:flex bg-white border px-8 rounded-[10px] py-2 border-primary text-primary font-semibold items-center gap-1 hover:gap-2 transition-all"
        >
          View All <span>→</span>
        </button>
      </div>

      {/* ================= MOBILE SLIDER ================= */}
      <div className="block sm:hidden">
        <Swiper
          modules={[FreeMode]}
          spaceBetween={16}
          slidesPerView={1.2}
          freeMode
          className="pb-4"
        >
          {destinations.map((item) => (
            <SwiperSlide key={item.title}>
              <DestinationCard {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= DESKTOP GRID ================= */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((item) => (
          <DestinationCard key={item.title} {...item} />
        ))}
      </div>

      {/* MOBILE VIEW ALL */}
      <div className="flex justify-center mt-4 sm:hidden">
        <button
          onClick={() => navigate("/destinations")}
          className="text-primary bg-white border px-8 rounded-[10px] py-2 border-primary font-semibold flex items-center gap-1"
        >
          View All <span>→</span>
        </button>
      </div>
    </section>
  );
}

/* ================= DESTINATION CARD ================= */

function DestinationCard({ title, count, img }) {
  return (
    <div
      className="
        relative
        h-[300px] sm:h-[360px]
        rounded-[22px]
        overflow-hidden
        cursor-pointer
        group
        border-2 border-transparent
        hover:border-primary
        transition
      "
    >
      {/* IMAGE */}
      <img
        src={img}
        alt={title}
        className="
          absolute inset-0
          w-full h-full
          object-cover
          transition-transform duration-700
          group-hover:scale-105
        "
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      {/* CONTENT */}
      <div className="absolute bottom-5 left-5 right-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <p className="text-sm text-white/90">
          {count} properties available
        </p>
      </div>
    </div>
  );
}
