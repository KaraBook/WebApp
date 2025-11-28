import { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoicePreview from "@/components/InvoicePreview";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

  const [confirm, setConfirm] = useState({
    open: false,
    type: "",
    booking: null,
  });

  const closeConfirm = () => setConfirm({ open: false, type: "", booking: null });
  const openConfirm = (type, booking) => {
    setConfirm({ open: true, type, booking });
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get(SummaryApi.getOwnerBookings.url);
      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sorted);
      setFiltered(sorted);
      setBookings(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const result = bookings.filter((b) => {
      return (
        b._id?.toLowerCase().includes(q) ||
        b?.userId?.firstName?.toLowerCase().includes(q) ||
        b.userId?.lastName?.toLowerCase().includes(q) ||
        b.propertyId?.propertyName?.toLowerCase().includes(q) ||
        b.userId?.mobile?.includes(q)
      );
    });
    setFiltered(result);
  }, [query, bookings]);

  const getStatusChip = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === "paid")
      return <span className={`${base} bg-green-100 text-green-700`}>Paid</span>;
    if (status === "pending")
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    return <span className={`${base} bg-red-100 text-red-700`}>Failed</span>;
  };

  const shortId = (id) => `#${String(id).slice(-6).toUpperCase()}`;
  const formatCurrency = (n) => `₹${Number(n).toLocaleString()}`;
  const formatDate = (d) => format(new Date(d), "d MMM yy");
  const formatDateLong = (d) => format(new Date(d), "d MMMM yyyy");

  const handleCopy = async (text, label) => {
    await navigator.clipboard.writeText(text || "");
    toast.success(`${label} copied`);
  };

  const openWhatsApp = (phone, text) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const downloadInvoicePDF = async (bookingId) => {
    try {
      toast.info("Generating Invoice…");

      const res = await api.get(`${SummaryApi.ownerGetInvoice.url(bookingId)}`);
      if (!res.data.success) return toast.error("Invoice not found");

      setInvoiceData(res.data.data);

      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

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

      pdf.save(`Invoice_${bookingId}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error("Failed to generate invoice");
    } finally {
      setTimeout(() => setInvoiceData(null), 300);
    }
  };

  const onConfirm = async () => {
    const b = confirm.booking;
    closeConfirm();

    if (confirm.type === "invoice") {
      await downloadInvoicePDF(b._id);
    }

    if (confirm.type === "resend") {
      const lines = [
        `🎉 Booking Confirmed!`,
        ``,
        `Your booking ${shortId(b._id)} is confirmed.`,
        `Property: ${b.propertyId.propertyName}`,
        `Check-in: ${formatDateLong(b.checkIn)}`,
        `Check-out: ${formatDateLong(b.checkOut)}`,
        `Guests: ${b.guests}`,
        `Amount: ${formatCurrency(b.totalAmount)}`,
      ];

      const waText = lines.join("\n");
      openWhatsApp(b.userId.mobile, waText);
    }
  };

  return (
    <>
      <div className="p-2">
        <h1 className="text-2xl font-semibold mb-6">Bookings</h1>

        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search booking / traveller / phone / property"
            className="w-80 bg-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Button onClick={fetchBookings}>Refresh</Button>
        </div>

        <div className="border rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Traveller</th>
                <th className="py-3 px-4 text-left font-medium">Property</th>
                <th className="py-3 px-4 text-left font-medium">Check-in</th>
                <th className="py-3 px-4 text-left font-medium">Check-out</th>
                <th className="py-3 px-4 text-left font-medium">Nights</th>
                <th className="py-3 px-4 text-left font-medium">Guests</th>
                <th className="py-3 px-4 text-left font-medium">Amount</th>
                <th className="py-3 px-4 text-left font-medium">Payment</th>
                <th className="py-3 px-4 text-left font-medium">Created</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold">
                      {(b?.userId?.firstName || "") + " " + (b?.userId?.lastName || "")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {b?.userId?.mobile || "—"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {b.propertyId?.propertyName}
                  </td>

                  <td className="py-3 px-4">{formatDate(b.checkIn)}</td>
                  <td className="py-3 px-4">{formatDate(b.checkOut)}</td>

                  <td className="py-3 px-4">{b.totalNights}</td>
                  <td className="py-3 px-4">{b.guests}</td>

                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(b.totalAmount)}
                  </td>

                  <td className="py-3 px-4">{getStatusChip(b.paymentStatus)}</td>

                  <td className="py-3 px-4 text-xs text-gray-500">
                    {formatDate(b.createdAt)}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-5 w-5 cursor-pointer text-gray-600" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="w-48">
                        {b.paymentStatus === "paid" ? (
                          <>
                            <DropdownMenuItem
                              onSelect={() => window.open(`/owner/invoice/${b._id}`,)}
                            >
                              View Invoice
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => openConfirm("invoice", b)}>
                              Download Invoice
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast.error(
                                  `Please rebook the resort. Your payment is ${b.paymentStatus}.`
                                )
                              }
                            >
                              View Invoice
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onSelect={() =>
                                toast.error(
                                  `Please rebook the resort. Your payment is ${b.paymentStatus}.`
                                )
                              }
                            >
                              Download Invoice
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuItem onSelect={() => handleCopy(b.userId.email, "Email")}>
                          Copy Email
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => handleCopy(b.userId.mobile, "Phone")}>
                          Copy Phone
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onSelect={() =>
                            openWhatsApp(
                              b.userId.mobile,
                              `Hello ${b.userId.firstName},\nYour booking (${shortId(
                                b._id
                              )}) at ${b.propertyId.propertyName}.`
                            )
                          }
                        >
                          WhatsApp Chat
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => openConfirm("resend", b)}>
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
            <div className="text-center py-10 text-gray-500">No bookings found.</div>
          )}
        </div>
      </div>

      <AlertDialog open={confirm.open} onOpenChange={(o) => !o && closeConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm.type === "invoice" ? "Download Invoice" : "Resend to Traveller"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.type === "invoice"
                ? "A PDF invoice will be generated."
                : "Send booking confirmation to the traveller."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              {confirm.type === "invoice" ? "Download" : "Send Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
