import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  CalendarCheck,
  Clock,
  IndianRupee,
  MoreVertical,
  Users
} from "lucide-react";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import { Link, useNavigate } from "react-router-dom";
import MobileBookingsList from "@/components/MobileBookingList";

/* -------------------- Pagination (matches your screenshot) -------------------- */
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

/* -------------------- Stat Card -------------------- */
function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-700",
  cardBg = "bg-white",
  textColor = "text-gray-900",
  subTextColor = "text-gray-400",
  onClick,
  fullWidthMobile = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        ${cardBg}
        ${fullWidthMobile ? "col-span-2 sm:col-span-1" : ""}
        rounded-2xl border border-gray-100 shadow-sm
        px-5 sm:px-6 py-5
        flex flex-col gap-3 cursor-pointer
        hover:shadow-md transition
      `}
    >
      <div
        className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>

      <p className={`text-xs ${subTextColor}`}>{label}</p>

      <p className={`text-2xl sm:text-[28px] font-[700] leading-tight ${textColor}`}>
        {value ?? 0}
      </p>

      {caption && (
        <p className={`text-[11px] ${subTextColor}`}>
          {caption}
        </p>
      )}
    </div>
  );
}


/* -------------------- Payment Chip -------------------- */
function PaymentChip({ status }) {
  const base = "px-3 py-1 rounded-full text-[11px] font-medium capitalize";
  const map = {
    paid: `${base} bg-emerald-50 text-emerald-700`,
    pending: `${base} bg-amber-50 text-amber-700`,
    initiated: `${base} bg-gray-100 text-gray-600`,
    failed: `${base} bg-red-50 text-red-600`,
  };
  return <span className={map[status] || base}>{status}</span>;
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

  /* -------------------- Fetch dashboard -------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerDashboard.url);

        const sorted = [...(res.data?.data?.bookings || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setData({ ...res.data.data, bookings: sorted });
      } catch {
        // optionally toast error
      } finally {
        setLoadingDashboard(false);
      }
    })();
  }, []);

  /* -------------------- Fetch properties (ONLY ONCE) -------------------- */
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
        // optionally toast error
      }
    })();
  }, []);

  /* -------------------- Close guest popup on outside click -------------------- */
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".guest-dropdown-btn") && !e.target.closest(".guest-popover")) {
        setOpenGuestRow(null);
      }
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  /* -------------------- Fetch blocked/booked dates -------------------- */
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

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* TOTAL BOOKINGS (PRIMARY BG) */}
          <StatCard
            icon={CheckCircle2}
            label="Total Bookings"
            value={stats?.totalBookings}
            caption="All bookings so far"
            cardBg="bg-primary"
            textColor="text-white"
            subTextColor="text-white/70"
            iconBg="bg-white/20"
            iconColor="text-white"
            onClick={() => navigate("/bookings?status=all")}
          />

          {/* USERS */}
          <StatCard
            icon={Users}
            label="Users"
            value={stats?.totalUsers}
            caption="Total travellers"
            onClick={() => navigate("/users")}
          />

          {/* CONFIRMED */}
          <StatCard
            icon={CalendarCheck}
            label="Confirmed"
            value={stats?.confirmed}
            caption="Ready to check-in"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            onClick={() => navigate("/bookings?status=paid")}
          />

          {/* PENDING */}
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats?.pending}
            caption="Awaiting confirmation"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            onClick={() => navigate("/bookings?status=pending")}
          />

          {/* TOTAL REVENUE (PRIMARY + FULL WIDTH ON MOBILE) */}
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`}
            caption="From all bookings"
            cardBg="bg-primary"
            textColor="text-white"
            subTextColor="text-white/70"
            iconBg="bg-white/20"
            iconColor="text-white"
            fullWidthMobile
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
              <h2 className="text-sm font-semibold text-gray-900">Last bookings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full md:min-w-[1200px] min-w-[1000px] text-sm">
                <thead className="bg-gray-50 text-gray-500 border-y border-gray-100">
                  <tr className="text-left">
                    <th className="py-3 px-4 sm:px-6 text-left">Traveller</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Property</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Check-in</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Check-out</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Nights</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Guests</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Amount</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Payment</th>
                    <th className="py-3 px-4 sm:px-6 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows?.length ? (
                    paginatedRows.map((b) => (
                      <tr key={b._id} className="border-b hover:bg-gray-50/60 transition">
                        <td className="py-3 px-4 sm:px-6">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setOpenBookingDialog(true);
                            }}
                            className="text-left"
                          >
                            <div className="font-medium text-gray-900 hover:underline">
                              {b.userId?.firstName} {b.userId?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{b.userId?.mobile}</div>
                          </button>
                        </td>

                        <td className="py-3 px-4 sm:px-6">{b.propertyId?.propertyName}</td>

                        <td className="py-3 px-4 sm:px-6">
                          {new Date(b.checkIn).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 sm:px-6">
                          {new Date(b.checkOut).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 sm:px-6">{b.totalNights}</td>

                        <td className="py-3 px-4 sm:px-6 relative">
                          <button
                            className="guest-dropdown-btn text-gray-900 font-medium"
                            onClick={(e) => {
                              if (typeof b.guests === "object") {
                                const rect = e.currentTarget.getBoundingClientRect();

                                // initial desired position
                                let left = rect.left + rect.width / 2 - 80;
                                const top = rect.bottom + window.scrollY + 8;

                                // clamp inside viewport on mobile
                                const minLeft = 12;
                                const maxLeft = window.innerWidth - 12 - 160; // popover width=160
                                left = Math.max(minLeft, Math.min(left, maxLeft));

                                setDropdownPosition({ top, left });
                                setOpenGuestRow(openGuestRow === b._id ? null : b._id);
                              }
                            }}
                          >
                            {typeof b.guests === "number"
                              ? `${b.guests} Guests`
                              : `${b.guests.adults + b.guests.children} Guests${b.guests.infants ? ` + ${b.guests.infants} Infants` : ""
                              }`}
                          </button>
                        </td>

                        <td className="py-3 px-4 sm:px-6 font-semibold text-gray-900">
                          ₹{b.totalAmount?.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-4 sm:px-6">
                          <PaymentChip status={b.paymentStatus} />
                        </td>

                        <td className="py-3 px-4 sm:px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreVertical className="w-5 h-5 cursor-pointer text-gray-600" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-48">
                              <DropdownMenuItem
                                onSelect={() => {
                                  setSelectedBooking(b);
                                  setOpenBookingDialog(true);
                                }}
                              >
                                View Booking
                              </DropdownMenuItem>

                              <DropdownMenuItem onSelect={() => navigate(`/invoice/${b._id}`)}>
                                View Invoice
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={() =>
                                  navigator.clipboard.writeText(b?.userId?.email || "")
                                }
                              >
                                Copy Email
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={() =>
                                  navigator.clipboard.writeText(b?.userId?.mobile || "")
                                }
                              >
                                Copy Phone
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={() =>
                                  window.open(
                                    `https://wa.me/${b?.userId?.mobile}?text=${encodeURIComponent(
                                      `Hello ${b?.userId?.firstName},\nYour booking ${b._id}...`
                                    )}`,
                                    "_blank"
                                  )
                                }
                              >
                                WhatsApp Chat
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={() => toast.success("Resend to traveller triggered")}
                              >
                                Resend Links (WA + Email)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-gray-500">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* CALENDAR */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900">This month calendar</h3>
            <p className="text-xs text-gray-500">Blocked dates are greyed out</p>

            <div className="mt-4 text-sm font-medium text-gray-800">{monthLabel}</div>

            <div className="grid grid-cols-7 text-[11px] text-gray-400 mt-3 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-sm">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="h-9" />;

                const isToday = day.toDateString() === today.toDateString();
                const blocked = isDateBlocked(day);

                let cls = "h-9 w-9 flex items-center justify-center rounded-lg text-xs transition";

                if (isDateBooked(day)) {
                  cls += " bg-red-200 text-red-700";
                } else if (blocked) {
                  cls += " bg-gray-200 text-gray-500";
                } else if (isToday) {
                  cls += " border border-primary text-primary font-semibold";
                } else {
                  cls += " text-gray-700 hover:bg-gray-100";
                }

                return (
                  <div key={i} className="flex justify-center">
                    <div className={cls}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/calendar")}
              className="mt-5 w-full bg-primary hover:bg-primary-800 text-white rounded-[10px] py-2.5 text-[14px] font-medium"
            >
              View full calendar
            </button>
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

      <BookingDetailsDialog
        open={openBookingDialog}
        onOpenChange={setOpenBookingDialog}
        booking={selectedBooking}
      />

    </div>

  );
}
