import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, IndianRupee, Phone, Filter } from "lucide-react";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import MobileBookingsList from "@/components/MobileBookingList";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoicePreview from "@/components/InvoicePreview";
import BookingDetailsDrawer from "@/components/BookingDetailsDrawer";
import MobileFiltersDrawer from "@/components/MobileFiltersDrawer";


export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const timeFromUrl = searchParams.get("time") || "upcoming";
  const statusFromUrl = searchParams.get("status") || "all";

  const [timeFilter, setTimeFilter] = useState(timeFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

  const [viewBooking, setViewBooking] = useState({
    open: false,
    booking: null,
  });

  const shortBookingId = (id) =>
    id ? `#${String(id).slice(-4).toUpperCase()}` : "-";

  const openBookingDialog = (booking) => {
    setViewBooking({ open: true, booking });
  };

  const closeBookingDialog = () => {
    setViewBooking({ open: false, booking: null });
  };

  const [confirm, setConfirm] = useState({
    open: false,
    type: "",
    booking: null,
  });

  const closeConfirm = () =>
    setConfirm({ open: false, type: "", booking: null });

  const openConfirm = (type, booking) =>
    setConfirm({ open: true, type, booking });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(SummaryApi.getOwnerBookings.url);
      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sorted);
      setFiltered(sorted);
      setPage(1);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    let data = [...bookings];

    const q = query.toLowerCase();
    data = data.filter(
      (b) =>
        b._id?.toLowerCase().includes(q) ||
        b?.userId?.firstName?.toLowerCase().includes(q) ||
        b.userId?.lastName?.toLowerCase().includes(q) ||
        b.userId?.mobile?.includes(q) ||
        b.propertyId?.propertyName?.toLowerCase().includes(q)
    );

    if (timeFilter === "upcoming") {
      data = data.filter(b => new Date(b.checkOut) >= todayStart);
    }

    if (statusFilter === "confirmed") {
      data = data.filter(b =>
        b.paymentStatus === "paid" && !b.cancelled
      );
    }

    if (statusFilter === "pending") {
      data = data.filter(b =>
        ["pending", "initiated", "failed"].includes(b.paymentStatus)
      );
    }

    if (statusFilter === "cancelled") {
      data = data.filter(b =>
        b.cancelled || b.paymentStatus === "cancelled"
      );
    }

    if (timeFilter === "past") {
      data = data.filter(b => new Date(b.checkOut) < todayStart);
    }

    if (statusFilter !== "all") {
      data = data.filter(b => {
        const s = b.paymentStatus;
        if (statusFilter === "confirmed") return s === "paid";
        if (statusFilter === "pending") return ["pending", "initiated", "failed"].includes(s);
        if (statusFilter === "cancelled") return s === "cancelled";
        return true;
      });
    }

    data.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

    setFiltered(data);
    setPage(1);
  }, [query, timeFilter, statusFilter, bookings]);



  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // STATUS CHIP
  const getStatusChip = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-medium border inline-block";

    if (status === "paid") {
      return (
        <span className={`${base} bg-green-50 border-green-200 text-green-700`}>
          Confirmed
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className={`${base} bg-gray-100 border-gray-300 text-gray-600`}>
          Cancelled
        </span>
      );
    }
    return (
      <span className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}>
        Pending
      </span>
    );
  };

  const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;
  const formatCurrency = (n) => `₹${Number(n).toLocaleString()}`;
  const formatDate = (d) => format(new Date(d), "dd MMM yyyy");

  // 🧾 DOWNLOAD INVOICE FUNCTION
  const downloadInvoicePDF = async (booking) => {
    try {
      if (booking.paymentStatus !== "paid") {
        return toast.error("Invoice can only be downloaded for paid bookings.");
      }

      toast.info("Generating Invoice…");

      const res = await api.get(
        SummaryApi.ownerGetInvoice.url(booking._id)
      );

      if (!res.data.success) {
        return toast.error("Invoice not found.");
      }

      setInvoiceData(res.data.data);

      // Wait for the preview to render
      await new Promise((r) => setTimeout(r, 250));

      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2 });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${booking._id}.pdf`);
      toast.success("Invoice downloaded!");

      setTimeout(() => setInvoiceData(null), 300);
    } catch (err) {
      console.log(err);
      toast.error("Failed to generate invoice.");
    }
  };

  const handleConfirmAction = async () => {
    const b = confirm.booking;

    if (!b) return;

    if (confirm.type === "invoice") {
      await downloadInvoicePDF(b);
    }

    if (confirm.type === "resend") {
      // TODO: later if needed
    }

    closeConfirm();
  };

  return (
    <>
      <div className="bg-[#f5f5f7] min-h-screen md:px-8 px-2 py-4 md:py-6">
        <div className="max-w-7xl mx-auto md:space-y-4 space-y-4">

          {/* PAGE HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="md:text-[26px] text-[20px] font-bold text-gray-900">Bookings</h1>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white flex-col md:flex-row items-start p-2 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex items-center w-full gap-2 md:gap-3 flex-1">
              <div className="flex items-center justify-start">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search booking, traveller, phone, property"
                className="bg-transparent shadow-none border-none focus-visible:ring-0 text-[14px] md:text-[18px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              </div>

              {/* Mobile only */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden p-3 bg-[#e9e9e9] rounded-xl border"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop only */}
            <div className="hidden md:block">
              <Select value={timeFilter} onValueChange={(val) => {
                setTimeFilter(val);
                navigate(`/bookings?time=${val}&status=${statusFilter}`);
              }}>
                <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block">
              <Select value={statusFilter} onValueChange={(val) => {
                setStatusFilter(val);
                navigate(`/bookings?time=${timeFilter}&status=${val}`);
              }}>
                <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TABLE */}
          <div className="block md:hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-14 text-gray-500">
                No bookings found.
              </div>
            ) : (
              <MobileBookingsList
                bookings={filtered}
                onOpenBooking={openBookingDialog}
                showHeader={false}
              />
            )}
          </div>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="md:min-w-full min-w-[1200px] text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left">Booking ID</th>
                    <th className="py-3 px-4 text-left">Traveller</th>
                    <th className="py-3 px-4 text-left">Property</th>
                    <th className="py-3 px-4 text-left">Check-in</th>
                    <th className="py-3 px-4 text-left">Check-out</th>
                    <th className="py-3 px-4 text-left">Nights</th>
                    <th className="py-3 px-4 text-left">Guests</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Created</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((b) => (
                    <tr
                      key={b._id}
                      onClick={() => openBookingDialog(b)}
                      className="
    border-b
    hover:bg-gray-50
    transition
    cursor-pointer
  "
                    >

                      <td className="py-3 px-4">
                        <button
                          onClick={() => openBookingDialog(b)}
                          className="font-semibold text-primary hover:underline"
                        >
                          {shortBookingId(b._id)}
                        </button>
                      </td>

                      {/* Traveller */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openBookingDialog(b)}
                          className="font-semibold text-left text-black hover:underline"
                        >
                          {b?.userId?.firstName} {b?.userId?.lastName}
                        </button>

                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {b?.userId?.mobile}
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4">{b.propertyId?.propertyName}</td>

                      {/* Dates */}
                      <td className="py-3 px-4">{formatDate(b.checkIn)}</td>
                      <td className="py-3 px-4">{formatDate(b.checkOut)}</td>

                      <td className="py-3 px-4">{b.totalNights}</td>

                      <td className="py-3 px-4">
                        {typeof b.guests === "number"
                          ? `${b.guests} Guests`
                          : `${b.guests.adults + b.guests.children} Guests`}
                      </td>

                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(b.totalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusChip(b.paymentStatus)}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDate(b.createdAt)}
                      </td>

                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="w-48">

                            <DropdownMenuItem onSelect={() => openBookingDialog(b)}>
                              View Booking
                            </DropdownMenuItem>

                            {b.paymentStatus === "paid" ? (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => navigate(`/invoice/${b._id}`)}
                                >
                                  View Invoice
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={() => openConfirm("invoice", b)}
                                >
                                  Download Invoice
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem disabled className="text-gray-400">
                                Invoice available after payment
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onSelect={() =>
                                navigator.clipboard.writeText(b.userId.email)
                              }
                            >
                              Copy Email
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() =>
                                navigator.clipboard.writeText(b.userId.mobile)
                              }
                            >
                              Copy Phone
                            </DropdownMenuItem>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-14 text-gray-500">
                  No bookings found.
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages || 1}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={(o) => !o && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm.type === "invoice"
                ? "Download Invoice"
                : "Resend Booking Details"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.type === "invoice"
                ? "A PDF invoice will be generated."
                : "Send booking confirmation."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirm.type === "invoice" ? "Download" : "Send Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Invoice for PDF capture */}
      {invoiceData && (
        <div
          ref={invoiceRef}
          className="absolute left-[-9999px] top-0 w-[794px] p-8 bg-white"
        >
          <InvoicePreview invoice={invoiceData} />
        </div>
      )}

      <BookingDetailsDrawer
        open={viewBooking.open}
        booking={viewBooking.booking}
        onClose={closeBookingDialog}
      />

      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onApply={() => {
          navigate(`/bookings?time=${timeFilter}&status=${statusFilter}`);
          setMobileFiltersOpen(false);
        }}
      />

    </>
  );
}
