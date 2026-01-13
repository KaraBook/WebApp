import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Inbox, Map } from "lucide-react";

export default function ListYourProperty() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    propertyName: "",
    address: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call later
    console.log("Property Enquiry:", form);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid md:grid-cols-2">

          {/* LEFT – INFO */}
          <div className="bg-primary text-white p-8 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl text-left font-extrabold text-[#fff] mb-4">
              List Your Property with KaraBook
            </h1>
            <p className="text-sm opacity-90 mb-6">
              Fill in the form and our team will connect with you shortly to help
              you list your property and start earning.
            </p>

            <div className="space-y-3 text-sm">
              <p className="flex gap-2"><Phone className="w-4 h-4" /> +91 9XXXXXXXXX</p>
              <p className="flex gap-2"><Inbox className="w-4 h-4" /> partners@karabook.com</p>
              <p className="flex gap-2"><Map className="w-4 h-4" /> Mon–Sat, 10:00 AM – 7:00 PM</p>
            </div>
          </div>

          {/* RIGHT – FORM */}
          <div className="p-4 md:p-8">
            <h2 className="text-xl font-semibold mb-6">
              Property Listing Request
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                required
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <input
                type="text"
                name="propertyName"
                placeholder="Property Name"
                required
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <textarea
                name="address"
                placeholder="Property Address"
                rows={3}
                required
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Message (optional)"
                rows={3}
                className="w-full border rounded-lg px-4 py-3 text-sm"
                onChange={handleChange}
              />

              <Button className="w-full bg-primary text-white py-3 rounded-lg">
                Submit Request
              </Button>

              <p className="text-xs text-gray-500 text-center mt-2">
                By submitting this form, you agree to be contacted by the
                KaraBook team.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
