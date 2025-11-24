import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Support request sent successfully!");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const faqs = [
    {
      q: "Where can I see all my bookings?",
      a: 'Go to "My Bookings" in your dashboard to view your upcoming, past, and cancelled bookings.',
    },
    {
      q: "Can I cancel a booking from my dashboard?",
      a: "Yes. In 'Upcoming Bookings', select the booking and click “Cancel Booking.” Cancellation rules may apply depending on the resort.",
    },
    {
      q: "How do I know if my booking is confirmed?",
      a: "You’ll see it under 'Upcoming Bookings' and receive an email & WhatsApp confirmation immediately after successful payment.",
    },
    {
      q: "Where can I view or download my invoice?",
      a: 'For each confirmed booking, an invoice is available inside the booking detail view — look for the “Download Invoice” option.',
    },
    {
      q: "Can I modify my check-in or check-out date after booking?",
      a: "Currently, date changes aren't allowed via dashboard. Please raise a support ticket if modification is necessary.",
    },
    {
      q: "How can I write or edit a review for a resort I stayed at?",
      a: 'After your stay, visit “My Ratings” or “Past Bookings” and click “Write a Review”. You can edit/delete it within 7 days.',
    },
    {
      q: "Where can I check the status of my cancellation or refund?",
      a: 'In “Cancelled Bookings,” the refund status is shown for each booking. For issues, use the Support Ticket option.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-0 px-2">
      <h1 className="text-2xl uppercase tracking-[1px] font-[500] mb-6 text-[#233b19]">
        Support & Help
      </h1>
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm mb-8 rounded-[0] ">
          <TabsTrigger value="contact" className="rounded-[0]">
            <Mail className="w-4 h-4 mr-2" /> Contact Form
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="w-4 h-4 mr-2" /> FAQs
          </TabsTrigger>
        </TabsList>

        {/* Contact Form */}
        <TabsContent value="contact">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 shadow-sm rounded-[0] p-6 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="rounded-[0]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="rounded-[0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Subject
              </label>
              <Input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
                className="rounded-[0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Message
              </label>
              <Textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="rounded-[0]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary text-white px-6 py-2 rounded-[0]"
              >
                Send Message
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faq">
          <div className="bg-white border border-gray-200 shadow-sm rounded-[0] p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left text-sm font-medium text-gray-800">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
