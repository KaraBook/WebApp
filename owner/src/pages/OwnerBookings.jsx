import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get(SummaryApi.getOwnerBookings.url);
      setBookings(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const result = bookings.filter((b) => {
      return (
        b._id?.toLowerCase().includes(q) ||
        b.userId?.firstName?.toLowerCase().includes(q) ||
        b.userId?.lastName?.toLowerCase().includes(q) ||
        b.propertyId?.propertyName?.toLowerCase().includes(q) ||
        b.userId?.mobile?.includes(q)
      );
    });
    setFiltered(result);
  }, [query, bookings]);

  const getStatusChip = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === "paid")
      return <span className={`${base} bg-green-100 text-green-700`}>Paid</span>;
    if (status === "pending")
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
    return <span className={`${base} bg-red-100 text-red-700`}>Failed</span>;
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-2">
      <h1 className="text-2xl font-semibold mb-6">Bookings</h1>

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search: booking id / traveller / phone / property"
          className="w-80 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          
        />

        <Button onClick={fetchBookings}>Refresh</Button>
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Traveller</th>
              <th className="py-3 px-4 text-left font-medium">Property</th>
              <th className="py-3 px-4 text-left font-medium">Check-in</th>
              <th className="py-3 px-4 text-left font-medium">Check-out</th>
              <th className="py-3 px-4 text-left font-medium">Nights</th>
              <th className="py-3 px-4 text-left font-medium">Guests</th>
              <th className="py-3 px-4 text-left font-medium">Amount</th>
              <th className="py-3 px-4 text-left font-medium">Payment</th>
              <th className="py-3 px-4 text-left font-medium">Created</th>
              <th className="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b, i) => (
              <tr
                key={b._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-semibold">
                    {b.userId?.firstName} {b.userId?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{b.userId?.mobile}</div>
                </td>

                <td className="py-3 px-4">
                  {b.propertyId?.propertyName}
                </td>

                <td className="py-3 px-4">
                  {format(new Date(b.checkIn), "d MMM yy")}
                </td>

                <td className="py-3 px-4">
                  {format(new Date(b.checkOut), "d MMM yy")}
                </td>

                <td className="py-3 px-4">{b.totalNights}</td>
                <td className="py-3 px-4">{b.guests}</td>

                <td className="py-3 px-4 font-medium">
                  ₹{b.totalAmount?.toLocaleString()}
                </td>

                <td className="py-3 px-4">
                  {getStatusChip(b.paymentStatus)}
                </td>

                <td className="py-3 px-4 text-gray-500 text-xs">
                  {format(new Date(b.createdAt), "d MMM yy")}
                </td>

                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-5 w-5 cursor-pointer text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem>View Invoice</DropdownMenuItem>
                      <DropdownMenuItem>Copy Email</DropdownMenuItem>
                      <DropdownMenuItem>Copy Phone</DropdownMenuItem>
                      <DropdownMenuItem>WhatsApp Chat</DropdownMenuItem>
                      <DropdownMenuItem>Download Invoice</DropdownMenuItem>
                      <DropdownMenuItem>
                        Resend Links (WA + Email)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}
