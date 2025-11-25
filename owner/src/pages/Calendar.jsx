import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { Button } from "@/components/ui/button";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OwnerCalendar() {
  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data.data || [];
        if (list.length > 0) setPropertyId(list[0]._id);
      } catch {
        toast.error("Unable to load properties");
      }
    };
    loadProperty();
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    const loadBlocked = async () => {
      try {
        const res = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        setBlockedDates(res.data.dates || []);
      } catch {}
    };
    loadBlocked();
  }, [propertyId]);

  const handleBlockDates = async () => {
    const { startDate, endDate } = dateRange[0];
    try {
      setLoading(true);
      const res = await api.post(SummaryApi.addBlockedDates.url(propertyId), {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reason: "Owner blocked dates",
      });
      toast.success("Dates blocked");
      setBlockedDates(res.data.data || []);
    } catch {
      toast.error("Failed to block dates");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockSingle = async (range) => {
    try {
      setLoading(true);
      const res = await api.delete(SummaryApi.removeBlockedDates.url(propertyId), {
        data: {
          start: new Date(range.start).toISOString(),
          end: new Date(range.end).toISOString(),
        },
      });
      toast.success("Date unblocked");
      setBlockedDates(res.data.data || []);
    } catch {
      toast.error("Failed to unblock");
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (day) => {
    return blockedDates.some((range) => {
      const s = new Date(range.start);
      const e = new Date(range.end);
      return day >= s && day <= e;
    });
  };

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8">

      {/* LEFT — Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 w-full lg:w-1/2">

        <h2 className="text-2xl font-semibold text-center mb-2 tracking-tight">
          Manage Calendar
        </h2>

        <p className="text-center text-gray-500 text-sm mb-4">
          {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
          {format(dateRange[0].endDate, "MMM dd, yyyy")}
        </p>

        {/* Calendar */}
        <div className="calendar-wrapper">
          <DateRange
            ranges={dateRange}
            onChange={(item) => setDateRange([item.selection])}
            minDate={new Date()}
            rangeColors={["#000000"]} // black selected
            moveRangeOnFirstSelection={false}
            showDateDisplay={false}
            months={1}
            direction="horizontal"
            dayContentRenderer={(day) => {
              const blocked = isDateBlocked(day);

              return (
                <div
                  className={`w-full h-full flex items-center justify-center rounded-md
                    ${
                      blocked
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                        : "hover:bg-gray-900 hover:text-white transition"
                    }
                  `}
                >
                  {day.getDate()}
                </div>
              );
            }}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleBlockDates}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Block Selected Dates
          </Button>
        </div>
      </div>

      {/* RIGHT — Blocked Date List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 w-full lg:w-1/2 max-h-[550px] overflow-y-auto">

        <h3 className="text-xl font-semibold mb-4">Blocked Dates</h3>

        {blockedDates.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-10">
            No blocked dates yet.
          </p>
        )}

        <ul className="space-y-3">
          {blockedDates.map((range, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div>
                <p className="text-gray-800 font-medium text-sm">
                  {format(new Date(range.start), "MMM dd, yyyy")} →{" "}
                  {format(new Date(range.end), "MMM dd, yyyy")}
                </p>
                {range.reason && (
                  <p className="text-xs text-gray-500 mt-1">{range.reason}</p>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                disabled={loading}
                onClick={() => handleUnblockSingle(range)}
              >
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
