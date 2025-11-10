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

    /* ---------------- FETCH PROPERTY ID ON LOAD ---------------- */
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
                console.error("Failed to fetch properties:", err);
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
                console.error("Failed to load blocked dates:", err);
            }
        };
        fetchBlockedDates();
    }, [propertyId]);

    /* ---------------- BLOCK SELECTED DATES ---------------- */
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
            console.error("Failed to block dates:", err);
            toast.error("Unable to block dates");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UNBLOCK SELECTED DATES ---------------- */
    const handleUnblockDates = async () => {
        if (!propertyId) return toast.error("No property selected");
        const { startDate, endDate } = dateRange[0];
        try {
            setLoading(true);
            const res = await api.delete(SummaryApi.removeBlockedDates.url(propertyId), {
                data: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
            });
            toast.success("Dates unblocked successfully!");
            setBlockedDates(res.data.data || []);
        } catch (err) {
            console.error("Failed to unblock dates:", err);
            toast.error("Unable to unblock dates");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- DISABLED DATES FUNCTION ---------------- */
    const isDateBlocked = (date) => {
        return blockedDates.some((range) => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            return date >= start && date <= end;
        });
    };

    /* ---------------- UI RENDER ---------------- */
    return (
        <div className="p-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-center text-[#233b19] mb-6">
                    Manage Calendar
                </h2>

                <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm">
                        {format(dateRange[0].startDate, "MMM dd, yyyy")} -{" "}
                        {format(dateRange[0].endDate, "MMM dd, yyyy")}
                    </p>
                </div>

                <DateRange
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    minDate={new Date()}
                    rangeColors={["#efcc61"]}
                    moveRangeOnFirstSelection={false}
                    showSelectionPreview={false}
                    showDateDisplay={false}
                    months={1}
                    direction="horizontal"
                    disabledDay={isDateBlocked}
                />

                {blockedDates.length > 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        {blockedDates.length} blocked date range{blockedDates.length > 1 ? "s" : ""}
                    </p>
                )}


                <div className="mt-6 flex gap-3 justify-center">
                    <Button
                        onClick={handleBlockDates}
                        disabled={loading}
                        className="bg-[#233b19] text-white hover:bg-[#2f4d24]"
                    >
                        Block Selected Dates
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleUnblockDates}
                        disabled={loading}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                        Unblock Selected Dates
                    </Button>
                </div>
            </div>
        </div>
    );
}
