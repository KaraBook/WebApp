import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CalendarCheck, Clock, IndianRupee, MoreVertical, Users, XCircle } from "lucide-react";
import BookingDetailsDrawer from "@/components/BookingDetailsDrawer";
import { Link, useNavigate } from "react-router-dom";
import MobileBookingsList from "@/components/MobileBookingList";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import BookingDesktopCard from "@/components/BookingDesktopCard";
import PaymentChip from "@/components/PaymentChip";

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;

  const pages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    return [
      1,
      ...(currentPage > 3 ? ["..."] : []),
      ...[currentPage - 1, currentPage, currentPage + 1].filter(
        (p) => p > 1 && p < totalPages
      ),
      ...(currentPage < totalPages - 2 ? ["..."] : []),
      totalPages,
    ];
  };

  return (
    <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 px-4 sm:px-6 py-4 border-t bg-white rounded-b-xl">
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
        className="px-4 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-400 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Pages */}
      {pages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={
              p === currentPage
                ? "px-3 py-1.5 text-sm rounded-lg bg-[#028ea1] text-white"
                : "px-2 text-sm text-gray-700 hover:text-black"
            }
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => p + 1)}
        className="px-4 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  variant = "default",
  onClick,
  fullWidthMobile = false,
}) {
  const styles = {
    primary: {
      card: "bg-primary text-white",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      label: "text-white/80",
      caption: "text-white/80",
    },
    success: {
      card: "bg-white",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      label: "text-green-500",
      caption: "text-gray-500",
    },
    warning: {
      card: "bg-white",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      label: "text-orange-500",
      caption: "text-gray-500",
    },
    danger: {
      card: "bg-white",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      label: "text-red-500",
      caption: "text-gray-500",
    },
    default: {
      card: "bg-white",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      label: "text-blue-500",
      caption: "text-gray-500",
    },
  };

  const s = styles[variant];

  return (
    <div
      onClick={onClick}
      className={`
        ${s.card}
        ${fullWidthMobile ? "col-span-2 sm:col-span-1" : ""}
        rounded-xl
        px-5 py-5
        cursor-pointer
        transition
        hover:scale-[1.01]
        shadow-[0_10px_25px_rgba(0,0,0,0.08)]
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-semibold tracking-wider uppercase ${s.label}`}>
            {label}
          </p>

          <p className="text-[32px] font-bold mt-2 leading-none">
            {value ?? 0}
          </p>

          <p className={`text-sm mt-2 ${s.caption}`}>
            {caption}
          </p>
        </div>

        <div className={`h-10 w-10 rounded-full ${s.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${s.iconColor}`} />
        </div>
      </div>
    </div>
  );
}


const normalizePaymentStatus = (status) => {
  if (["paid", "confirmed"].includes(status)) return "confirmed";
  if (["pending", "initiated", "failed"].includes(status)) return "pending";
  if (status === "cancelled") return "cancelled";
  return "pending";
};


function Dot({ color }) {
  const map = {
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    gray: "bg-gray-400",
    blue: "bg-blue-500",
  };

  return (
    <span className={`w-1.5 h-1.5 rounded-full ${map[color]}`} />
  );
}


function CalendarLegend() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
      <LegendItem color="green" label="Confirmed Booking" />
      <LegendItem color="yellow" label="Pending Payment" />
      <LegendItem color="gray" label="Cancelled" />
      <LegendItem color="blue" label="Owner Blocked" />
    </div>
  );
}

