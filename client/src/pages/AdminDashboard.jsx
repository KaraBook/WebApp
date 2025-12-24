import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CalendarCheck, Clock, Wallet, Home } from "lucide-react";
import { Link } from "react-router-dom";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
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
          />
        </Link>
        <Link to="/bookings?status=paid">
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={Clock}
            color="text-green-700"
          />
        </Link>
        <Link to="/bookings?status=pending">
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-700"
        />
        </Link>
        <Link to="/bookings?status=cancelled">
        <StatCard
          title="Cancelled"
          value={stats.failed}
          icon={Clock}
          color="text-red-700"
        />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/users">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        </Link>
        <Link to="/properties">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Home}
        />
        </Link>
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Wallet}
        />
      </div>

      <h2 className="font-bold text-lg sm:text-xl">
        Recent Bookings
      </h2>

      <div className="border rounded-lg shadow-sm overflow-x-auto">
        <Table className="w-[650px] md:w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Sr. No</TableHead>
              <TableHead>Traveller</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {stats.recentBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No recent bookings
                </TableCell>
              </TableRow>
            )}

            {stats.recentBookings.map((b, index) => (
              <TableRow key={b._id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <button
                    onClick={() => {
                      setSelectedBooking(b);
                      setOpenModal(true);
                    }}
                  >
                    {b?.userId?.firstName} {b?.userId?.lastName}
                  </button>
                </TableCell>

                <TableCell className="max-w-[200px] truncate">
                  {b?.propertyId?.propertyName || "—"}
                </TableCell>

                <TableCell>
                  {formatCurrency(b.totalAmount)}
                </TableCell>

                <TableCell>
                  {b.paymentStatus === "paid" ? (
                    <span className="text-green-600 font-medium">
                      Paid
                    </span>
                  ) : b.paymentStatus === "pending" ? (
                    <span className="text-yellow-600 font-medium">
                      Pending
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Failed
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {formatDate(b.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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


function StatCard({ title, value, icon: Icon, color = "" }) {
  return (
    <Card className="border border-neutral-200 shadow-sm">
      <CardHeader className="flex p-3 md:p-auto flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-neutral-500" />
      </CardHeader>
      <CardContent className="p-3 md:p-auto">
        <div className={`text-2xl sm:text-3xl font-bold ${color}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}


export default DashboardPage;
