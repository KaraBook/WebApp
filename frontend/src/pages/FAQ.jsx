import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    section: "About Karabook",
    items: [
      {
        q: "What is Karabook?",
        a: "Karabook is a resort booking platform where you can explore, compare, and book stays directly with verified resort owners.",
      },
      {
        q: "Do I need an account to browse resorts?",
        a: "No, you can browse resorts without logging in. However, booking or saving a property requires an account.",
      },
      {
        q: "Is there any booking fee for users?",
        a: "No, Karabook does not charge any extra fee to travellers. You pay only what the resort lists.",
      },
    ],
  },
  {
    section: "Account & Profile",
    items: [
      {
        q: "How do I create a Karabook account?",
        a: "Simply enter your mobile number, verify via OTP, and complete your profile with name, email, and address details.",
      },
      {
        q: "I didn’t receive the OTP. What should I do?",
        a: "Ensure your mobile number is correct and has network coverage. You can request to resend OTP after 30 seconds.",
      },
      {
        q: "How can I update my profile details?",
        a: "Go to “My Profile” from your dashboard and edit your name, email, or address anytime.",
      },
      {
        q: "Can I change my mobile number later?",
        a: "No, your mobile number is your login ID. If you need to change it, please contact support.",
      },
    ],
  },
  {
    section: "Booking & Payment",
    items: [
      {
        q: "How do I book a resort?",
        a: "Find your preferred resort, choose dates, and click “Book Now.” Complete payment to confirm your booking.",
      },
      {
        q: "Is booking instant or do I need approval?",
        a: "All bookings are instantly confirmed upon successful payment.",
      },
      {
        q: "Which payment methods are supported?",
        a: "We accept all major UPI apps, credit/debit cards, and net banking via secure gateways like Razorpay or PhonePe.",
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes, go to “My Bookings” → “Upcoming” → choose the booking → “Cancel”. Cancellation policies may apply.",
      },
      {
        q: "Will I get a refund on cancellation?",
        a: "Refund eligibility depends on the property’s cancellation policy. The exact amount is shown before cancellation.",
      },
      {
        q: "How do I check if my booking is confirmed?",
        a: "You’ll receive WhatsApp and email confirmation. You can also check under “My Bookings” → “Upcoming”.",
      },
    ],
  },
  {
    section: "Dashboard & Features",
    items: [
      {
        q: "What is the Wishlist / Saved Resorts feature?",
        a: "You can save resorts for future consideration by clicking the heart icon and access them from “Wishlist”.",
      },
      {
        q: "Where can I see my booking history?",
        a: "All your bookings are listed under “My Bookings” in Upcoming, Past, or Cancelled tabs.",
      },
      {
        q: "How do I write a review for a resort?",
        a: "After your stay, go to “My Ratings” or “Past Bookings” and click “Write a Review”.",
      },
      {
        q: "Can I edit or delete my review later?",
        a: "Yes, reviews can be edited or deleted within 7 days of submission.",
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        q: "What if I face an issue with my booking?",
        a: "Use the “Raise a Support Ticket” feature from your dashboard and our team will assist you promptly.",
      },
      {
        q: "How can I contact Karabook support?",
        a: "You can reach us through the Contact Form in the Support section or email us directly.",
      },
      {
        q: "Where can I find cancellation and refund policies?",
        a: "Policies are available on the property details page, during checkout, and in your confirmation email.",
      },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl text-center font-extrabold text-[#0F172A] mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Everything you need to know about using Karabook
          </p>
        </div>
      </div>

      {/* FAQ CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {faqs.map((group, gi) => (
          <div key={gi}>
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              {group.section}
            </h2>

            <div className="bg-white rounded-xl border divide-y">
              {group.items.map((item, i) => {
                const id = `${gi}-${i}`;
                const isOpen = open === id;

                return (
                  <button
                    key={id}
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 hover:bg-[#F8FAFC]  "
                  >
                    <div>
                      <p className="font-medium text-[#0F172A]">
                        {item.q}
                      </p>
                      {isOpen && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {item.a}
                        </p>
                      )}
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
