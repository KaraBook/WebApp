export default function Footer() {
    return (
        <footer className="w-full bg-[#f8f6f3] border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex gap-5">

                    <div className="w-[45%]">
                        <img src="/KarabookLogo.png" className="h-10 mb-4" />
                        <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                            Discover resorts, villas, and unique <br/>stays across India.
                        </p>
                    </div>

                    <div className="w-[12%]">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 tracking-wide">
                            Explore
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Top Places</li>
                            <li>Properties</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    <div className="w-[12%]">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 tracking-wide">
                            For Owners
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Owner Login</li>
                            <li>List Your Property</li>
                        </ul>
                    </div>

                    <div className="w-[12%]">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 tracking-wide">
                            Connect
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Instagram</li>
                            <li>Facebook</li>
                            <li>Twitter</li>
                        </ul>
                    </div>

                    <div className="w-[12%]">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 tracking-wide">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Privacy Policy</li>
                            <li>Terms and Conditions</li>
                            <li>FAQs</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-6"></div>

                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    <p>© {new Date().getFullYear()} KaraBook. All rights reserved.</p>

                    <div className="flex space-x-6 mt-3 sm:mt-0">
                        <a href="#" className="hover:text-primary">Privacy Policy</a>
                        <a href="#" className="hover:text-primary">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
