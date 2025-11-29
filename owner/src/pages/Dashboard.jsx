import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import {
  Loader2,
  CheckCircle2,
  CalendarCheck,
  Clock,
  IndianRupee,
  MoreVertical,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  // Pagination states
  const rowsPerPage = 5; // OPTION A
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH DASHBOARD DATA
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

  // FETCH PROPERTY ID
  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data?.data || [];
        if (list.length > 0) setPropertyId(list[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    loadProperty();
  }, []);

  // FETCH BLOCKED DATES
  useEffect(() => {
    if (!propertyId) return;
    const loadBlocked = async () => {
      try {
        const res = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        setBlockedDates(res.data.dates || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadBlocked();
  }, [propertyId]);

  const isDateBlocked = (date) => {
    return blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-[#f5f5f7]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  const { stats, bookings } = data || {};

  // PAGINATION CALCULATION
  const totalPages = Math.ceil((bookings?.length || 0) / rowsPerPage);
  const paginatedRows = bookings?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // MONTH CALENDAR
  const today = new Date();
  const monthLabel = today.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);

    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [blockedDates]);

  return (
    <div className="bg-[#f5f5f7] min-h-[calc(100vh-56px)] px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        {/* MAIN GRID */}
        <div className="grid grid-cols-[2.7fr_1fr] gap-6 items-start">
          {/* LAST BOOKINGS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Last bookings
              </h2>
            </div>

            {/* TABLE WRAPPER */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead className="bg-gray-50 text-gray-500 border-y border-gray-100">
                  <tr>
                    <th className="py-3 px-6">Traveller</th>
                    <th className="py-3 px-6">Property</th>
                    <th className="py-3 px-6">Check-in</th>
                    <th className="py-3 px-6">Check-out</th>
                    <th className="py-3 px-6">Nights</th>
                    <th className="py-3 px-6">Guests</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Payment</th>
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows?.length ? (
                    paginatedRows.map((b) => (
                      <tr
                        key={b._id}
                        className="border-b hover:bg-gray-50/60 transition"
                      >
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">
                            {b.userId?.firstName} {b.userId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {b.userId?.mobile}
                          </div>
                        </td>

                        <td className="py-3 px-6">{b.propertyId?.propertyName}</td>

                        <td className="py-3 px-6">
                          {new Date(b.checkIn).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3 px-6">
                          {new Date(b.checkOut).toLocaleDateString("en-IN")}
                        </td>

                        <td className="py-3 px-6">{b.totalNights}</td>
                        <td className="py-3 px-6">{b.guests}</td>

                        <td className="py-3 px-6 font-semibold text-gray-900">
                          ₹{b.totalAmount?.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-6">
                          <PaymentChip status={b.paymentStatus} />
                        </td>

                        {/* ACTION MENU */}
                        <td className="py-3 px-6">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="py-10 text-center text-gray-500">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION — OUTSIDE SCROLL */}
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>

          {/* CALENDAR */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900">
              This month calendar
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Blocked dates are greyed out
            </p>

            <div className="mt-4 text-sm font-medium text-gray-800">
              {monthLabel}
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-[11px] text-gray-400 mt-2 mb-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="h-8" />;

                const isToday = day.toDateString() === today.toDateString();
                const blocked = isDateBlocked(day);

                let classes =
                  "h-8 flex items-center justify-center rounded-full text-xs";

                if (blocked) {
                  classes += " bg-gray-200 text-gray-500 line-through";
                } else if (isToday) {
                  classes +=
                    " border border-indigo-500 text-indigo-600 font-semibold";
                } else {
                  classes += " text-gray-700 hover:bg-gray-100";
                }

                return (
                  <div key={i} className="flex justify-center">
                    <div className={classes}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/calendar")}
              className="mt-5 w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-2.5 text-xs font-medium"
            >
              View full calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 px-6 py-4 border-t bg-white">
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        className={`px-4 py-1.5 rounded-lg border text-sm ${
          currentPage === 1
            ? "text-gray-300 border-gray-200"
            : "hover:bg-gray-100 border-gray-300 text-gray-700"
        }`}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            p === currentPage
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        className={`px-4 py-1.5 rounded-lg border text-sm ${
          currentPage === totalPages
            ? "text-gray-300 border-gray-200"
            : "hover:bg-gray-100 border-gray-300 text-gray-700"
        }`}
        onClick={() => setCurrentPage((p) => p + 1)}
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
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
