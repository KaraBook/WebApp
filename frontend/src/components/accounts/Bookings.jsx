import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Phone, MoreVertical, Download, FileDown, Eye, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


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
    <div className="w-full px-4 min-h-[calc(100vh-160px)]">
      {/* TITLE */}
      <h1 className="text-2xl font-[500] uppercase tracking-[1px] text-[#233b19] mb-6">My Bookings</h1>

      {/* TABLE WRAPPER */}
      <div className="border border-gray-200 bg-white rounded-[12px]">

        {/* TABLE SCROLL AREA */}
        <div className="relative overflow-hidden rounded-[12px]">
          <div className="overflow-x-auto lg:overflow-x-auto lg:overflow-y-hidden min-h-[75vh]">
            <table className="min-w-[1050px] w-full text-sm">
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

                {paginatedBookings.map((b) => {
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

                      <td className="px-4 py-3">
                        {format(new Date(b.createdAt), "dd MMM yyyy")}
                      </td>

                      <td className="px-4 py-3 text-right">
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
                            <DropdownMenuItem asChild>
                              <Link to={`/account/invoice/${b._id}`}>
                                <div className="flex items-center gap-2">
                                  <FileDown size={16} /> View Invoice
                                </div>
                              </Link>
                            </DropdownMenuItem>
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
                                ⭐ Rate this Resort
                              </div>
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


        {/* BOOKING DETAILS POPUP */}
        {selectedBooking && (
          <Dialog open={true} onOpenChange={() => setSelectedBooking(null)} >
            <DialogContent
              className="
    max-w-3xl
    w-full
    max-h-[85vh]
    overflow-y-auto
    p-6
    mt-6
    rounded-md
  "
            >

              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Booking Details</DialogTitle>
              </DialogHeader>

              {/* PROPERTY DETAILS */}
              <div className="flex gap-4 items-center border-b pb-4 mb-4">
                <img
                  src={selectedBooking.property?.coverImage}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-semibold text-lg">{selectedBooking.property?.propertyName}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedBooking.property?.city}, {selectedBooking.property?.state}
                  </p>
                </div>
              </div>

              {/* ROW 1 — STAY DETAILS + PRICE BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-[15px]">

                {/* LEFT SIDE — STAY DETAILS */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-semibold mb-2">Stay Details</h4>

                  <div className="grid grid-cols-3 gap-4 text-sm">

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Check-in</p>
                      <p className="text-base font-medium mt-1">
                        {format(new Date(selectedBooking.checkIn), "dd MMM yyyy")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Check-out</p>
                      <p className="text-base font-medium mt-1">
                        {format(new Date(selectedBooking.checkOut), "dd MMM yyyy")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Nights</p>
                      <p className="text-base mt-1 font-semibold text-[#233b19]">
                        {selectedBooking.totalNights}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Payment</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded
              ${selectedBooking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : selectedBooking.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
            `}
                      >
                        {selectedBooking.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Booking Date</p>
                      <p className="text-base font-medium mt-1">
                        {format(new Date(selectedBooking.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">SubTotal</p>
                      <p className="text-base font-semibold mt-1">
                        ₹{selectedBooking.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase">Guests</p>
                      <div className="text-base font-medium mt-1">
                        <p>Adults: {selectedBooking.guests.adults}</p> | <p>Children: {selectedBooking.guests.children}</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* RIGHT SIDE — PRICE BREAKDOWN */}
                <div className="bg-white border rounded-md p-4 h-fit shadow-sm">
                  <h4 className="font-semibold mb-2">Price Breakdown</h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{selectedBooking.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">
                      ₹{Math.round(selectedBooking.totalAmount * 0.10).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t my-3"></div>

                  <div className="flex justify-between text-base font-semibold text-[#233b19]">
                    <span>Total</span>
                    <span>
                      ₹{(
                        selectedBooking.totalAmount +
                        Math.round(selectedBooking.totalAmount * 0.10)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* ROW 2 — GUESTS + TRAVELLER DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                {/* RIGHT — TRAVELLER DETAILS */}
                <div className="bg-white border rounded-md p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Traveller Details</h4>

                  <div className="text-sm space-y-1">
                    <p>Name: {selectedBooking.user?.fullName || "—"}</p>
                    <p>Phone: {selectedBooking.user?.phone || "—"}</p>
                    <p>Email: {selectedBooking.user?.email || "—"}</p>
                  </div>
                </div>

              </div>

            </DialogContent>
          </Dialog>
        )}


        {ratingBooking && (
          <Dialog open={true} onOpenChange={() => setRatingBooking(null)}>
            <DialogContent className="max-w-md p-6 rounded-none mt-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Rate this Resort</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${star <= (ratingBooking.rating || 0)
                        ? "text-black fill-black"
                        : "text-gray-400"
                        }`}
                      onClick={() =>
                        setRatingBooking((rb) => ({ ...rb, rating: star }))
                      }
                    />
                  ))}
                </div>

                <textarea
                  className="w-full border p-3"
                  rows="3"
                  placeholder="Write your review..."
                  onChange={(e) =>
                    setRatingBooking((rb) => ({ ...rb, comment: e.target.value }))
                  }
                />

                <button
                  className="w-full bg-primary text-white py-3 rounded-none"
                  onClick={async () => {
                    try {
                      await Axios.post(
                        SummaryApi.addReview.url,
                        {
                          propertyId: ratingBooking.property?._id,
                          bookingId: ratingBooking._id,
                          rating: ratingBooking.rating,
                          comment: ratingBooking.comment,
                        },
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                      );

                      toast.success("Review submitted!");
                      setRatingBooking(null);
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to submit review");
                    }
                  }}
                >
                  Submit Review
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}


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
    </div>
  );
}
