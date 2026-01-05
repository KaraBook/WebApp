import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CalendarCheck, Clock, Wallet, Home } from "lucide-react";
import { Link } from "react-router-dom";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import MobileBookingCard from "@/components/MobileBookingCard.jsx";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const PER_PAGE = 4;
  const [page, setPage] = useState(1);


  const getMonthRevenue = (bookings, year, month) => {
    return bookings
      .filter((b) => {
        if (b.paymentStatus !== "paid") return false;
        const d = new Date(b.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes, propertiesRes] = await Promise.all([
        Axios.get(SummaryApi.getAllBookings.url),
        Axios.get("/api/admin/users"),
        Axios.get(SummaryApi.getProperties.url),
      ]);

      const bookings = bookingsRes?.data?.data || [];
      const users = usersRes?.data?.data || [];
      const properties = propertiesRes?.data?.data || [];

      const confirmed = bookings.filter((b) => b.paymentStatus === "paid");
      const pending = bookings.filter((b) => b.paymentStatus === "pending");
      const failed = bookings.filter((b) => b.paymentStatus === "failed");

      const totalRevenue = confirmed.reduce(
        (acc, b) => acc + (b.totalAmount || 0),
        0
      );

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthRevenue = getMonthRevenue(
        bookings,
        currentYear,
        currentMonth
      );

      const prevMonthRevenue = getMonthRevenue(
        bookings,
        prevMonthYear,
        prevMonth
      );

      let growthPercent = null;
      let growthPositive = true;
      let growthText = "";

      if (prevMonthRevenue > 0 && currentMonthRevenue > 0) {
        growthPercent =
          ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

        growthPositive = growthPercent >= 0;
        growthText = `${growthPositive ? "+" : ""}${growthPercent.toFixed(1)}% from last month`;

      } else if (prevMonthRevenue > 0 && currentMonthRevenue === 0) {
        growthPositive = false;
        growthText = "-100% from last month";

      } else if (prevMonthRevenue === 0 && currentMonthRevenue > 0) {
        growthPositive = true;
        growthText = "New revenue this month";

      } else {
        growthPositive = true;
        growthText = "No revenue data yet";
      }

      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const upcomingAndCurrentBookings = bookings.filter((b) => {
        if (!b?.checkIn) return false;
        return new Date(b.checkIn) >= startOfCurrentMonth;
      });

      const sortedBookings = upcomingAndCurrentBookings.sort((a, b) => {
        return new Date(b.checkIn) - new Date(a.checkIn);
      });


      setStats({
        totalBookings: bookings.length,
        confirmed: confirmed.length,
        pending: pending.length,
        failed: failed.length,
        totalUsers: users.length,
        totalProperties: properties.length,

        totalRevenue,
        currentMonthRevenue,
        prevMonthRevenue,

        growthPercent,
        growthPositive,
        growthText,

        recentBookings: sortedBookings,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (n) =>
    typeof n === "number"
      ? `₹${n.toLocaleString("en-IN")}`
      : n
        ? `₹${Number(n).toLocaleString("en-IN")}`
        : "₹0";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  const filteredBookings = stats.recentBookings.filter((b) => {
    if (bookingFilter === "all") return true;
    if (bookingFilter === "confirmed") return b.paymentStatus === "paid";
    if (bookingFilter === "initiated") return b.paymentStatus === "initiated";
    if (bookingFilter === "cancelled") return b.paymentStatus === "failed";
    return true;
  });

  const totalPages = Math.ceil(filteredBookings.length / PER_PAGE);

  const paginatedBookings = filteredBookings.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const getPageItems = (current, total) => {
  // Matches: Previous | 1 | 2 | ... | 8 | Next (example)
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [];
  const first = 1;
  const last = total;

  const left = Math.max(current - 1, 2);
  const right = Math.min(current + 1, total - 1);

  items.push(first);

  if (left > 2) items.push("...");

  for (let p = left; p <= right; p++) items.push(p);

  if (right < total - 1) items.push("...");

  items.push(last);

  return items;
};


  return (
    <div className="space-y-5 sm:space-y-5 overflow-x-hidden">
      <div className="flex justify-between sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Dashboard Overview
        </h1>

        <Button
          className="w-auto sm:w-auto bg-transparent text-black hover:bg-transparent"
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/bookings">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={CalendarCheck}
            dotColor="none"
            variant="dark"
          />
        </Link>
        <Link to="/bookings?status=paid">
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CalendarCheck}
            color="text-neutral-900"
            dotColor="bg-green-500"
          />
        </Link>
        <Link to="/bookings?status=pending">
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            dotColor="bg-amber-400"
          />
        </Link>
        <Link to="/bookings?status=cancelled">
          <StatCard
            title="Cancelled"
            value={stats.failed}
            icon={Clock}
            dotColor="bg-red-500"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/users">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            dotColor="none"
          />
        </Link>

        <Link to="/properties">
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={Home}
            dotColor="none"
          />
        </Link>

        {/* FULL WIDTH ON MOBILE */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={Wallet}
            variant="dark"
            growthText={stats.growthText}
            growthPositive={stats.growthPositive}

          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg sm:text-xl">
          Recent Bookings
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex bg-gray-50 text-black mr-2 hover:bg-gray-100 w-[180px] items-center gap-2"
            >
              {bookingFilter === "all"
                ? "All Bookings"
                : bookingFilter.charAt(0).toUpperCase() + bookingFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 py-2">
            <DropdownMenuItem onClick={() => setBookingFilter("all")} className="mb-1">
              All Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBookingFilter("confirmed")} className="mb-1">
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBookingFilter("initiated")} className="mb-1">
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBookingFilter("cancelled")}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block rounded-xl border bg-white overflow-x-auto">
        <table className="min-w-[1100px] w-[100%] text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr className="text-left text-neutral-600">
              <th className="px-6 py-4 font-medium">Guest</th>
              <th className="px-4 py-4 font-medium">Property</th>
              <th className="px-4 py-4 font-medium">Check-in</th>
              <th className="px-4 py-4 font-medium">Check-out</th>
              <th className="px-4 py-4 font-medium">Nights</th>
              <th className="px-4 py-4 font-medium">Guests</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Created</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedBookings.map((b) => (
              <tr key={b._id} className="hover:bg-neutral-50">
                {/* Guest */}
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">
                    {b?.userId?.firstName} {b?.userId?.lastName}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {b?.userId?.email || "—"}
                  </div>
                </td>

                {/* Room */}
                <td className="px-4 py-4 text-neutral-900">
                  {b?.propertyId?.propertyName || "—"}
                </td>

                {/* Check-in */}
                <td className="px-4 py-4">
                  {formatDate(b.checkIn)}
                </td>

                {/* Check-out */}
                <td className="px-4 py-4">
                  {formatDate(b.checkOut)}
                </td>

                {/* Nights */}
                <td className="px-4 text-center py-4">
                  {b.totalNights}
                </td>

                {/* Guests */}
                <td className="px-4 text-center py-4">
                  {(b.guests?.adults || 0) + (b.guests?.children || 0)}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusPill status={b.paymentStatus} />
                </td>

                {/* Created */}
                <td className="px-4 py-4 text-neutral-500">
                  {formatDate(b.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button className="text-neutral-400 hover:text-neutral-600 px-2">
                        •••
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBooking(b);
                          setOpenModal(true);
                        }}
                      >
                        View Booking
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate(`/invoice/${b._id}`)}
                      >
                        View Invoice
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(b?.userId?.email || "")
                        }
                      >
                        Copy Email
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(b?.userId?.mobile || "")
                        }
                      >
                        Copy Mobile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* MOBILE VIEW */}
      <div className="space-y-4">
        {paginatedBookings.length === 0 && (
          <p className="text-center text-sm text-neutral-500">
            No bookings found
          </p>
        )}

        {paginatedBookings.map((b) => (
          <MobileBookingCard
            key={b._id}
            booking={b}
            onView={(booking) => {
              setSelectedBooking(booking);
              setOpenModal(true);
            }}
            onInvoice={() => {
              window.open(
                SummaryApi.getBookingInvoice(b._id).url,
                "_blank"
              );
            }}
          />
        ))}
      </div>


      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          {/* Previous */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700
      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Numbers + Dots */}
          {getPageItems(page, totalPages).map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-2 text-neutral-500 select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = page === item;

            return (
              <button
                key={item}
                onClick={() => setPage(item)}
                className={
                  isActive
                    ? "h-10 w-10 rounded-lg bg-black text-white text-sm font-medium"
                    : "h-10 w-10 rounded-lg border bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50"
                }
              >
                {item}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-700
      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <BookingDetailsDialog
        open={openModal}
        booking={selectedBooking}
        onClose={() => {
          setOpenModal(false);
          setSelectedBooking(null);
        }}
      />

    </div>

  );
};


function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-neutral-900",
  dotColor = "bg-green-500",
  variant = "default",
  growthText,
  growthPositive = true,
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={`
        relative rounded-xl border p-4
        ${isDark ? "bg-black border-black" : "bg-white border-neutral-200"}
      `}
    >
      {/* TOP ROW */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div
            className={`text-sm font-medium ${isDark ? "text-neutral-300" : "text-neutral-500"
              }`}
          >
            {title}
          </div>

          {/* Growth text inline (no height increase) */}
          {growthText && (
            <div
              className={`flex items-center gap-1 text-xs font-medium
      ${growthText === "No revenue data yet"
                  ? "text-neutral-400"
                  : growthPositive
                    ? "text-emerald-400"
                    : "text-red-400"
                }
    `}
            >
              {growthText !== "No revenue data yet" && (
                <span>{growthPositive ? "↗" : "↘"}</span>
              )}
              <span>{growthText}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`
            inline-flex h-9 w-9 items-center justify-center rounded-full
            ${isDark ? "bg-neutral-800" : "bg-gray-100"}
          `}
        >
          <Icon
            className={`h-4 w-4 ${isDark ? "text-white" : "text-neutral-600"
              }`}
          />
        </div>
      </div>

      {/* VALUE */}
      <div
        className={`mt-4 text-3xl font-bold leading-none ${isDark ? "text-white" : color
          }`}
      >
        {value}
      </div>
    </div>
  );
}



function StatusPill({ status }) {
  // normalize once
  const key = String(status || "").toLowerCase();

  const map = {
    paid: {
      label: "Confirmed",
      className:
        "bg-green-50 text-green-700 border border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-red-50 text-red-600 border border-red-200",
    },
    initiated: {
      label: "Pending",
      className:
        "bg-[rgba(245,159,10,0.12)] text-[#f59f0a] border border-[#f59f0a]",
    },
  };

  const config = map[key];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
}




export default DashboardPage;
