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

export default function OwnerCalendar() {
  const [propertyId, setPropertyId] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);


  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  // LOAD PROPERTY
  useEffect(() => {
    const fetchOwnerProperties = async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data.data || [];
        if (list.length > 0) {
          setPropertyId(list[0]._id);
        } else {
          toast.error("No property found for this owner.");
        }
      } catch (err) {
        toast.error("Unable to load properties");
      }
    };
    fetchOwnerProperties();
  }, []);

  // LOAD BLOCKED DATES
  useEffect(() => {
    if (!propertyId) return;

    const fetchBlockedDates = async () => {
      try {
        const res = await api.get(SummaryApi.getPropertyBlockedDates.url(propertyId));
        const booked = await api.get(SummaryApi.getBookedDates.url(propertyId));

        setBlockedDates(res.data.dates || []);
        setBookedDates(booked.data.dates || []);
      } catch (err) {
        toast.error("Failed to load dates");
      }
    };

    fetchBlockedDates();
  }, [propertyId]);


  // BLOCK DATE RANGE
  const handleBlockDates = async () => {
    if (!propertyId) return toast.error("No property selected");
    const { startDate, endDate } = dateRange[0];

    try {
      setLoading(true);
      const res = await api.post(SummaryApi.addBlockedDates.url(propertyId), {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        reason: "Owner blocked these dates",
      });

      toast.success("Dates blocked successfully!");
      setBlockedDates(res.data.data || []);
    } catch {
      toast.error("Unable to block dates");
    } finally {
      setLoading(false);
    }
  };

  // UNBLOCK A RANGE
  const handleUnblockSingle = async (range) => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const res = await api.delete(SummaryApi.removeBlockedDates.url(propertyId), {
        data: {
          start: new Date(range.start).toISOString(),
          end: new Date(range.end).toISOString(),
        },
      });

      toast.success("Selected range unblocked!");
      setBlockedDates(res.data.data || []);
    } catch {
      toast.error("Unable to unblock selected range");
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (date) => {
    return blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };

  const isDateBooked = (date) => {
    return bookedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };


  return (
    <div className="bg-[#f5f5f7] min-h-screen px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-semibold text-gray-900">Calendar</h1>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} />
            Refresh
          </Button>
        </div>

        {/* MAIN FLEX CONTAINER */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT SIDE – CALENDAR */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full lg:w-1/2">

            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Select Dates to Block
            </h2>

            {/* CURRENT RANGE */}
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">
                {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
                {format(dateRange[0].endDate, "MMM dd, yyyy")}
              </p>
            </div>

            {/* CALENDAR */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <DateRange
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                minDate={new Date()}
                months={1}
                direction="horizontal"
                showDateDisplay={false}
                moveRangeOnFirstSelection={false}
                rangeColors={["#0097A7"]}
                dragSelectionEnabled={true}
                disabledDay={(date) => isDateBooked(date) || isDateBlocked(date)}
              />
            </div>

            {/* BUTTON */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleBlockDates}
                disabled={loading}
                className="bg-primary text-white px-6"
              >
                Block Selected Dates
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE – BLOCKED LIST */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full lg:w-1/2 max-h-[550px] overflow-y-auto">

            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Blocked Date Ranges
            </h3>

            {blockedDates.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">
                No blocked dates yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {blockedDates.map((range, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {format(new Date(range.start), "MMM dd, yyyy")} →{" "}
                        {format(new Date(range.end), "MMM dd, yyyy")}
                      </p>
                      {range.reason && (
                        <p className="text-xs text-gray-500 mt-1">
                          {range.reason}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleUnblockSingle(range)}
                      className="border-primary text-primary px-3"
                    >
                      Unblock
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




