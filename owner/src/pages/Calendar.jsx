import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { format } from "date-fns";
import { RotateCcw, Calendar as CalendarIcon, Filter, X } from "lucide-react";

export default function OwnerCalendar() {
  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  /* LOAD PROPERTY */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data?.data || [];
        if (list.length > 0) setPropertyId(list[0]._id);
        else toast.error("No property found");
      } catch {
        toast.error("Unable to load properties");
      }
    })();
  }, []);

  /* LOAD DATES */
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        const blocked = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const booked = await api.get(
          SummaryApi.getBookedDates.url(propertyId)
        );
        setBlockedDates(blocked.data?.dates || []);
        setBookedDates(booked.data?.dates || []);
      } catch {
        toast.error("Failed to load calendar data");
      }
    })();
  }, [propertyId]);

  const isDateBlocked = (date) =>
    blockedDates.some((r) => date >= new Date(r.start) && date <= new Date(r.end));

  const isDateBooked = (date) =>
    bookedDates.some((r) => date >= new Date(r.start) && date <= new Date(r.end));

  const handleBlockDates = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const { startDate, endDate } = dateRange[0];
      const res = await api.post(
        SummaryApi.addBlockedDates.url(propertyId),
        {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          reason: "Owner blocked these dates",
        }
      );
      setBlockedDates(res.data?.data || []);
      toast.success("Dates blocked successfully");
    } catch {
      toast.error("Unable to block dates");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (r) => {
    try {
      setLoading(true);
      const res = await api.delete(
        SummaryApi.removeBlockedDates.url(propertyId),
        {
          data: {
            start: new Date(r.start).toISOString(),
            end: new Date(r.end).toISOString(),
          },
        }
      );
      setBlockedDates(res.data?.data || []);
      toast.success("Dates unblocked");
    } catch {
      toast.error("Unable to unblock dates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold">Calendar</h1>
            <p className="text-sm text-gray-500">
              Manage your property availability and blocked dates
            </p>
          </div>

          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CALENDAR */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Select Dates to Block</h2>
                <p className="text-sm text-gray-500">
                  {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
                  {format(dateRange[0].endDate, "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <DateRange
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                minDate={new Date()}
                months={1}
                showMonthAndYearPickers={false} // ✅ IMPORTANT
                direction="horizontal"
                showDateDisplay={false}
                moveRangeOnFirstSelection={false}
                dragSelectionEnabled
                rangeColors={["#14b8a6"]}
                disabledDay={(date) =>
                  isDateBlocked(date) || isDateBooked(date)
                }
              />
            </div>

            <Button
              onClick={handleBlockDates}
              disabled={loading}
              className="mt-6 w-full bg-primary"
            >
              Block Selected Dates
            </Button>
          </div>

          {/* BLOCKED LIST */}
          <div className="bg-white rounded-2xl p-6 shadow-sm max-h-[520px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold">Blocked Date Ranges</h2>
                <p className="text-sm text-gray-500">
                  {blockedDates.length} active blocks
                </p>
              </div>
            </div>

            {blockedDates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-10">
                No blocked dates yet
              </p>
            ) : (
              <ul className="space-y-3">
                {blockedDates.map((r, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center border rounded-xl p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
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
                      onClick={() => handleUnblock(r)}
                      className="border-red-300 text-red-600"
                    >
                      <X size={14} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
