import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function OwnerCalendar() {
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const propertyId = localStorage.getItem("ownerPropertyId"); // (since owner has only one property)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getPropertyBlockedDates.url(propertyId));
        setBlockedDates(res.data.dates || []);
      } catch {
        toast.error("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleBlock = async () => {
    const { startDate, endDate } = range[0];
    try {
      await api.post(SummaryApi.addBlockedDates.url(propertyId), {
        start: startDate,
        end: endDate,
        reason: "Owner manual block",
      });
      toast.success("Dates blocked");
      setBlockedDates([...blockedDates, { start: startDate, end: endDate }]);
    } catch {
      toast.error("Failed to block dates");
    }
  };

  const handleUnblock = async () => {
    const { startDate, endDate } = range[0];
    try {
      await api.delete(SummaryApi.removeBlockedDates.url(propertyId), {
        data: { start: startDate, end: endDate },
      });
      toast.success("Dates unblocked");
      setBlockedDates(blockedDates.filter(
        b => !(new Date(b.start).getTime() === startDate.getTime() &&
               new Date(b.end).getTime() === endDate.getTime())
      ));
    } catch {
      toast.error("Failed to unblock");
    }
  };

  const isDisabled = (date) =>
    blockedDates.some(b => date >= new Date(b.start) && date <= new Date(b.end));

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manage Calendar</h1>
      {loading ? (
        <p>Loading calendar...</p>
      ) : (
        <>
          <DateRange
            ranges={range}
            onChange={(item) => setRange([item.selection])}
            rangeColors={["#efcc61"]}
            minDate={new Date()}
            disabledDay={isDisabled}
          />

          <div className="flex gap-4 mt-6">
            <Button onClick={handleBlock} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Block Selected Dates
            </Button>
            <Button onClick={handleUnblock} variant="outline" className="text-red-600 border-red-300">
              Unblock Selected Dates
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
