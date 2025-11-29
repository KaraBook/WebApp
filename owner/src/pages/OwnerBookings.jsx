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
  RotateCcw,
  CalendarDays,
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

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { format } from "date-fns";
import { toast } from "sonner";

import { DateRange } from "react-date-range";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoicePreview from "@/components/InvoicePreview";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [query, setQuery] = useState("");

  // Filters
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pagination
  const pageSize = 10;
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

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

  // FILTERING LOGIC
  useEffect(() => {
    let data = [...bookings];

    // SEARCH FILTER
    const q = query.toLowerCase();
    data = data.filter(
      (b) =>
        b._id?.toLowerCase().includes(q) ||
        b?.userId?.firstName?.toLowerCase().includes(q) ||
        b.userId?.lastName?.toLowerCase().includes(q) ||
        b.userId?.mobile?.includes(q) ||
        b.propertyId?.propertyName?.toLowerCase().includes(q)
    );

    // PAYMENT FILTER
    if (paymentFilter !== "all") {
      data = data.filter((b) => b.paymentStatus === paymentFilter);
    }

    // DATE RANGE FILTER
    if (dateRange[0].startDate && dateRange[0].endDate) {
      data = data.filter((b) => {
        const created = new Date(b.createdAt);
        return (
          created >= dateRange[0].startDate &&
          created <= dateRange[0].endDate
        );
      });
    }

    setFiltered(data);
    setPage(1);
  }, [query, paymentFilter, dateRange, bookings]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
        <span
          className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}
        >
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
  const formatDate = (d) => format(new Date(d), "d MMM yy");

  return (
    <>
      <div className="bg-[#f5f5f7] min-h-screen px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-3">
              Bookings
            </h1>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={fetchBookings}
            >
              <RotateCcw size={16} />
              Refresh
            </Button>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">

            {/* Search */}
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search booking, traveller, phone, property"
                className="bg-transparent border-none focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Payment Filter — SHADCN SELECT */}
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

            {/* Date filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker((p) => !p)}
                className="flex items-center gap-2 border-gray-300"
              >
                <CalendarDays size={15} /> Date Range
              </Button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 z-50 shadow-2xl border bg-white rounded-xl">
                  <DateRange
                    editableDateInputs={true}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    rangeColors={["#0ea5e9"]}
                    className="p-3 rounded-xl border border-gray-100 shadow-lg"
                  />
                </div>
              )}
            </div>
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
                          <Phone size={12} /> {b.userId?.mobile}
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4">{b.propertyId?.propertyName}</td>

                      <td className="py-3 px-4">{formatDate(b.checkIn)}</td>
                      <td className="py-3 px-4">{formatDate(b.checkOut)}</td>

                      <td className="py-3 px-4">{b.totalNights}</td>

                      <td className="py-3 px-4">
                        {typeof b.guests === "number"
                          ? `${b.guests} Guests`
                          : `${b.guests.adults + b.guests.children} Guests`}
                      </td>

                      <td className="py-3 px-4 font-medium flex items-center gap-1">
                        <IndianRupee size={14} className="text-primary" />
                        {formatCurrency(b.totalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusChip(b.paymentStatus)}
                      </td>

                      <td className="py-3 px-4 text-gray-500 text-xs">
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

                            <DropdownMenuItem
                              onSelect={() => openConfirm("resend", b)}
                            >
                              Resend Links (WA + Email)
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
                : "Resend booking confirmation to traveller."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}>
              {confirm.type === "invoice" ? "Download" : "Send Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Invoice */}
      {invoiceData && (
        <div
          ref={invoiceRef}
          className="absolute left-[-9999px] top-0 w-[794px] bg-white p-8"
        >
          <InvoicePreview invoice={invoiceData} />
        </div>
      )}
    </>
  );
}
