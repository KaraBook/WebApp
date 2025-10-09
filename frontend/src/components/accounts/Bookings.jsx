import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Phone, FileDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import InvoicePage from "@/pages/InvoicePage";
import { Link } from "react-router-dom";

export default function Bookings() {
  const { accessToken } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios.get(SummaryApi.getUserBookings.url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setBookings(res.data.data || []);
      } catch {
        toast.error("Failed to load bookings");
      }
    })();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-500";
      case "pending": return "bg-blue-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const handleDownload = async (booking) => {
    setSelected(booking);
    setTimeout(async () => {
      const invoiceElement = document.getElementById("invoice-pdf");
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`Invoice-${booking._id}.pdf`);
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-0">
  <h1 className="text-2xl font-semibold text-[#233b19] mb-6">
    My Bookings
  </h1>

  <div className="bg-white border rounded-xl shadow-sm">
    {/* This div handles scroll only for table */}
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-xl">
      <table className="min-w-[1200px] w-full border-collapse text-sm ">
        <thead className="bg-gray-100 text-gray-700 sticky top-0">
          <tr>
            {[
              "Sr. No.",
              "Booking ID",
              "Property Name",
              "State",
              "City",
              "Check-in Date",
              "Check-out Date",
              "Nights",
              "Guests",
              "Total Amount",
              "Payment Status",
              "Booking Date",
              "Resort Contact",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 border text-left font-medium whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          {bookings.map((b, i) => {
            const nights = Math.max(
              1,
              (new Date(b.checkOut) - new Date(b.checkIn)) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <tr key={b._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-[#233b19]">
                  {b._id.slice(-5)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {b.property?.propertyName || "—"}
                </td>
                <td className="px-4 py-3">{b.property?.state || "—"}</td>
                <td className="px-4 py-3">{b.property?.city || "—"}</td>
                <td className="px-4 py-3">
                  {format(new Date(b.checkIn), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  {format(new Date(b.checkOut), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-center">{nights}</td>
                <td className="px-4 py-3 text-center">{b.guests}</td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  ₹{b.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      b.paymentStatus === "paid"
                        ? "bg-green-500"
                        : b.paymentStatus === "pending"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(b.createdAt), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-gray-600 hover:text-[#233b19]">
                    <Phone className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-4 py-3 space-y-1">
                  <Link to={`/invoice/${b._id}`}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <FileDown className="w-4 h-4 mr-1" /> Invoice
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
}
