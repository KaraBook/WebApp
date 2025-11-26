import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Phone, MoreVertical, Download, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Bookings() {
  const { accessToken } = useAuthStore();
  const [bookings, setBookings] = useState([]);

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

  const statusDot = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="w-full px-4">
      {/* TITLE */}
      <h1 className="text-2xl font-[500] uppercase tracking-[1px] text-[#233b19] mb-6">My Bookings</h1>

      {/* TABLE WRAPPER */}
      <div className="border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                {[
                  "Booking ID",
                  "Property",
                  "Check-in",
                  "Check-out",
                  "Nights",
                  "Guests",
                  "Amount",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium border-r last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}

              {bookings.map((b) => {
                const nights = Math.max(
                  1,
                  (new Date(b.checkOut) - new Date(b.checkIn)) /
                  (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <td className="px-4 py-3 font-medium text-[#233b19]">
                      #{b._id.slice(-5)}
                    </td>

                    <td className="px-4 py-3">
                      {b.property?.propertyName || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(b.checkIn), "dd MMM yyyy")}
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(b.checkOut), "dd MMM yyyy")}
                    </td>

                    <td className="px-4 py-3 text-center">{nights}</td>

                    <td className="px-4 py-3 text-center">{b.guests}</td>

                    <td className="px-4 py-3 font-semibold">
                      ₹{b.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 relative group cursor-default">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${statusDot(
                          b.paymentStatus
                        )}`}
                      ></span>

                      <div
                        className="
      absolute left-1/2 -translate-x-1/2 top-7
      bg-black text-white text-[11px] px-2 py-1 rounded
      opacity-0 group-hover:opacity-100
      transition-all duration-200 whitespace-nowrap
      pointer-events-none z-50
    "
                      >
                        {b.paymentStatus?.toUpperCase()}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {format(new Date(b.createdAt), "dd MMM yyyy")}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-5 w-5 text-gray-700 hover:text-black cursor-pointer" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="shadow-md border bg-white p-1">
                          <DropdownMenuItem asChild>
                            <Link to={`/account/invoice/${b._id}`}>
                              <div className="flex items-center gap-2">
                                <FileDown size={16} /> View Invoice
                              </div>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`tel:${b.property?.contactNumber}`)
                            }
                          >
                            Call Resort
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-red-600">
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
