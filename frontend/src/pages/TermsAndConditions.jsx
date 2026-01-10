import { Mail, Phone } from "lucide-react"

export default function TermsAndConditions() {
    return (
        <section className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6">
                Terms & Conditions
            </h1>

            <p className="text-gray-600 mb-6 text-[14px] md:text-[16px]">
                Welcome to <strong>KARAbook</strong>. By accessing or using our platform,
                you agree to comply with and be bound by the following Terms and Conditions.
            </p>

            {/* INTRO */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">1. Introduction</h2>
                <p className="text-gray-600 text-[14px] md:text-[16px]">
                    KARAbook is a travel and stay booking portal owned and operated by
                    <strong> Ms. Deepali Shukla</strong>, providing travel-related services
                    across India in compliance with applicable Indian laws including the
                    Information Technology Act, 2000, Consumer Protection Act, 2019, and
                    Indian Contract Act, 1872.
                </p>
            </div>

            {/* SERVICES */}
            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">
                    2. Travel & Stay Services
                </h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 text-[14px] md:text-[16px]">
                    <li>KARAbook facilitates booking of villas, farm stays, resorts, homestays, and experiences.</li>
                    <li>All bookings are subject to the property owner’s individual policies.</li>
                    <li>KARAbook acts only as an intermediary and does not own or manage properties.</li>
                    <li>Prices and availability may change without prior notice.</li>
                </ul>
            </div>

            {/* PAYMENTS */}
            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">3. Payment Terms</h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 text-[14px] md:text-[16px]">
                    <li>All payments are processed via secure online gateways.</li>
                    <li>KARAbook uses Razorpay or other authorized gateways.</li>
                    <li>Financial data is handled directly by payment gateways and not stored on KARAbook servers.</li>
                </ul>
            </div>

            {/* CANCELLATION */}
            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">
                    4. Cancellation & Refunds
                </h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 text-[14px] md:text-[16px]">
                    <li>Refund eligibility depends on the property’s cancellation policy.</li>
                    <li>Refunds are processed within 7–10 working days where applicable.</li>
                    <li>Processing or gateway charges may be deducted.</li>
                </ul>
            </div>

            {/* DISCLAIMER */}
            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">Disclaimer</h2>
                <p className="text-gray-600 text-[14px] md:text-[16px]">
                    KARAbook is not responsible for cancellations, travel disruptions,
                    acts of nature, or third-party service failures.
                </p>
            </div>

            {/* LAW */}
            <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold text-[#1F2A2E]">
                    Governing Law & Disputes
                </h2>
                <p className="text-gray-600 text-[14px] md:text-[16px]">
                    These terms are governed by Indian law. All disputes are subject to
                    Pune, Maharashtra jurisdiction and resolved via arbitration.
                </p>
            </div>

            {/* CONTACT */}

            <div className="mt-12 border-t pt-6">
                <p className="text-sm font-semibold text-[#1F2A2E] mb-3">
                    Contact Us
                </p>

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                    {/* EMAIL */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <a
                            href="mailto:web.karabook@gmail.com"
                            className="hover:text-primary transition"
                        >
                            web.karabook@gmail.com
                        </a>
                    </div>

                    {/* PHONE */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <a
                            href="tel:+919156480600"
                            className="hover:text-primary transition"
                        >
                            +91 91564 80600
                        </a>
                    </div>
                </div>
            </div>

        </section>
    );
}
