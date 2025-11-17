import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CalendarCheck, Clock, Wallet, Home } from "lucide-react";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

      const totalRevenue = confirmed.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Button className="bg-transparent text-black hover:bg-transparent" onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck className="w-5 h-5 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Clock className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users / Revenue / Properties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-5 h-5 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="w-5 h-5 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProperties}</div>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="w-5 h-5 text-neutral-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <h1 className="font-bold text-xl p-0 m-0 h-2">Recent Bookings</h1>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table className="text-sm">
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
                  {b?.userId?.firstName} {b?.userId?.lastName}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {b?.propertyId?.propertyName || "—"}
                </TableCell>
                <TableCell>{formatCurrency(b.totalAmount)}</TableCell>
                <TableCell>
                  {b.paymentStatus === "paid" ? (
                    <span className="text-green-600 font-medium">Paid</span>
                  ) : b.paymentStatus === "pending" ? (
                    <span className="text-yellow-600 font-medium">Pending</span>
                  ) : (
                    <span className="text-red-600 font-medium">Failed</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(b.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DashboardPage;
