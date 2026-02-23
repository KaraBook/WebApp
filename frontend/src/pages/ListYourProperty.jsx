import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Inbox, Map } from "lucide-react";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";

export default function ListYourProperty() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    propertyName: "",
    address: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, mobile: value }));
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, mobile: cleaned }));
  };

  const validate = () => {
    const err = {};

    if (!form.name.trim()) err.name = "Name required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) err.mobile = "Invalid mobile";
    if (!form.propertyName.trim()) err.propertyName = "Property name required";
    if (!form.address.trim()) err.address = "Address required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await axios({
        method: SummaryApi.propertyLead.method,
        url: baseURL + SummaryApi.propertyLead.url,
        data: form,
      });

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        mobile: "",
        propertyName: "",
        address: "",
        message: "",
      });

    } catch (err) {
      alert("Unable to submit request");
    } finally {
      setLoading(false);
    }
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
              <a
                href="tel: +919156480600"
                className="flex gap-2 items-center"
              >
                <Phone className="w-4 h-4" />
                +91 91564 80600
              </a>
              <a
                href="mailto:web.karabook@gmail.com"
                className="flex gap-2 items-center"
              >
                <Inbox className="w-4 h-4" />
                web.karabook@gmail.com
              </a>
              <p className="flex gap-2 items-center">
                <Map className="w-4 h-4" />
                Mon–Sat, 10:00 AM – 7:00 PM
              </p>
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
                value={form.mobile}
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile Number"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs">{errors.mobile}</p>
              )}

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

              <Button
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
              {success && (
                <p className="text-green-600 text-sm text-center">
                  Thank you! Our onboarding team will contact you shortly.
                </p>
              )}

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
