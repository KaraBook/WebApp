import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f2f2f0]">

      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-4xl font-semibold tracking-wide text-[#233b19] uppercase">
          Contact Us
        </h1>

        <div className="w-24 h-[3px] bg-[#2aa5a0] mx-auto mt-4"></div>

        <p className="text-gray-600 text-base mt-4">
          We’re here to help. Let’s make your stay unforgettable.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-12">

        <div className="p-10 bg-white shadow-xl border border-gray-200 rounded-none">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
            Get in Touch
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Whether you have questions about bookings, payments, or want to list your resort — we’re here to help.
          </p>

          <div className="space-y-8">
            <InfoRow
              icon={<Phone size={20} />}
              title="Phone"
              value="+91 98765 43210"
            />

            <InfoRow
              icon={<Mail size={20} />}
              title="Email"
              value="support@bookmystay.in"
            />

            <InfoRow
              icon={<MapPin size={20} />}
              title="Our Office"
              value="Baner, Pune, Maharashtra"
            />

            <InfoRow
              icon={<Clock size={20} />}
              title="Support Hours"
              value="Mon – Sun · 9:00 AM – 8:00 PM"
            />
          </div>
        </div>

        {/* RIGHT CARD — CONTACT FORM */}
        <div className="p-10 bg-white shadow-xl border border-gray-200 rounded-none">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
            Send Us a Message
          </h2>

          <div className="space-y-6">
            
            <Input
              placeholder="Your Name"
              className="rounded-none h-12 text-sm tracking-wide border-gray-300 focus:border-[#0e8892] focus:ring-0"
            />

            <Input
              placeholder="Your Email"
              type="email"
              className="rounded-none h-12 text-sm tracking-wide border-gray-300 focus:border-[#0e8892] focus:ring-0"
            />

            <Input
              placeholder="Phone Number"
              type="text"
              className="rounded-none h-12 text-sm tracking-wide border-gray-300 focus:border-[#0e8892] focus:ring-0"
            />

            <Textarea
              placeholder="Your Message..."
              className="rounded-none h-32 text-sm tracking-wide border-gray-300 focus:border-[#0e8892] focus:ring-0"
            />

            <Button className="w-full rounded-none h-12 tracking-[2px] text-sm uppercase bg-[#0e8892] hover:bg-[#0b6f75]">
              Send Message
            </Button>

          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="w-full h-[380px] border-t border-gray-300 shadow-inner">
        <iframe
          title="Google Map"
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          src="https://maps.google.com/maps?q=Baner%20Pune&t=&z=13&ie=UTF8&iwloc=&output=embed"
        ></iframe>
      </section>

    </div>
  );
}



function InfoRow({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[#0e8892]">{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-500 tracking-wide">{title}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
