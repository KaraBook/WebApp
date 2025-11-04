import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );

  const { stats, properties, bookings } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome, {user?.name || user?.mobile}
          </h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats?.totalProperties || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats?.totalBookings || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">
                {stats?.confirmed || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-700">
                ₹{stats?.totalRevenue?.toLocaleString("en-IN") || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Property Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Your Properties</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {properties?.length ? (
              properties.map((p) => (
                <Card key={p._id} className="hover:shadow-md transition">
                  <CardContent className="p-4 flex gap-4">
                    <img
                      src={p.coverImage}
                      alt={p.propertyName}
                      className="w-28 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{p.propertyName}</h3>
                      <p className="text-sm text-gray-500">
                        {p.city}, {p.state}
                      </p>
                      <Badge variant={p.publishNow ? "default" : "secondary"} className="mt-2">
                        {p.publishNow ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No properties found.</p>
            )}
          </div>
        </div>

        {/* Booking Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3 mt-6">Recent Bookings</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Property</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings?.length ? (
                  bookings.map((b) => (
                    <tr key={b._id} className="border-t">
                      <td className="p-3 font-medium">{b.propertyId?.propertyName}</td>
                      <td className="p-3">{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td className="p-3">{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td className="p-3">{b.guests}</td>
                      <td className="p-3">₹{b.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            b.paymentStatus === "paid" ? "success" : "outline"
                          }
                        >
                          {b.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
