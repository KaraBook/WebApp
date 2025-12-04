import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">

      <div className="w-full bg-white border-b py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-[2px] text-gray-900">
          Contact Us
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-3">
          We’re here to help. Reach out to us anytime.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">

        <div className="space-y-8">

          <h2 className="text-2xl font-semibold tracking-wide text-gray-900">
            Get in Touch
          </h2>

          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            Have questions about bookings, payments, or property details?
            Our support team is available to assist you.
          </p>

          <div className="space-y-5">

            <InfoRow
              icon={<Phone size={20} />}
              label="Phone"
              value="+91 98765 43210"
            />

            <InfoRow
              icon={<Mail size={20} />}
              label="Email"
              value="support@bookmystay.in"
            />

            <InfoRow
              icon={<MapPin size={20} />}
              label="Office"
              value="Baner, Pune, Maharashtra"
            />

            <InfoRow
              icon={<Clock size={20} />}
              label="Support Hours"
              value="Mon – Sun · 9:00 AM – 8:00 PM"
            />

          </div>

        </div>

        <div className="bg-white border shadow-sm p-8 space-y-6">

          <h3 className="text-xl font-semibold tracking-wide text-gray-900">
            Send us a message
          </h3>

          <Input
            placeholder="Your Name"
            className="rounded-none border-gray-300"
          />

          <Input
            placeholder="Your Email"
            className="rounded-none border-gray-300"
          />

          <Input
            placeholder="Phone Number"
            className="rounded-none border-gray-300"
          />

          <Textarea
            placeholder="Your Message..."
            className="h-32 rounded-none border-gray-300"
          />

          <Button className="w-full rounded-none tracking-[2px] text-sm uppercase">
            Send Message
          </Button>

        </div>

      </div>

      <div className="w-full h-[350px] border-t">
        <iframe
          title="Google Map"
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.199!2d73.796!3d18.561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf99999999!2sPune"
        ></iframe>
      </div>

    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[#233b19]">{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-500 tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