function LegendItem({ color, label }) {
  const map = {
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    gray: "bg-gray-400",
    blue: "bg-blue-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${map[color]}`} />
      <span className="text-gray-700">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);

  const [data, setData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [propertyName, setPropertyName] = useState("");
  const [propertyId, setPropertyId] = useState(null);

  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [openGuestRow, setOpenGuestRow] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerDashboard.url);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const all = res.data?.data?.bookings || [];

        const upcoming = all.filter(b => {
          const checkOut = new Date(b.checkOut);
          checkOut.setHours(0, 0, 0, 0);
          return checkOut >= today;
        });

        const past = all.filter(b => {
          const checkOut = new Date(b.checkOut);
          checkOut.setHours(0, 0, 0, 0);
          return checkOut < today;
        });

        const stats = {
          totalBookings: all.length,

          confirmed: upcoming.filter(
            b => b.paymentStatus === "paid" && !b.cancelled
          ).length,

          pending: upcoming.filter(
            b => ["pending", "initiated", "failed"].includes(b.paymentStatus)
          ).length,

          cancelled: all.filter(
            b => b.cancelled || b.paymentStatus === "cancelled"
          ).length,

          totalRevenue: all
            .filter(b => b.paymentStatus === "paid" && !b.cancelled)
            .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0),

          totalUsers: new Set(
            all.map(b => b.userId?._id)
          ).size
        };

        setData({
          stats,
          bookings: upcoming.sort(
            (a, b) => new Date(a.checkIn) - new Date(b.checkIn)
          )
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDashboard(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        if (res.data?.data?.length) {
          const firstProperty = res.data.data[0];
          setPropertyId(firstProperty._id);
          setPropertyName(firstProperty.propertyName);
        }
      } catch {

      }
    })();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".guest-dropdown-btn") && !e.target.closest(".guest-popover")) {
        setOpenGuestRow(null);
      }
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!propertyId) return;

    (async () => {
      try {
        const res = await api.get(SummaryApi.getPropertyBlockedDates.url(propertyId));
        const booked = await api.get(SummaryApi.getBookedDates.url(propertyId));

        setBookedDates(booked.data?.dates || []);
        setBlockedDates(res.data?.dates || []);
      } catch {
        // optionally toast error
      }
    })();
  }, [propertyId]);

  const isDateBlocked = (date) =>
    blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });

  const isDateBooked = (date) => {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    return bookedDates.some((range) => {
      if (!range.start || !range.end) return false;

      const startLocal = new Date(range.start);
      const endLocal = new Date(range.end);

      const start = new Date(startLocal.getFullYear(), startLocal.getMonth(), startLocal.getDate());
      const end = new Date(endLocal.getFullYear(), endLocal.getMonth(), endLocal.getDate());

      let current = new Date(start);

      while (current.getTime() <= end.getTime()) {
        if (current.getTime() === target) return true;
        current.setDate(current.getDate() + 1);
      }

      return false;
    });
  };


  const isDatePending = (date) =>
    bookings?.some(b =>
      b.paymentStatus !== "paid" &&
      !b.cancelled &&
      date >= new Date(b.checkIn) &&
      date <= new Date(b.checkOut)
    );

  const isDateCancelled = (date) =>
    bookings?.some(b =>
      b.cancelled &&
      date >= new Date(b.checkIn) &&
      date <= new Date(b.checkOut)
    );


  const { stats, bookings } = data || {};
  const totalPages = Math.ceil((bookings?.length || 0) / rowsPerPage);

  const paginatedRows = useMemo(() => {
    const list = bookings || [];
    return list.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [bookings, currentPage]);

  /* -------------------- Calendar -------------------- */
  const today = new Date();
  const monthLabel = today.toLocaleString("en-US", { month: "long", year: "numeric" });

  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const arr = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(year, month, d));
    return arr;
  }, [today]);


  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }


  return (
    <div className="bg-[#f5f5f7] min-h-[calc(100vh-56px)] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-[26px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-[16px] text-gray-500">
            Welcome {user?.firstName ? `, ${user.firstName}` : ""} at {propertyName}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">

          <StatCard
            icon={CheckCircle2}
            label="Total Bookings"
            value={stats?.totalBookings}
            caption="All bookings so far"
            variant="primary"
            onClick={() => navigate("/bookings?time=all&status=all")}
          />

          <StatCard
            icon={Users}
            label="Users"
            value={stats?.totalUsers}
            caption="Total travellers"
            onClick={() => navigate("/users")}
          />

          <StatCard
            icon={CalendarCheck}
            label="Confirmed"
            value={stats?.confirmed}
            caption="Ready to check-in"
            variant="success"
            onClick={() => navigate("/bookings?status=confirmed")}
          />

          <StatCard
            icon={Clock}
            label="Pending"
            value={stats?.pending}
            caption="Awaiting confirmation"
            variant="warning"
            onClick={() => navigate("/bookings?status=pending")}
          />

          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={stats?.cancelled}
            caption="Cancelled bookings"
            variant="danger"
            onClick={() => navigate("/bookings?status=cancelled")}
          />

          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`}
            caption="From all bookings"
            variant="primary"
            onClick={() => navigate("/bookings?time=all&status=confirmed")}
          />

        </div>

        {/* GRID — BOOKINGS + CALENDAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* MOBILE – RECENT BOOKINGS */}
          <MobileBookingsList
            bookings={bookings || []}
            onOpenBooking={(b) => {
              setSelectedBooking(b);
              setOpenBookingDialog(true);
            }}
          />

          {/* BOOKINGS TABLE */}
          <div className="hidden md:block lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent bookings</h2>
            </div>

            <div className="hidden md:block space-y-3">
              {paginatedRows.map((b) => (
                <BookingDesktopCard
                  booking={b}
                  onOpen={(b) => {
                    setSelectedBooking(b);
                    setOpenBookingDialog(true);
                  }}
                  onViewInvoice={(b) => navigate(`/invoice/${b._id}`)}
                  onCopyEmail={(b) => navigator.clipboard.writeText(b?.userId?.email || "")}
                  onCopyPhone={(b) => navigator.clipboard.writeText(b?.userId?.mobile || "")}
                  onWhatsapp={(b) =>
                    window.open(
                      `https://wa.me/${b?.userId?.mobile}?text=${encodeURIComponent(
                        `Hello ${b?.userId?.firstName},\nYour booking ${b._id}...`
                      )}`,
                      "_blank"
                    )
                  }
                  onResend={() => toast.success("Resend to traveller triggered")}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* CALENDAR */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Availability Calendar
            </h3>
            <p className="text-xs text-gray-500">
              Upcoming 3 months overview
            </p>

            <div className="mt-4">
              <Calendar
                mode="single"
                numberOfMonths={1}
                fromDate={new Date()}
                className="rounded-xl border"
                modifiers={{
                  booked: isDateBooked,
                  blocked: isDateBlocked,
                  pending: isDatePending,
                  cancelled: isDateCancelled,
                }}
                modifiersClassNames={{
                  booked: "bg-green-100 rounded-md text-green-800",
                  blocked: "bg-blue-100 rounded-md text-blue-800",
                  pending: "bg-yellow-100 rounded-md text-yellow-800",
                  cancelled: "bg-red-200 rounded-md text-gray-600",
                }}
                components={{
                  DayContent: ({ date }) => (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {date.getDate()}

                      {/* status dot */}
                      <div className="absolute bottom-1 flex gap-[2px]">
                        {isDateBooked(date) && <Dot color="green" />}
                        {isDatePending(date) && <Dot color="yellow" />}
                        {isDateCancelled(date) && <Dot color="red" />}
                        {isDateBlocked(date) && <Dot color="blue" />}
                      </div>
                    </div>
                  )
                }}
              />
            </div>

            <CalendarLegend />
          </div>
        </div>

        {/* Guests Popover */}
        {openGuestRow && (
          <div
            className="guest-popover fixed bg-white border shadow-lg rounded-md p-3 w-40 z-[9999]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            {(() => {
              const booking = paginatedRows.find((b) => b._id === openGuestRow);
              if (!booking || typeof booking.guests !== "object") return null;

              const g = booking.guests;
              return (
                <>
                  <div className="flex justify-between py-1 text-sm">
                    <span>Adults</span>
                    <span className="font-semibold">{g.adults}</span>
                  </div>

                  <div className="flex justify-between py-1 text-sm">
                    <span>Children</span>
                    <span className="font-semibold">{g.children}</span>
                  </div>

                  <div className="flex justify-between py-1 text-sm">
                    <span>Infants</span>
                    <span className="font-semibold">{g.infants}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <BookingDetailsDrawer
        open={openBookingDialog}
        booking={selectedBooking}
        onClose={() => setOpenBookingDialog(false)}
      />

    </div>

  );
}
