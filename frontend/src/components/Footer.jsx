export default function Footer() {
  return (
    <footer className="w-full mt-20">

      {/* ================= CTA SECTION (ABOVE FOOTER) ================= */}
      <section className="relative w-full bg-primary overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-60 h-60 md:w-80 md:h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#fff] mt-2">
            Own a Property? List It With Us
          </h2>

          <p className="text-sm md:text-base text-white text-center mt-4 ">
            Join thousands of property owners and start earning from your<br></br>
            vacation property. Easy setup, instant visibility, secure payments.
          </p>

          <div className="flex flex-col mt-4 sm:flex-row items-center justify-center gap-4">
            {/* Primary Button */}
            <button className="bg-white text-primary font-medium px-8 py-2 md:py-3 rounded-[10px] md:rounded-[12px] flex items-center gap-2 hover:bg-gray-100 transition">
              List Your Property
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>

            {/* Secondary Button */}
            <button className="bg-white/20 text-white font-medium px-8 py-2 md:py-3 rounded-[10px] md:rounded-[12px] hover:bg-white/30 transition">
              Already a Partner? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ================= MAIN FOOTER ================= */}
      <div className="w-full bg-[#1f242e] ">
        <div className="max-w-full mx-auto px-6 py-4 md:py-6">

          {/* MAIN GRID */}
          <div className="flex flex-wrap gap-8 md:gap-5">

            {/* Logo + About */}
            <div className="w-full md:w-[45%]">
              <img src="/KarabookLogo.png" className="h-10 mb-4" />
              <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                Discover resorts, villas, and unique <br /> stays across India.
              </p>
            </div>

            {/* Explore */}
            <div className="w-[42%] md:w-[12%]">
              <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
                Explore
              </h3>
              <ul className="space-y-2 text-sm text-gray-400 flex flex-col gap-1">
                <a href="/top-places"><li>Top Places</li></a>
                <a href="/properties"><li>Properties</li></a>
                <a href="/contact"><li>Contact</li></a>
              </ul>
            </div>

            {/* For Owners */}
            <div className="w-[42%] md:w-[12%]">
              <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
                For Owners
              </h3>
              <ul className="space-y-2 text-sm text-gray-400 flex flex-col gap-1">
                <a href="/owner-login"><li>Owner Login</li></a>
                <a href="/list-property"><li>List Your Property</li></a>
              </ul>
            </div>

            {/* Connect */}
            <div className="w-[42%] md:w-[12%]">
              <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
                Connect
              </h3>
              <ul className="space-y-2 text-sm text-gray-400 flex flex-col gap-1">
                <a href="/instagram"><li>Instagram</li></a>
                <a href="/facebook"><li>Facebook</li></a>
                <a href="/twitter"><li>Twitter</li></a>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="w-[42%] md:w-[12%]">
              <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm text-gray-400 flex flex-col gap-1">
                <a href="/privacy-policy"><li>Privacy Policy</li></a>
                <a href="/terms-and-conditions"><li>Terms and Conditions</li></a>
                <a href="/faqs"><li>FAQs</li></a>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mt-6 md:mt-10 pt-4 md:pt-6"></div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-center items-center text-sm text-gray-300">
            <p className="text-center">
              © {new Date().getFullYear()} KaraBook, All rights reserved. Powered by Felicity Studio.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
