import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Inbox, Map } from "lucide-react";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { toast } from "sonner";

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
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      err.email = "Invalid email";
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      err.mobile = "Invalid mobile";
    if (!form.propertyName.trim())
      err.propertyName = "Property name required";
    if (!form.address.trim())
      err.address = "Address required";

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
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          propertyName: form.propertyName.trim(),
          address: form.address.trim(),
          message: form.message.trim(),
        },
      });

      toast.success(
        "Request submitted successfully! Our onboarding team will contact you shortly.",
        { duration: 4000 }
      );

      setForm({
        name: "",
        email: "",
        mobile: "",
        propertyName: "",
        address: "",
        message: "",
      });

      setErrors({});

    } catch (err) {
      console.error(err);

      toast.error("Unable to submit request. Please try again.");
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
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full border rounded-lg px-4 py-3 text-sm"
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
                value={form.propertyName}
                onChange={handleChange}
                placeholder="Property Name"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Property Address"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Message (optional)"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />

              <Button
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
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
