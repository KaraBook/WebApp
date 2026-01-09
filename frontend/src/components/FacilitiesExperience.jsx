export default function ExperiencesSection() {
  return (
    <section className="relative w-full overflow-hidden mt-12 md:mt-20">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/experiencebg.webp')",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/55" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-12 text-center text-white">

        {/* LABEL */}
        <p className="text-xs tracking-[3px] uppercase text-[#494949] font-semibold mb-3">
          Our Facilities & Experiences
        </p>

        {/* HEADING */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#212121] leading-tight">
          Stay For The Comfort, Love The Experiences
        </h2>

        {/* SUBTEXT */}
        <p className="mt-4 text-[#393939] max-w-2xl mx-auto text-sm md:text-base text-gray-200">
          Whether it’s unwinding by the pool, enjoying authentic local cuisine,
          or creating memories with your loved ones, Karabook stays offer more
          than just accommodation — we offer experiences.
        </p>

        {/* EXPERIENCE CARDS */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-4 md:p-6 rounded-xl shadow-xl">

          <ExperienceCard
            title="Relax & Rejuvenate"
            desc="Unwind by the pool, in gardens, or cozy lounge spaces."
            img="/rajuvate.webp"
          />

          <ExperienceCard
            title="Nature & Views"
            desc="Wake up to mountain views, lush greenery, or serene waterscapes."
            img="/natureview.webp"
          />

          <ExperienceCard
            title="Family Experience"
            desc="Moments to bond, play, and celebrate together."
            img="/familyex.webp"
          />

        </div>
      </div>
    </section>
  );
}

/* EXPERIENCE CARD */
function ExperienceCard({ title, desc, img }) {
  return (
    <div className="relative h-[220px] md:h-[240px] rounded-lg overflow-hidden group cursor-pointer">
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* CARD OVERLAY */}
      <div className="absolute inset-0 bg-[#00000070] group-hover:bg-black/55 transition" />

      {/* TEXT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <p className="text-xs md:text-sm text-gray-200 mt-2 max-w-xs">
          {desc}
        </p>
      </div>
    </div>
  );
}
