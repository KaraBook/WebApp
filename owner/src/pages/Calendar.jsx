import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { format } from "date-fns";
import {
  RotateCcw,
  Calendar as CalendarIcon,
  Filter,
  X,
} from "lucide-react";

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

  /* --------------------------------
     LOAD OWNER PROPERTY
  -------------------------------- */
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

  /* --------------------------------
     LOAD BLOCKED + BOOKED DATES
  -------------------------------- */
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

  /* --------------------------------
     HELPERS
  -------------------------------- */
  const isDateBlocked = (date) =>
    blockedDates.some((r) => {
      const s = new Date(r.start);
      const e = new Date(r.end);
      return date >= s && date <= e;
    });

  const isDateBooked = (date) =>
    bookedDates.some((r) => {
      const s = new Date(r.start);
      const e = new Date(r.end);
      return date >= s && date <= e;
    });

  /* --------------------------------
     ACTIONS
  -------------------------------- */
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

  const handleUnblock = async (range) => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const res = await api.delete(
        SummaryApi.removeBlockedDates.url(propertyId),
        {
          data: {
            start: new Date(range.start).toISOString(),
            end: new Date(range.end).toISOString(),
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

  /* --------------------------------
     RENDER
  -------------------------------- */
  return (
    <div className="bg-[#f5f5f7] min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold text-gray-900">
              Calendar
            </h1>
            <p className="text-sm text-gray-500">
              Manage your property availability and blocked dates
            </p>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 self-start md:self-auto"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} />
            Refresh
          </Button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — CALENDAR */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">

            {/* TITLE */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Select Dates to Block
                </h2>
                <p className="text-sm text-gray-500">
                  {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
                  {format(dateRange[0].endDate, "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* CALENDAR */}
            <div className="border rounded-xl overflow-hidden">
              <DateRange
                ranges={dateRange}
                onChange={(item) =>
                  setDateRange([item.selection])
                }
                minDate={new Date()}
                months={1}
                direction="horizontal"
                showDateDisplay={false}
                moveRangeOnFirstSelection={false}
                dragSelectionEnabled
                rangeColors={["#0097A7"]}
                disabledDay={(date) =>
                  isDateBlocked(date) || isDateBooked(date)
                }
              />
            </div>

            {/* ACTION */}
            <Button
              onClick={handleBlockDates}
              disabled={loading}
              className="mt-6 w-full bg-primary text-white"
            >
              Block Selected Dates
            </Button>
          </div>

          {/* RIGHT — BLOCKED LIST */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 max-h-[520px] overflow-y-auto">

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-red-500" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Blocked Date Ranges
                </h2>
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
                    className="flex items-center justify-between gap-3 border rounded-xl p-4 hover:bg-gray-50"
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
                      disabled={loading}
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
