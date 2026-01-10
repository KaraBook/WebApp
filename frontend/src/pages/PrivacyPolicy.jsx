export default function PrivacyPolicy() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6">
        Privacy Policy
      </h1>

      <p className="text-gray-600 mb-6 text-[14px] md:text-[16px]">
        At <strong>KARAbook</strong>, we respect your privacy and are committed
        to protecting your personal information.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">1. Data Collection</h2>
          <p className="text-gray-600 text-[14px] md:text-[16px]">
            We collect personal information such as name, phone number, email,
            and booking details to facilitate services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">2. Data Usage</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 text-[14px] md:text-[16px]">
            <li>Booking and payment processing</li>
            <li>Customer support and updates</li>
            <li>Service improvement</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">3. Data Protection</h2>
          <p className="text-gray-600 text-[14px] md:text-[16px]">
            We use encryption, secure servers, and firewalls as per Indian IT laws
            to safeguard your data.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-sm text-gray-600">
        Contact us at <strong>web.karabook@gmail.com</strong>
      </div>
    </section>
  );
}
