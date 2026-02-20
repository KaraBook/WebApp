import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";


export default function WelcomeSection() {
  return (
    <section className="w-full bg-white py-0 md:py-4">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* LEFT – IMAGE COLLAGE */}
        <div className="relative">
          {/* Main Image */}
          <div className="rounded-[18px] overflow-hidden">
            <img
              src="/Welcome1.webp"
              alt="Traditional villa"
              className="w-full md:w-[520px] rounded-[18px] h-[380px] md:h-[460px] object-cover"
            />
          </div>

          {/* Floating Image */}
          <div className="absolute -bottom-10 md:-right-[7px] right-[16%] w-[220px] md:w-[260px] rounded-[16px] overflow-hidden shadow-xl border border-white">
            <img
              src="/Welcome2.webp"
              alt="Luxury resort"
              className="w-full h-[160px] md:h-[190px] object-cover"
            />
          </div>
        </div>

        {/* RIGHT – CONTENT */}
        <div className="space-y-3 flex flex-col items-center md:items-start">

          {/* Label */}
          <p className="text-xs font-semibold text-center md:text-left mt-4 md:mt-0 tracking-[3px] uppercase text-primary">
            Welcome to Karabook
          </p>

          {/* Heading */}
          <h2 className="text-3xl md:text-3xl font-extrabold leading-tight text-[#0F172A] text-center md:text-left">
            Discover Verified Villas, Farmhouses & Resorts in Maharashtra
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-[14px] md:text-[16px] leading-relaxed max-w-xl text-center md:text-left">
            Your perfect getaway is closer than you think. At Karabook, we connect
            travelers with handpicked stays across{" "}
            <span className="font-semibold text-gray-800">
              Pune, Lonavala, Mahabaleshwar, Nashik, Kolhapur, Amba
            </span>{" "}
            and more.
          </p>

          <p className="text-gray-600 text-[14px] md:text-[16px] leading-relaxed max-w-xl text-center md:text-left">
            Whether it’s a family holiday, a weekend retreat, or a special celebration,
            booking with us is{" "}
            <span className="font-semibold text-gray-800">
              simple, transparent, and secure
            </span>.
          </p>

          {/* FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Feature
              title="Genuine Listings"
              desc="Every property is verified for trust & comfort."
            />
            <Feature
              title="Scenic Destinations"
              desc="Handpicked locations across Maharashtra’s best spots."
            />
          </div>

          {/* CTA */}
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center justify-center bg-[#F6B400] hover:bg-[#e3a700] transition text-black font-semibold px-7 py-4 rounded-[10px] shadow-md"
          >
            Discover Your Stay
          </Link>

        </div>
      </div>
    </section>
  );
}

/* Feature Item */
function Feature({ title, desc }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border ">
      <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}
