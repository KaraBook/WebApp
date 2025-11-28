import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
      </div>
    );

  const { stats, bookings } = data || {};

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats?.totalBookings} />
        <StatCard label="Confirmed" value={stats?.confirmed} color="text-green-600" />
        <StatCard label="Pending" value={stats?.pending} color="text-yellow-600" />
        <StatCard
          label="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`}
          color="text-[#0a5870]"
        />
      </div>

   
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>

        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Traveller</th>
                <th className="py-3 px-4 text-left">Property</th>
                <th className="py-3 px-4 text-left">Check-in</th>
                <th className="py-3 px-4 text-left">Check-out</th>
                <th className="py-3 px-4 text-left">Nights</th>
                <th className="py-3 px-4 text-left">Guests</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Payment</th>
                <th className="py-3 px-4 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {bookings?.length ? (
                bookings.map((b) => (
                  <tr key={b._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        {b.userId?.firstName} {b.userId?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{b.userId?.mobile}</div>
                    </td>

                    <td className="py-3 px-4">{b.propertyId?.propertyName}</td>

                    <td className="py-3 px-4">
                      {new Date(b.checkIn).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      {new Date(b.checkOut).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4">{b.totalNights}</td>

                    <td className="py-3 px-4">{b.guests}</td>

                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ₹{b.totalAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4">
                      <StatusChip status={b.paymentStatus} />
                    </td>

                    <td className="py-3 px-4 text-gray-600">
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
                  <td colSpan="10" className="text-center py-6 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card className="rounded-xl shadow-sm border hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-[32px] font-bold ${color || "text-gray-800"}`}>
          {value || 0}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  const styles = {
    paid: "px-6 capitalize py-1 rounded-full text-xs font-medium bg-green-100 text-green-700",
    pending: "px-6 capitalize py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
    initiated: "px-6 capitalize py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ",
    failed: "px-6 py-1 capitalize rounded-full text-xs font-medium bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
      {status}
    </span>
  );
}
