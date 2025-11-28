import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Loader2, CheckCircle2, CalendarCheck, Clock, IndianRupee } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  // ───────────────────── Fetch dashboard stats + bookings ─────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerDashboard.url);

        const sorted = [...res.data.data.bookings].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setData({ ...res.data.data, bookings: sorted });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDashboard(false);
      }
    })();
  }, []);

  // ───────────────────── Fetch owner property id ─────────────────────
  useEffect(() => {
    const fetchOwnerProperty = async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data?.data || [];
        if (list.length > 0) {
          setPropertyId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      }
    };
    fetchOwnerProperty();
  }, []);

  // ───────────────────── Fetch blocked dates for that property ─────────────────────
  useEffect(() => {
    if (!propertyId) return;
    const fetchBlockedDates = async () => {
      try {
        const res = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        setBlockedDates(res.data.dates || []);
      } catch (err) {
        console.error("Failed to load blocked dates:", err);
      }
    };
    fetchBlockedDates();
  }, [propertyId]);

  // same logic as OwnerCalendar
  const isDateBlocked = (date) => {
    return blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };

  const { stats, bookings } = data || {};

  // generate this month's calendar grid
  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0 = Sun

    const cells = [];

    // leading blanks
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [blockedDates]);

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-[#f5f5f7]">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  const today = new Date();
  const monthLabel = today.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-[#f5f5f7] min-h-[calc(100vh-56px)] px-8 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TITLE */}
        <div>
          <h1 className="text-[26px] font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
          </p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CheckCircle2}
            label="Total Bookings"
            value={stats?.totalBookings}
            caption="All bookings so far"
          />
          <StatCard
            icon={CalendarCheck}
            label="Confirmed"
            value={stats?.confirmed}
            caption="Ready to check-in"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats?.pending}
            caption="Awaiting confirmation"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString("en-IN") || 0}`}
            caption="From all bookings"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>

        {/* MAIN GRID — LEFT: BOOKINGS, RIGHT: CALENDAR */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)] gap-6 items-start">
          {/* LAST BOOKINGS TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Last bookings
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-6 text-left font-medium">Traveller</th>
                    <th className="py-3 px-6 text-left font-medium">Property</th>
                    <th className="py-3 px-6 text-left font-medium">Check-in</th>
                    <th className="py-3 px-6 text-left font-medium">Check-out</th>
                    <th className="py-3 px-4 text-left font-medium">Nights</th>
                    <th className="py-3 px-4 text-left font-medium">Guests</th>
                    <th className="py-3 px-4 text-left font-medium">Amount</th>
                    <th className="py-3 px-4 text-left font-medium">Payment</th>
                    <th className="py-3 px-4 text-left font-medium">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings?.length ? (
                    bookings.map((b) => (
                      <tr
                        key={b._id}
                        className="border-b border-gray-100 hover:bg-gray-50/60"
                      >
                        <td className="py-3 px-6 align-top">
                          <div className="font-medium text-gray-900">
                            {b.userId?.firstName} {b.userId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {b.userId?.mobile}
                          </div>
                        </td>

                        <td className="py-3 px-6 align-top text-gray-800">
                          {b.propertyId?.propertyName}
                        </td>

                        <td className="py-3 px-6 align-top text-gray-700">
                          {new Date(b.checkIn).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>

                        <td className="py-3 px-6 align-top text-gray-700">
                          {new Date(b.checkOut).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>

                        <td className="py-3 px-4 align-top text-gray-700">
                          {b.totalNights}
                        </td>

                        <td className="py-3 px-4 align-top text-gray-700">
                          {b.guests}
                        </td>

                        <td className="py-3 px-4 align-top font-semibold text-gray-900">
                          ₹{b.totalAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <PaymentChip status={b.paymentStatus} />
                        </td>

                        <td className="py-3 px-4 align-top text-gray-600">
                          {new Date(b.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-8 text-center text-gray-500 text-sm"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN — MONTH CALENDAR CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  This month calendar
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Blocked dates are greyed out
                </p>
              </div>
            </div>

            {/* Calendar header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-800">
                {monthLabel}
              </span>
            </div>

            {/* Weekday row */}
            <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={idx} className="h-8" />;
                }

                const isToday =
                  day.toDateString() === today.toDateString();
                const blocked = isDateBlocked(day);

                let classes =
                  "h-8 flex items-center justify-center rounded-full text-xs";

                if (blocked) {
                  classes +=
                    " bg-gray-200 text-gray-500 line-through";
                } else if (isToday) {
                  classes +=
                    " border border-indigo-500 text-indigo-600 font-semibold bg-white";
                } else {
                  classes +=
                    " text-gray-700 hover:bg-gray-100 cursor-default";
                }

                return (
                  <div key={idx} className="flex items-center justify-center">
                    <div className={classes}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* View full calendar button */}
            <button
              onClick={() => navigate("/calendar")}
              className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-gray-900 text-white text-xs font-medium py-2.5 hover:bg-gray-800 transition"
            >
              View full calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── smaller sub-components ───────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-700",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-[24px] leading-tight font-semibold text-gray-900 mt-1">
          {value ?? 0}
        </p>
        {caption && (
          <p className="text-[11px] text-gray-400 mt-1">{caption}</p>
        )}
      </div>
    </div>
  );
}

function PaymentChip({ status }) {
  if (!status) return null;

  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium capitalize";

  const map = {
    paid: `${base} bg-emerald-50 text-emerald-700`,
    pending: `${base} bg-amber-50 text-amber-700`,
    initiated: `${base} bg-gray-100 text-gray-600`,
    failed: `${base} bg-red-50 text-red-600`,
  };

  return <span className={map[status] || base}>{status}</span>;
}
