import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({
      ...prev,
      phone: cleaned,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!name) newErrors.name = "Name is required";
    else if (!/^[a-zA-Z\s.'-]{2,50}$/.test(name))
      newErrors.name = "Enter a valid name";

    if (!email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Enter a valid email address";

    if (!phone) newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit mobile number";

    if (!message) newErrors.message = "Message is required";
    else if (message.length < 10)
      newErrors.message = "Message must be at least 10 characters";
    else if (message.length > 500)
      newErrors.message = "Message is too long (max 500 characters)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await axios({
        method: SummaryApi.sendContact.method,
        url: baseURL + SummaryApi.sendContact.url,
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        },
      });

      setSuccess(true);
      setErrors({});

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      alert("Unable to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f2f2f0]">

      <section className="py-6 md:py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mt-2">
          Contact Us
        </h1>

        <p className="text-gray-600 text-[15px] px-2 md:text-base mt-4">
          We’re here to help. Let’s make your stay unforgettable.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 grid md:grid-cols-2 gap-12">

        <div className="p-4 md:p-10 bg-white shadow-xl border border-gray-200 rounded-[12px]">

          <h2 className="text-2xl font-semibold text-gray-900 pb-4 md:mb-6 tracking-wide">
            Get in Touch
          </h2>

          <p className="text-gray-600 text-[14px] mb-8 leading-relaxed">
            Whether you have questions about bookings, payments, or want to list your resort — we’re here to help.
          </p>

          <div className="space-y-8">
            <InfoRow
              icon={<Phone size={20} />}
              title="Phone"
              value="+91 91564 80600"
            />

            <InfoRow
              icon={<Mail size={20} />}
              title="Email"
              value="web.karabook@gmail.com"
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
        <div className="p-4 md:p-10 bg-white shadow-xl border border-gray-200 rounded-[12px]">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
            Send Us a Message
          </h2>

          <div className="space-y-4 md:space-y-6">

            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`rounded-[10px] h-12 text-sm tracking-wide border ${errors.name ? "border-red-500" : "border-gray-300"
                } focus:border-[#0e8892] focus:ring-0`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}

            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              type="email"
              className={`rounded-[10px] h-12 text-sm tracking-wide border ${errors.email ? "border-red-500" : "border-gray-300"
                } focus:border-[#0e8892] focus:ring-0`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}

            <Input
              name="phone"
              value={form.phone}
              onChange={handlePhoneChange}
              onPaste={handlePhonePaste}
              placeholder="Phone Number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              className={`rounded-[10px] h-12 text-sm tracking-wide border ${errors.phone ? "border-red-500" : "border-gray-300"
                } focus:border-[#0e8892] focus:ring-0`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}

            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message..."
              maxLength={500}
              className={`rounded-[10px] h-32 text-sm tracking-wide border ${errors.message ? "border-red-500" : "border-gray-300"
                } focus:border-[#0e8892] focus:ring-0`}
            />
            <div className="flex justify-between">
              {errors.message ? (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400 mt-1">
                {form.message.length}/500
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-[10px] h-12 tracking-[2px] text-sm uppercase bg-[#0e8892] hover:bg-[#0b6f75] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>

            {success && (
              <p className="text-green-600 text-sm text-center">
                Your message has been sent. We will contact you soon.
              </p>
            )}

          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="w-full h-[280px] md:h-[380px] border-t border-gray-300 shadow-inner">
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
