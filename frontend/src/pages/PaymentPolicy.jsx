export default function PaymentPolicy() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6">
        Payment & Processing Policy
      </h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">
            Payment Integration
          </h2>
          <p className="text-gray-600 text-[14px] md:text-[16px]">
            Payments are securely processed using Razorpay, supporting UPI,
            cards, net banking, and wallets.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">
            Customer Data Safety
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 text-[14px] md:text-[16px]">
            <li>No card or banking data is stored by KARAbook.</li>
            <li>All credentials are handled by Razorpay securely.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">
            Refunds & Disputes
          </h2>
          <p className="text-gray-600 text-[14px] md:text-[16px]">
            Refunds are processed as per RBI guidelines within 5–7 business days.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A2E]">
            Compliance
          </h2>
          <p className="text-gray-600 text-[14px] md:text-[16px]">
            Razorpay is RBI-authorized and fully compliant with Indian financial regulations.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-sm text-gray-600">
        For payment support: <strong>web.karabook@gmail.com</strong>
      </div>
    </section>
  );
}
