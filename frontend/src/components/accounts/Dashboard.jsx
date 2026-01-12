import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Heart,
  Building2,
  Wallet,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  /* ---------------- MOCK DATA (replace with API) ---------------- */
  const stats = {
    totalBookings: 5,
    confirmed: 4,
    pending: 1,
    cancelled: 0,
    wishlist: 3,
    visited: 4,
    spent: 47000,
    growth: "+12.5%",
  };

  const recentBookings = [
    {
      id: 1,
      property: "Krutarth Villa",
      checkIn: "30 Dec 2025",
      checkOut: "31 Dec 2025",
      nights: 1,
      guests: 1,
      status: "pending",
      created: "30 Dec 2025",
    },
    {
      id: 2,
      property: "Comfortable Livin",
      checkIn: "01 Jan 2026",
      checkOut: "02 Jan 2026",
      nights: 1,
      guests: 5,
      status: "confirmed",
      created: "30 Dec 2025",
    },
    {
      id: 3,
      property: "West Valley Villa Casa East",
      checkIn: "27 Nov 2025",
      checkOut: "30 Nov 2025",
      nights: 3,
      guests: 3,
      status: "confirmed",
      created: "24 Nov 2025",
    },
  ];

  /* ---------------- UI ---------------- */
  return (
    <div className="px-4 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard Overview
        </h1>

        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<Calendar />}
          dark
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={<CheckCircle2 />}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock />}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<XCircle />}
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Wishlist Items"
          value={stats.wishlist}
          icon={<Heart />}
        />
        <StatCard
          title="Properties Visited"
          value={stats.visited}
          icon={<Building2 />}
        />
        <StatCard
          title="Total Spent"
          value={`₹${stats.spent.toLocaleString("en-IN")}`}
          subtitle={`${stats.growth} from last month`}
          icon={<Wallet />}
          dark
        />
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Button variant="outline" size="sm">
            All Bookings
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-6 py-3">Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right px-6">Actions</th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {b.property}
                  </td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td>{b.nights}</td>
                  <td>{b.guests}</td>
                  <td>
                    <StatusChip status={b.status} />
                  </td>
                  <td className="text-gray-500">{b.created}</td>
                  <td className="px-6 text-right">
                    <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function StatCard({ title, value, subtitle, icon, dark }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex justify-between items-start",
        dark
          ? "bg-black text-white border-black"
          : "bg-white text-gray-900"
      )}
    >
      <div>
        <p className={cn("text-sm", dark ? "text-gray-300" : "text-gray-500")}>
          {title}
        </p>
        <p className="text-3xl font-semibold mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs mt-1 text-green-400">{subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          dark ? "bg-white/10" : "bg-gray-100"
        )}
      >
        {icon}
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const map = {
    pending: "bg-orange-100 text-orange-600 border-orange-300",
    confirmed: "bg-green-100 text-green-600 border-green-300",
    cancelled: "bg-red-100 text-red-600 border-red-300",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium border capitalize",
        map[status]
      )}
    >
      {status}
    </span>
  );
}
