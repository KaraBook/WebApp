import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CalendarCheck, Clock, IndianRupee, MoreVertical } from "lucide-react";


function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex rounded-b-xl justify-end items-center gap-2 px-6 py-4 border-t bg-white">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
        className={`px-4 py-1.5 rounded-lg border text-sm ${currentPage === 1
          ? "text-gray-300 border-gray-200"
          : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${page === currentPage
            ? "bg-gray-900 text-white border-gray-900"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => p + 1)}
        className={`px-4 py-1.5 rounded-lg border text-sm ${currentPage === totalPages
          ? "text-gray-300 border-gray-200"
          : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
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
  iconBg = "bg-gray-100",
  iconColor = "text-gray-700",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-3">
      <div className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>

      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-[24px] font-semibold text-gray-900 leading-tight">
        {value ?? 0}
      </p>
      {caption && <p className="text-[11px] text-gray-400">{caption}</p>}
    </div>
  );
}


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


const normalizeDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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

        const sorted = [...res.data.data.bookings].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setData({ ...res.data.data, bookings: sorted });
      } catch { }
      finally {
        setLoadingDashboard(false);
      }
    })();
  }, []);


  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".guest-dropdown-btn")) {
        setOpenGuestRow(null);
      }
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);



  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        if (res.data?.data?.length) setPropertyId(res.data.data[0]._id);
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!propertyId) return;

    (async () => {
      try {
        const res = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const booked = await api.get(SummaryApi.getBookedDates.url(propertyId));
        setBookedDates(booked.data.dates || []);

        setBlockedDates(res.data.dates || []);
      } catch { }
    })();

  }, [propertyId]);

  const isDateBlocked = (date) =>
    blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });

  const isDateBooked = (date) =>
  bookedDates.some((range) => {
    const start = normalizeDay(range.start);
    const end = normalizeDay(range.end);
    end.setDate(end.getDate() - 1);
    const d = normalizeDay(date);
    return d >= start && d <= end;
  });


  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  const { stats, bookings } = data || {};


  const totalPages = Math.ceil((bookings?.length || 0) / rowsPerPage);
  const paginatedRows = bookings?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );


  const today = new Date();
  const monthLabel = today.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getCalendarDays = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const arr = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(year, month, d));
    return arr;
  };

  const calendarDays = getCalendarDays();


  return (
    <div className="bg-[#f5f5f7] min-h-[calc(100vh-56px)] px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle2} label="Total Bookings" value={stats?.totalBookings} caption="All bookings so far" />
          <StatCard icon={CalendarCheck} label="Confirmed" value={stats?.confirmed} caption="Ready to check-in" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard icon={Clock} label="Pending" value={stats?.pending} caption="Awaiting confirmation" iconBg="bg-amber-50" iconColor="text-amber-600" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`} caption="From all bookings" iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        </div>

        {/* GRID — BOOKINGS + CALENDAR */}
        <div className="flex w-full justify-between gap-6 items-start">

          {/* BOOKINGS TABLE */}
          <div className="w-[68%] bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-gray-900">Last bookings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-sm">
                <thead className="bg-gray-50 text-gray-500 border-y border-gray-100">
                  <tr className="text-left">
                    <th className="py-3 px-6 text-left">Traveller</th>
                    <th className="py-3 px-6 text-left">Property</th>
                    <th className="py-3 px-6 text-left">Check-in</th>
                    <th className="py-3 px-6 text-left">Check-out</th>
                    <th className="py-3 px-6 text-left">Nights</th>
                    <th className="py-3 px-6 text-left">Guests</th>
                    <th className="py-3 px-6 text-left">Amount</th>
                    <th className="py-3 px-6 text-left">Payment</th>
                    <th className="py-3 px-6 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows?.length ? (
                    paginatedRows.map((b) => (
                      <tr key={b._id} className="border-b hover:bg-gray-50/60 transition">
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">
                            {b.userId?.firstName} {b.userId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{b.userId?.mobile}</div>
                        </td>

                        <td className="py-3 px-6">{b.propertyId?.propertyName}</td>
                        <td className="py-3 px-6">
                          {new Date(b.checkIn).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-6">
                          {new Date(b.checkOut).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-6">{b.totalNights}</td>
                        <td className="py-3 px-6 relative">
                          <button
                            className="guest-dropdown-btn text-gray-900 font-medium"
                            onClick={(e) => {
                              if (typeof b.guests === "object") {
                                const rect = e.target.getBoundingClientRect();
                                setDropdownPosition({
                                  top: rect.bottom + window.scrollY + 6,
                                  left: rect.left + rect.width / 2 - 80,
                                });
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

                        <td className="py-3 px-6 font-semibold text-gray-900">
                          ₹{b.totalAmount?.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-6">
                          <PaymentChip status={b.paymentStatus} />
                        </td>

                        <td className="py-3 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreVertical className="w-5 h-5 cursor-pointer text-gray-600" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-48">

                              {/* View Invoice */}
                              <DropdownMenuItem
                                onSelect={() => navigate(`/invoice/${b._id}`)}
                              >
                                View Invoice
                              </DropdownMenuItem>

                              {/* Copy Email */}
                              <DropdownMenuItem
                                onSelect={() =>
                                  navigator.clipboard.writeText(b?.userId?.email || "")
                                }
                              >
                                Copy Email
                              </DropdownMenuItem>

                              {/* Copy Phone */}
                              <DropdownMenuItem
                                onSelect={() =>
                                  navigator.clipboard.writeText(b?.userId?.mobile || "")
                                }
                              >
                                Copy Phone
                              </DropdownMenuItem>

                              {/* WhatsApp Chat */}
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

                              {/* Resend Links */}
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

            {/* Pagination (Right Aligned) */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* CALENDAR */}
          <div className="w-[30%] bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900">This month calendar</h3>
            <p className="text-xs text-gray-500">Blocked dates are greyed out</p>

            <div className="mt-4 text-sm font-medium text-gray-800">{monthLabel}</div>

            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 text-[11px] text-gray-400 mt-3 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 gap-1.5 text-sm">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="h-9" />;

                const isToday = day.toDateString() === today.toDateString();
                const blocked = isDateBlocked(day);

                let cls =
                  "h-9 w-9 flex items-center justify-center rounded-full text-xs transition";

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

        {openGuestRow && (
          <div
            className="fixed bg-white border shadow-lg rounded-md p-3 w-40 z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
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
    </div>
  );
}
