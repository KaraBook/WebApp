import { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

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

  /* ---------------- FETCH PROPERTIES ---------------- */
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
        console.error(err);
        toast.error("Unable to load properties");
      }
    };
    fetchOwnerProperties();
  }, []);

  /* ---------------- FETCH BLOCKED DATES ---------------- */
  useEffect(() => {
    if (!propertyId) return;
    const fetchBlockedDates = async () => {
      try {
        const res = await api.get(SummaryApi.getPropertyBlockedDates.url(propertyId));
        setBlockedDates(res.data.dates || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlockedDates();
  }, [propertyId]);

  /* ---------------- BLOCK DATES ---------------- */
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
    } catch (err) {
      console.error(err);
      toast.error("Unable to block dates");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UNBLOCK DATES ---------------- */
  const handleUnblockSingle = async (range) => {
    if (!propertyId) return toast.error("No property selected");

    try {
      setLoading(true);
      const res = await api.delete(SummaryApi.removeBlockedDates.url(propertyId), {
        data: {
          start: new Date(range.start).toISOString(),
          end: new Date(range.end).toISOString(),
        },
      });

      toast.success("Date range unblocked");
      setBlockedDates(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to unblock");
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (date) =>
    blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });

  return (
    <div className="p-2 flex flex-col lg:flex-row gap-6 justify-center items-start">
      
      {/* LEFT: CALENDAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full lg:w-1/2 shadow-sm">
        <h2 className="text-2xl font-semibold text-center text-black mb-4">
          Manage Calendar
        </h2>

        <div className="text-center mb-3">
          <p className="text-gray-600 text-sm">
            {format(dateRange[0].startDate, "MMM dd, yyyy")} →{" "}
            {format(dateRange[0].endDate, "MMM dd, yyyy")}
          </p>
        </div>

        <DateRange
          ranges={dateRange}
          onChange={(item) => setDateRange([item.selection])}
          minDate={new Date()}
          rangeColors={["#000000"]}   // ⬅ BLACK highlight
          disabledDay={isDateBlocked}
          moveRangeOnFirstSelection={false}
          showSelectionPreview={false}
          showDateDisplay={false}
          months={1}
          direction="horizontal"
        />

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleBlockDates}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
          >
            Block Selected Dates
          </Button>
        </div>
      </div>

      {/* RIGHT: BLOCKED LIST */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full lg:w-1/2 max-h-[550px] overflow-y-auto">
        <h3 className="text-xl font-semibold text-black mb-4">
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
                className="flex items-center justify-between border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
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
                  disabled={loading}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleUnblockSingle(range)}
                >
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
