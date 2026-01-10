import { CheckCircle, Users, ShieldCheck } from "lucide-react";

export default function WhyListWithUs() {
  return (
    <section className="w-full bg-white py-6 md:py-24">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">

        {/* LEFT IMAGE */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-[60%] h-[60%] border-2 border-primary rounded-[8px]" />
          <img
            src="/whyList.jpg"   
            alt="List your property with Karabook"
            className="relative rounded-[10px] object-cover w-full h-[320px] md:h-[420px]"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex flex-col items-center md:items-start md:justify-start gap-4">

          {/* LABEL */}
          <span className="text-xs tracking-widest uppercase text-primary font-semibold">
            Why list with us
          </span>

          {/* HEADING */}
          <h2 className="text-3xl text-center md:text-left -mt-2 md:text-4xl font-extrabold text-[#0F172A] leading-tight">
            Showcase Your Property. <br />
            Reach Genuine Travelers.
          </h2>

          {/* DESCRIPTION */}
          <p className="text-gray-600 text-[14px] md:text-[16px] text-center md:text-left  max-w-xl">
            Karabook is built to help villa, farmhouse, and resort owners grow their
            bookings. With complete transparency and a trusted community, we make
            sure your property stands out.
          </p>

          {/* FEATURES */}
          <div className="flex flex-col gap-5 mt-2">

            {/* ITEM */}
            <Feature
              icon={<CheckCircle className="w-5 h-5" />}
              title="Verified Exposure"
              desc="List your property with full details, photos, and videos to attract genuine guests."
            />

            <Feature
              icon={<Users className="w-5 h-5" />}
              title="Reach the Right Audience"
              desc="Connect directly with travelers actively looking for stays in Maharashtra."
            />

            <Feature
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Simple & Secure Bookings"
              desc="We handle the payments and bookings, so you can focus on hosting."
            />

          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURE ITEM ================= */

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-[#0F172A]">{title}</h4>
        <p className="text-sm text-gray-600 mt-1 max-w-md">
          {desc}
        </p>
      </div>
    </div>
  );
}
