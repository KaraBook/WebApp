import { motion } from "framer-motion";
import WelcomeSection from "@/components/WelcomeSection";
import ExperiencesSection from "@/components/FacilitiesExperience";
import WhyListWithUs from "@/components/WhyListWithUs";
import WhyChooseUs from "@/components/WhyChooseUs";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <section className="w-full">

      {/* HERO ONLY */}
      <div className="relative w-full h-[85vh] overflow-hidden">

        {/* BACKGROUND IMAGE */}
        <img
          src="/bannerImg1.webp"
          alt="Karabook stays across Maharashtra"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay (NOW LIMITED) */}
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-center md:text-left">

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs tracking-[4px] uppercase text-yellow-400 font-semibold mb-3"
            >
              About Karabook
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto md:mx-0"
            >
              Trusted Stays. <br />
              Verified Experiences.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-sm md:text-base text-gray-200 max-w-2xl mx-auto md:mx-0"
            >
              Karabook connects travelers with handpicked villas, farmhouses, and
              resorts across Maharashtra — ensuring comfort, transparency, and
              memorable getaways.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex justify-center md:justify-start"
            >
              <Link to="/properties">
                <button className="bg-[#F6B400] hover:bg-[#e3a700] transition text-black font-semibold px-8 py-4 rounded-[12px] shadow-lg">
                  Explore Stays
                </button>
              </Link>
            </motion.div>

          </div>
        </div>

      </div>

      {/* OTHER SECTIONS (NOW CLICKABLE) */}
      <WelcomeSection />
      <ExperiencesSection />
      <WhyListWithUs />
      <WhyChooseUs />

    </section>
  );
}
