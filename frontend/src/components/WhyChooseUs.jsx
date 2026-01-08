import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  Heart,
  Headphones,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const items = [
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    desc: "Every property is verified and quality-checked for your peace of mind.",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    desc: "Book your stay instantly with our seamless reservation system.",
  },
  {
    icon: Heart,
    title: "Best Price Guarantee",
    desc: "Get the best rates with our price match promise on all bookings.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Our dedicated team is available round the clock to assist you.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-[#fafdfb] py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-2">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
            Travel with Confidence
          </h2>
          <p className="text-gray-600 md:text-[16px] text-[14px]">
            We make your travel experience seamless, secure, and memorable.
          </p>
        </div>

        {/* ================= MOBILE SLIDER ================= */}
        <div className="block md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1.1}
            className="pb-10"
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <SwiperSlide key={i}>
                  <div
                    className="
                      bg-white
                      rounded-2xl
                      border border-[#E5EAF1]
                      p-6
                      shadow-sm
                    "
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* ================= DESKTOP GRID ================= */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="
                  bg-white
                  rounded-2xl
                  border border-[#E5EAF1]
                  p-6
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
