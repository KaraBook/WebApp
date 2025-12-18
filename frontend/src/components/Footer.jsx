export default function Footer() {
  return (
    <footer className="w-full bg-[#1f242e] border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

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
          <div className="w-[45%] md:w-[12%]">
            <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Top Places</li>
              <li>Properties</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* For Owners */}
          <div className="w-[45%] md:w-[12%]">
            <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
              For Owners
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Owner Login</li>
              <li>List Your Property</li>
            </ul>
          </div>

          {/* Connect */}
          <div className="w-[45%] md:w-[12%]">
            <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
              Connect
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>Twitter</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="w-[45%] md:w-[12%]">
            <h3 className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Privacy Policy</li>
              <li>Terms and Conditions</li>
              <li>FAQs</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-10 pt-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-300">
          <p className="text-center">
            © {new Date().getFullYear()} KaraBook. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-3 sm:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
