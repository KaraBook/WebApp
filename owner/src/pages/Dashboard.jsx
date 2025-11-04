import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../../api/axios";
import SummaryApi from "../../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerDashboard.url);
        setData(res.data.data);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats?.totalBookings} />
        <StatCard label="Confirmed" value={stats?.confirmed} color="text-green-600" />
        <StatCard label="Pending" value={stats?.pending} color="text-yellow-600" />
        <StatCard label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString("en-IN")}`} color="text-emerald-700" />
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Recent Bookings</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Traveller</th>
                <th className="p-3">Property</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.length ? (
                bookings.map((b, i) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{b.userId?.firstName} {b.userId?.lastName}</td>
                    <td className="p-3">{b.propertyId?.propertyName}</td>
                    <td className="p-3">₹{b.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      <Badge variant={b.paymentStatus === "paid" ? "success" : "outline"}>
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3">{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold ${color || ""}`}>{value || 0}</p>
      </CardContent>
    </Card>
  );
}
