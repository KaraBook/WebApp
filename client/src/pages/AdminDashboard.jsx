import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CalendarCheck, Clock, Wallet, Home } from "lucide-react";
import { Link } from "react-router-dom";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import MobileBookingCard from "@/components/MobileBookingCard.jsx";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const PER_PAGE = 4;
  const [page, setPage] = useState(1);

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

      setStats({
        totalBookings: bookings.length,
        confirmed: confirmed.length,
        pending: pending.length,
        failed: failed.length,
        totalUsers: users.length,
        totalProperties: properties.length,
        totalRevenue,
        recentBookings: bookings.slice(0, 5),
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
    const options = { day: "numeric", month: "short", year: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  const totalPages = Math.ceil(
    stats.recentBookings.length / PER_PAGE
  );

  const paginatedBookings = stats.recentBookings.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  return (
    <div className="space-y-5 sm:space-y-8 overflow-x-hidden">
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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            dotColor="none"
          />
        </div>
      </div>

      <h2 className="font-bold text-lg sm:text-xl">
        Recent Bookings
      </h2>

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
        <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg px-4 py-2 text-sm text-neutral-600 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={page === totalPages}
            className="rounded-lg px-4 py-2 text-sm text-neutral-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}


      <BookingDetailsDialog
        open={openModal}
        booking={selectedBooking}
        onClose={(open) => {
          if (!open) {
            setOpenModal(false);
            setSelectedBooking(null);
          }
        }}
      />
    </div>

  );
};


function StatCard({ title, value, icon: Icon, color = "text-neutral-900", dotColor = "bg-green-500" }) {
  return (
    <div className="relative rounded-xl border border-neutral-200 bg-white p-4">

      {/* Top-right dot */}
      <span
        className={`absolute top-3 right-3 h-2 w-2 rounded-full ${dotColor}`}
      />

      {/* Icon */}
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300">
        <Icon className="h-4 w-4 text-neutral-600" />
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold leading-none ${color}`}>
        {value}
      </div>

      {/* Label */}
      <div className="mt-1 text-sm text-neutral-500">
        {title}
      </div>
    </div>
  );
}


export default DashboardPage;
