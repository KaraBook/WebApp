import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Phone, MoreVertical, Download, FileDown, Eye, Star, PhoneCall, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BookingDetailsDialog from "../BookingDetailsDialog";
import MobileBookingCard from "../MobileBookingCard";
import RateBookingDialog from "../RateBookingDialog";


function resolveBookingStatus(b) {
  if (b.status === "cancelled") return "cancelled";

  if (
    b.paymentStatus === "paid" ||
    b.status === "paid" ||
    b.status === "confirmed" ||
    b.paymentId
  ) {
    return "confirmed";
  }

  return "pending";
}

function canViewInvoice(b) {
  return resolveBookingStatus(b) === "confirmed";
}


export default function Bookings() {
  const { accessToken } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [openGuestRow, setOpenGuestRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ratingBooking, setRatingBooking] = useState(null);


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

  const fullName = (user) => {
    if (!user) return "—";
    return `${user.firstName} ${user.lastName}`;
  };

  const phoneNumber = (user) => {
    if (!user || !user.mobile) return "—";
    return user.mobile;
  };


  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".guest-dropdown-cell")) {
        setOpenGuestRow(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
    <div className="w-full px-0 md:px-4 min-h-[calc(100vh-160px)]">
      {/* TITLE */}
      <h1 className="text-2xl font-[600] uppercase tracking-[1px] text-[#233b19] mb-6">My Bookings</h1>


      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {paginatedBookings.map((b) => (
          <MobileBookingCard
            key={b._id}
            booking={b}
            onView={(booking) => setSelectedBooking(booking)}
            onRate={(booking) => setRatingBooking(booking)}
          />
        ))}

        {bookings.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            No bookings found
          </p>
        )}
      </div>

      {/* TABLE WRAPPER */}
      <div className="hidden md:block border border-gray-200 bg-white shadow-lg rounded-[12px]">

        {/* TABLE SCROLL AREA */}
        <div className="relative overflow-hidden rounded-[12px]">
          <div className="overflow-x-auto lg:overflow-x-auto lg:overflow-y-hidden min-h-[75vh]">
            <table className="min-w-[1000px] w-full text-sm">
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

                {paginatedBookings.map((b) => {
                  const nights = Math.max(
                    1,
                    (new Date(b.checkOut) - new Date(b.checkIn)) /
                    (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-gray-50 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="px-4 py-3 font-medium uppercase text-[#233b19]">
                        #{b._id.slice(-5)}
                      </td>

                      <td className="px-4 py-3 cursor-pointer">
                        <span onClick={() => setSelectedBooking(b)} className="cursor-pointer">{b.property?.propertyName || "—"}</span>
                      </td>

                      <td className="px-4 py-3">
                        {format(new Date(b.checkIn), "dd MMM yyyy")}
                      </td>

                      <td className="px-4 py-3">
                        {format(new Date(b.checkOut), "dd MMM yyyy")}
                      </td>

                      <td className="px-4 py-3 text-center">{nights}</td>

                      <td className="px-4 py-3 text-center relative guest-dropdown-cell">
                        <button
                          onClick={() => setOpenGuestRow(openGuestRow === b._id ? null : b._id)}
                          className="text-[#233b19] font-medium"
                        >
                          {typeof b.guests === "number"
                            ? `${b.guests} Guests`
                            : `${b.guests.adults + b.guests.children} Guests${b.guests.infants ? ` + ${b.guests.infants} Infants` : ""
                            }`}
                        </button>

                        {/* Dropdown */}
                        {openGuestRow === b._id && typeof b.guests !== "number" && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-10 w-40 bg-white border shadow-lg rounded-md p-3 text-left z-50">
                            <div className="text-sm py-1 flex justify-between">
                              <span>Adults</span>
                              <span className="font-semibold">{b.guests.adults}</span>
                            </div>
                            <div className="text-sm py-1 flex justify-between">
                              <span>Children</span>
                              <span className="font-semibold">{b.guests.children}</span>
                            </div>
                            <div className="text-sm py-1 flex justify-between">
                              <span>Infants</span>
                              <span className="font-semibold">{b.guests.infants}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        ₹{b.totalAmount.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 relative group cursor-default flex justify-center">
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

                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="h-5 w-5 text-gray-700 hover:text-black cursor-pointer" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="shadow-md border bg-white p-1">
                            <DropdownMenuItem onClick={() => setSelectedBooking(b)}>
                              <div className="flex items-center gap-2">
                                <Eye size={16} /> View Booking
                              </div>
                            </DropdownMenuItem>
                            {canViewInvoice(b) ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/account/invoice/${b._id}`;
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <FileDown size={16} /> View Invoice
                                </div>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                disabled
                                className="text-gray-400 cursor-not-allowed"
                                onClick={() => {
                                  toast.error(
                                    "Payment not completed. Invoice will be available once the booking is confirmed."
                                  );
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <FileDown size={16} /> Invoice not available
                                </div>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                if (b.paymentStatus !== "paid") {
                                  toast.error("You can rate only after payment is completed.");
                                  return;
                                }
                                setRatingBooking(b);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" /> Rate this Resort
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(`tel:${b.property?.contactNumber}`)
                              }
                            >
                              <div className="flex items-center gap-2">
                                <PhoneCall size={16} /> Call Resort
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-red-600">
                              <div className="flex items-center gap-2">
                                <XCircle size={16} />
                                Cancel Booking
                              </div>
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



        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center my-4 gap-2 px-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border disabled:opacity-50 rounded-[8px]"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded-[8px] ${currentPage === index + 1 ? "bg-primary text-white" : ""
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-[8px] disabled:opacity-50"
            >
              Next
            </button>
          </div>

        )}
      </div>


      {/* BOOKING DETAILS */}
      <BookingDetailsDialog
        open={!!selectedBooking}
        booking={selectedBooking}
        onOpenChange={(o) => !o && setSelectedBooking(null)}
      />

      {/* RATE BOOKING */}
      <RateBookingDialog
        open={!!ratingBooking}
        booking={ratingBooking}
        onClose={() => setRatingBooking(null)}
      />

    </div>
  );
}
