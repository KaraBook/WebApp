import { useEffect, useState } from "react";
import { Loader2, CalendarCheck, Clock, CheckCircle, IndianRupee } from "lucide-react";
import Header from "../components/Header";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ICONS = {
    "Total Bookings": CheckCircle,
    "Confirmed": CalendarCheck,
    "Pending": Clock,
    "Total Revenue": IndianRupee,
  };

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  const { stats, bookings } = data || {};

  return (
    <>
      <Header />

      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: stats?.totalBookings },
            { label: "Confirmed", value: stats?.confirmed },
            { label: "Pending", value: stats?.pending },
            {
              label: "Total Revenue",
              value: `₹${stats?.totalRevenue?.toLocaleString("en-IN")}`,
            },
          ].map((item) => {
            const Icon = ICONS[item.label];
            return (
              <div
                key={item.label}
                className="rounded-xl bg-white border shadow-sm p-5 hover:shadow-md transition flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-gray-100">
                  <Icon size={26} className="text-[#0a5870]" />
                </div>

                <div>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className="text-[28px] font-bold">{item.value || 0}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Bookings Section */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>

          <div className="bg-white border rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 border-b">
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
                        {new Date(b.checkIn).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(b.checkOut).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4">{b.totalNights}</td>
                      <td className="py-3 px-4">{b.guests}</td>
                      <td className="py-3 px-4 font-semibold">
                        ₹{b.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <PaymentChip status={b.paymentStatus} />
                      </td>
                      <td className="py-3 px-4">
                        {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function PaymentChip({ status }) {
  const styles = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-800",
    initiated: "bg-gray-100 text-gray-600",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-4 py-1 rounded-full text-xs capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
