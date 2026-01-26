import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


import { format } from "date-fns";
import { RotateCcw } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function OwnerCalendar() {
  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  /* ================= LOAD PROPERTY ================= */
  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data?.data || [];
        if (!list.length) return toast.error("No property found");
        setPropertyId(list[0]._id);
      } catch {
        toast.error("Unable to load property");
      }
    };
    loadProperty();
  }, []);

  /* ================= LOAD DATES ================= */
  useEffect(() => {
    if (!propertyId) return;

    const loadDates = async () => {
      try {
        const [blocked, booked] = await Promise.all([
          api.get(SummaryApi.getPropertyBlockedDates.url(propertyId)),
          api.get(SummaryApi.getBookedDates.url(propertyId)),
        ]);
        setBlockedDates(blocked.data?.dates || []);
        setBookedDates(booked.data?.dates || []);
      } catch {
        toast.error("Failed to load calendar data");
      }
    };

    loadDates();
  }, [propertyId]);


  const normalize = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const isDateBlocked = (date) =>
    blockedDates.some((r) => {
      const start = normalize(new Date(r.start));
      const end = normalize(new Date(r.end));
      const target = normalize(date);

      return target >= start && target <= end;
    });

  const isDateBooked = (date) =>
    bookedDates.some((r) => {
      const start = normalize(new Date(r.start));
      const end = normalize(new Date(r.end));
      const target = normalize(date);

      return target >= start && target <= end;
    });


  const handleBlockDates = async () => {
    if (!propertyId) return;
    const { startDate, endDate } = dateRange[0];

    try {
      setLoading(true);
      const res = await api.post(SummaryApi.addBlockedDates.url(propertyId), {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reason: "Owner blocked these dates",
      });
      toast.success("Dates blocked");
      setBlockedDates(res.data?.data || []);
    } catch {
      toast.error("Unable to block dates");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (range) => {
    try {
      setLoading(true);

      const start = new Date(range.start).toISOString();
      const end = new Date(range.end).toISOString();

      const res = await api.delete(
        `${SummaryApi.removeBlockedDates.url(propertyId)}?start=${start}&end=${end}`
      );

      toast.success("Dates unblocked");
      setBlockedDates(res.data?.data || []);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to unblock dates"
      );
    } finally {
      setLoading(false);
    }
  };



  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 md:px-6 py-5 md:py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-[26px] font-bold text-gray-900">Calendar</h1>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} />
            Refresh
          </Button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm md:p-6 p-4">
            <h2 className="text-lg font-semibold text-gray-900 text-left">
              Select Dates to Block
            </h2>

            <p className="text-left text-sm text-emerald-600 mt-1">
              {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
              {format(dateRange[0].endDate, "MMM dd, yyyy")}
            </p>

            <Separator />

            <div className="mt-6 calendar-shell w-full flex justify-center">
              <DateRange
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                minDate={new Date()}
                months={1}
                direction="horizontal"
                showDateDisplay={false}
                moveRangeOnFirstSelection={false}
                disabledDay={(date) => isDateBlocked(date) || isDateBooked(date)}
              />
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                onClick={handleBlockDates}
                disabled={loading}
                className="bg-primary hover:primary text-white px-8"
              >
                Block Selected Dates
              </Button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm md:p-6 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Blocked Date Ranges
            </h3>

            {blockedDates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-10">
                No blocked dates yet
              </p>
            ) : (
              <div className="space-y-3">
                {blockedDates.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border bg-gray-50 border-gray-200 rounded-xl md:px-4 md:py-3 px-2 py-2 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {format(new Date(r.start), "MMM dd, yyyy")} →{" "}
                        {format(new Date(r.end), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Owner blocked these dates
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:primary"
                      onClick={() => handleUnblock(r)}
                      disabled={loading}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
