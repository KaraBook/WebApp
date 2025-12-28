import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Search,
  IndianRupee,
  Phone,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { format } from "date-fns";
import { toast } from "sonner";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoicePreview from "@/components/InvoicePreview";


export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");

  const [paymentFilter, setPaymentFilter] = useState("all");

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // INVOICE
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

  // CONFIRM DIALOG
  const [confirm, setConfirm] = useState({
    open: false,
    type: "",
    booking: null,
  });

  const closeConfirm = () =>
    setConfirm({ open: false, type: "", booking: null });

  const openConfirm = (type, booking) =>
    setConfirm({ open: true, type, booking });

  // FETCH BOOKINGS
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

  // FILTER LOGIC
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

    if (paymentFilter !== "all") {
      data = data.filter((b) => b.paymentStatus === paymentFilter);
    }

    setFiltered(data);
    setPage(1);
  }, [query, paymentFilter, bookings]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // STATUS CHIP
  const getStatusChip = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-medium border inline-block";

    if (status === "paid")
      return (
        <span className={`${base} bg-green-50 border-green-200 text-green-700`}>
          Paid
        </span>
      );
    if (status === "pending")
      return (
        <span className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}>
          Pending
        </span>
      );
    return (
      <span className={`${base} bg-red-50 border-red-200 text-red-700`}>
        Failed
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
      <div className="bg-[#f5f5f7] min-h-screen md:px-8 px-4 py-6">
        <div className="max-w-7xl mx-auto md:space-y-8 space-y-4">

          {/* PAGE HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="md:text-[26px] text-[20px] font-bold text-gray-900">Bookings</h1>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search booking, traveller, phone, property"
                className="bg-transparent shadow-none border-none focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Payment Filter */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Payment: All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left">Traveller</th>
                    <th className="py-3 px-4 text-left">Property</th>
                    <th className="py-3 px-4 text-left">Check-in</th>
                    <th className="py-3 px-4 text-left">Check-out</th>
                    <th className="py-3 px-4 text-left">Nights</th>
                    <th className="py-3 px-4 text-left">Guests</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Payment</th>
                    <th className="py-3 px-4 text-left">Created</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((b) => (
                    <tr
                      key={b._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* Traveller */}
                      <td className="py-3 px-4">
                        <div className="font-semibold">
                          {b?.userId?.firstName} {b?.userId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
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

                      <td className="py-3 px-4 flex items-center gap-1 font-medium">
                        {formatCurrency(b.totalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusChip(b.paymentStatus)}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDate(b.createdAt)}
                      </td>

                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="w-48">

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
    </>
  );
}
