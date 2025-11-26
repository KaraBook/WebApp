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

        // SORT BY LATEST BOOKING FIRST
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats?.totalBookings} />
        <StatCard label="Confirmed" value={stats?.confirmed} color="text-green-600" />
        <StatCard label="Pending" value={stats?.pending} color="text-yellow-600" />
        <StatCard
          label="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`}
          color="text-emerald-700"
        />
      </div>

      {/* Recent Bookings */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left border-b">
                <th className="p-3 font-medium">Traveller</th>
                <th className="p-3 font-medium">Property</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {bookings?.length ? (
                bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-b transition hover:bg-gray-100/50"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {b.userId?.firstName} {b.userId?.lastName}
                      <div className="text-xs text-gray-500">
                        {b.userId?.mobile}
                      </div>
                    </td>

                    <td className="p-3 text-gray-700">
                      {b.propertyId?.propertyName}
                    </td>

                    <td className="p-3 font-semibold text-gray-900">
                      ₹{b.totalAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-3">
                      <StatusChip status={b.paymentStatus} />
                    </td>

                    <td className="p-3 text-gray-600">
                      {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
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
        <p className={`text-2xl font-semibold ${color || "text-gray-800"}`}>
          {value || 0}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  const base =
    "px-3 py-1 text-xs rounded-full font-medium border inline-block";

  const styles = {
    paid: "bg-green-100 text-green-700 border-green-300",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    initiated: "bg-gray-100 text-gray-600 border-gray-300",
    failed: "bg-red-100 text-red-700 border-red-300",
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}
