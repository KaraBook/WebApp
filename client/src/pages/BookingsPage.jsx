import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import { IoIosArrowDropdown } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoicePreview from "@/components/InvoicePreview";
import { useRef } from "react";

const filterOptions = [
    { label: "All Bookings", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
];

const itemsPerPageDefault = 8;

const BookingsPage = () => {
    const navigate = useNavigate();

    const [selectedFilter, setSelectedFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, type: null, booking: null });
    const [viewBooking, setViewBooking] = useState({ open: false, data: null });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [invoiceData, setInvoiceData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const invoiceRef = useRef(null);

    const itemsPerPage = itemsPerPageDefault;

    const closeConfirm = () => setConfirm({ open: false, type: null, booking: null });
    const openConfirm = (type, booking) => {
        setOpenDropdownId(null);
        setConfirm({ open: true, type, booking });
    };

    const openView = (booking) => {
        setOpenDropdownId(null);
        setViewBooking({ open: true, data: booking });
    };
    const closeView = () => setViewBooking({ open: false, data: null });

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await Axios({
                method: SummaryApi.getAllBookings.method,
                url: SummaryApi.getAllBookings.url,
            });
            const sorted = [...(res?.data?.data || [])].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setBookings(sorted);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBookings();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const options = { day: "numeric", month: "short", year: "2-digit" };
        return new Date(dateString).toLocaleDateString("en-IN", options);
    };

    const formatDateLong = (dateString) => {
        if (!dateString) return "—";
        const options = { day: "numeric", month: "long", year: "numeric" };
        return new Date(dateString).toLocaleDateString("en-IN", options);
    };

    const formatCurrency = (n) =>
        typeof n === "number"
            ? `₹${n.toLocaleString("en-IN")}`
            : n
                ? `₹${Number(n).toLocaleString("en-IN")}`
                : "₹0";

    const shortId = (id = "") => `#${String(id).slice(-6).toUpperCase()}`;

    const statusBadge = (status) => {
        const common = "rounded-full px-3 py-0.5 text-xs font-medium";

        if (status === "paid")
            return <Badge className={`${common} !bg-green-100 !text-green-700`}>Paid</Badge>;
        if (status === "failed")
            return <Badge className={`${common} !bg-red-100 !text-red-700`}>Failed</Badge>;
        return <Badge className={`${common} !bg-yellow-100 !text-yellow-800`}>Pending</Badge>;
    };

    const statusDot = (status) => {
        let color = "bg-gray-400";
        if (status === "paid") color = "bg-green-300";
        if (status === "failed") color = "bg-red-300";
        if (status === "pending") color = "bg-yellow-300";
        return <span className={`inline-block w-3 h-3 rounded-full ${color}`} />;
    };

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isUpcoming = (b) => (b?.checkIn ? new Date(b.checkIn) >= startOfDay(new Date()) : false);
    const isPast = (b) => (b?.checkOut ? new Date(b.checkOut) < startOfDay(new Date()) : false);

    const filtered = useMemo(() => {
        const base = bookings
            .filter((b) => {
                if (selectedFilter === "paid") return b.paymentStatus === "paid";
                if (selectedFilter === "pending") return b.paymentStatus === "pending";
                if (selectedFilter === "failed") return b.paymentStatus === "failed";
                if (selectedFilter === "upcoming") return isUpcoming(b);
                if (selectedFilter === "past") return isPast(b);
                return true;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const q = search.trim().toLowerCase();
        if (!q) return base;

        return base.filter((b) => {
            const owner = `${b?.userId?.firstName || ""} ${b?.userId?.lastName || ""}`.toLowerCase();
            const property = `${b?.propertyId?.propertyName || ""}`.toLowerCase();
            const email = `${b?.userId?.email || ""}`.toLowerCase();
            const phone = `${b?.userId?.mobile || b?.contactNumber || ""}`.toLowerCase();
            const bid = String(b?._id || "").toLowerCase();
            const orderId = String(b?.orderId || "").toLowerCase();
            return (
                owner.includes(q) ||
                property.includes(q) ||
                email.includes(q) ||
                phone.includes(q) ||
                bid.includes(q) ||
                orderId.includes(q)
            );
        });
    }, [bookings, selectedFilter, search]);


    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilter, search]);

    const openWhatsApp = (phone, text) => {
        if (!phone) return;
        const url = `https://wa.me/${encodeURIComponent(String(phone))}?text=${encodeURIComponent(
            text || ""
        )}`;
        window.open(url, "_blank");
    };

    const mailTo = (email, subject, body) => {
        if (!email) return;
        const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
            subject || ""
        )}&body=${encodeURIComponent(body || "")}`;
        window.location.href = url;
    };

    const downloadInvoicePDF = async (bookingId) => {
        try {
            toast.info("Generating PDF… please wait");

            const res = await Axios.get(`/api/admin/invoice/${bookingId}`);

            console.log("Invoice API response:", res.data);

            if (!res.data?.success || !res.data.data) {
                toast.error("Invoice not found or invalid.");
                return;
            }

            setInvoiceData(res.data.data);

            await new Promise((resolve) => requestAnimationFrame(resolve));
            await new Promise((resolve) => requestAnimationFrame(resolve));

            const element = invoiceRef.current;
            if (!element) throw new Error("Invoice DOM element not found");

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

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
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `Invoice_${res.data.data.invoiceNumber || bookingId}.pdf`;
            pdf.save(fileName);

            toast.success("Invoice downloaded successfully!");
        } catch (err) {
            console.error("PDF generation error:", err);
            toast.error("Failed to generate or download invoice PDF");
        } finally {
            setTimeout(() => setInvoiceData(null), 500);
        }
    };


    const confirmTitle = useMemo(() => {
        if (!confirm.booking) return "";
        if (confirm.type === "invoice") return "Download Invoice";
        if (confirm.type === "resend") return "Resend Links";
        return "";
    }, [confirm]);

    const confirmDescription = useMemo(() => {
        if (!confirm.booking) return "";
        if (confirm.type === "invoice")
            return "This will download a JSON invoice for this booking.";
        if (confirm.type === "resend")
            return "Open WhatsApp and email with prefilled confirmation message.";
        return "";
    }, [confirm]);

    const handleCopy = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text || "");
            toast.success(`${label} copied successfully!`);
        } catch (err) {
            toast.error("Failed to copy.");
            console.error("Clipboard error:", err);
        }
    };

    const onConfirmAction = async () => {
        const b = confirm.booking;
        closeConfirm();
        if (!b) return;

        if (confirm.type === "invoice") {
            await downloadInvoicePDF(b._id);
        }

        if (confirm.type === "resend") {
            const traveller = `${b?.userId?.firstName || ""}`.trim() || "Guest";
            const prop = b?.propertyId?.propertyName || "Property";
            const lines = [
                `🎉 Booking Confirmed!`,
                ``,
                `Dear ${traveller}, your stay at *${prop}* is confirmed.`,
                `Check-in: ${formatDateLong(b.checkIn)}`,
                `Check-out: ${formatDateLong(b.checkOut)}`,
                `Guests: ${b.guests || 1}`,
                `Amount: ${formatCurrency(b.totalAmount)}`,
            ];
            const waText = lines.join("\n");
            openWhatsApp(b?.userId?.mobile || b?.contactNumber, waText);

            const mailSubject = `Booking Confirmation ${shortId(b._id)} — ${prop}`;
            const mailBody = lines.join("\n");
            mailTo(b?.userId?.email, mailSubject, mailBody);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-xl font-bold">Bookings</h1>
                <Button
                    className="bg-transparent text-black hover:bg-transparent"
                    onClick={fetchBookings}
                >
                    Refresh
                </Button>
            </div>

            {/* Filter + Search */}
            <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <h2 className="text-base font-medium">
                    {filterOptions.find((o) => o.value === selectedFilter)?.label || "All Bookings"}
                </h2>

                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search: booking id / traveller / property / email / phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between bg-white text-primary">
                                {filterOptions.find((o) => o.value === selectedFilter)?.label || "Select"}
                                <IoIosArrowDropdown className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {filterOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onSelect={() => setSelectedFilter(option.value)}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="mt-6 w-full">
                <div className="overflow-x-auto border rounded-lg">
                    <div className="min-w-[1200px]">
                        <Table className="whitespace-nowrap text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr. No</TableHead>
                                    <TableHead>Booking</TableHead>
                                    <TableHead>Traveller</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Nights</TableHead>
                                    <TableHead>Guests</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-8 text-center">
                                            Loading bookings…
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    paginated.map((b, index) => {
                                        const traveller = `${b?.userId?.firstName || ""} ${b?.userId?.lastName || ""
                                            }`.trim() || "N/A";
                                        const phone = b?.userId?.mobile || b?.contactNumber || "";
                                        const property = b?.propertyId?.propertyName || "—";
                                        return (
                                            <TableRow key={b._id}>
                                                <TableCell className="text-center">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {statusDot(b.paymentStatus)}
                                                        <span className="font-medium">{shortId(b._id)}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{traveller}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {phone || "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="max-w-[220px] truncate">{property}</TableCell>
                                                <TableCell>{formatDate(b.checkIn)}</TableCell>
                                                <TableCell>{formatDate(b.checkOut)}</TableCell>
                                                <TableCell>{b.totalNights || "—"}</TableCell>
                                                <TableCell>{b.guests || 1}</TableCell>
                                                <TableCell>{formatCurrency(b.totalAmount)}</TableCell>

                                                <TableCell>
                                                    {statusBadge(b.paymentStatus)}
                                                </TableCell>

                                                <TableCell>{formatDate(b.createdAt)}</TableCell>

                                                <TableCell>
                                                    <DropdownMenu
                                                        open={openDropdownId === b._id}
                                                        onOpenChange={(o) => setOpenDropdownId(o ? b._id : null)}
                                                    >
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <HiDotsVertical className="w-5 h-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent className="w-56">
                                                            <DropdownMenuItem onSelect={() => navigate(`/invoice/${b._id}`)}>
                                                                View Invoice
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() => handleCopy(b?.userId?.email, "Email")}
                                                            >
                                                                Copy Email
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    handleCopy(b?.userId?.mobile || b?.contactNumber, "Mobile")
                                                                }
                                                            >
                                                                Copy Phone
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    openWhatsApp(
                                                                        phone,
                                                                        `Hello ${traveller.split(" ")[0] || ""
                                                                        }, your booking ${shortId(b._id)} for ${property}.\nCheck-in: ${formatDateLong(
                                                                            b.checkIn
                                                                        )}`
                                                                    )
                                                                }
                                                            >
                                                                WhatsApp Chat
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() => openConfirm("invoice", b)}
                                                            >
                                                                Download Invoice
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={() => openConfirm("resend", b)}
                                                            >
                                                                Resend Links (WA + Email)
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                {!loading && paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-8 text-center">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-end items-center mt-6 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            className="border bg-transparent text-black"
                        >
                            Previous
                        </Button>

                        {[...Array(totalPages)].map((_, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant={currentPage === i + 1 ? "default bg-transparent" : "bg-transparent"}
                                className={`${currentPage === i + 1 ? "bg-transparent border text-black" : "border"
                                    }`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            className="border bg-transparent text-black"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Booking Details Dialog */}
            <BookingDetailsDialog open={viewBooking.open} onClose={closeView} booking={viewBooking.data} />

            {/* Confirm Dialog */}
            <AlertDialog
                open={confirm.open}
                onOpenChange={(open) => {
                    if (!open) closeConfirm();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent" onClick={closeConfirm}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmAction}>
                            {confirm.type === "invoice" && "Download"}
                            {confirm.type === "resend" && "Open WhatsApp & Email"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {invoiceData && (
                <div
                    ref={invoiceRef}
                    className="invisible absolute left-[-9999px] top-0 w-[794px] bg-white p-8">
                    <InvoicePreview invoice={invoiceData} />
                </div>
            )}
        </>
    );
};

export default BookingsPage;
