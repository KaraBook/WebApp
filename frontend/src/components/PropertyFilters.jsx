import { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import Select from "react-select";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";

export default function PropertyFilters({ onFilter }) {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [guestCount, setGuestCount] = useState(1);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            key: "selection",
        },
    ]);

    useEffect(() => {
        const st = getIndianStates().map((s) => ({
            value: s.isoCode,
            label: s.name,
        }));
        setStates(st);
    }, []);

    useEffect(() => {
        if (selectedState) {
            const ct = getCitiesByState(selectedState.value).map((c) => ({
                value: c.name,
                label: c.name,
            }));
            setCities(ct);
        } else {
            setCities([]);
            setSelectedCity(null);
        }
    }, [selectedState]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const applyFilters = () => {
        onFilter({
            state: selectedState?.value || "", 
            city: selectedCity?.value || "",
            checkIn: dateRange[0].startDate,
            checkOut: dateRange[0].endDate,
            guests: guestCount,
        });
    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: "9999px",
            border: state.isFocused ? "1.5px solid black" : "1px solid #e5e7eb",
            boxShadow: "none",
            paddingLeft: "8px",
            height: "40px",
            cursor: "pointer",
            backgroundColor: "white",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#efcc61"
                : state.isFocused
                    ? "#efcc6154"
                    : "white",
            color: state.isSelected ? "#ffffff" : "#111827",
            cursor: "pointer",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: "#6b7280",
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "1rem",
            overflow: "hidden",
            zIndex: 9999,
            width: "250px",
            fontSize: "0.875rem",
        }),
    };

    return (
        <div className="w-full bg-white shadow-xl rounded-full px-6 py-4 flex flex-wrap items-center justify-between gap-3 relative -mt-10 z-[50] border border-gray-100">
            {/* State */}
            <div className="flex-1 min-w-[180px] z-10">
                <label className="text-xs text-gray-500 uppercase ml-4">State</label>
                <Select
                    options={states}
                    placeholder="Select state"
                    value={selectedState}
                    onChange={setSelectedState}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuPlacement="bottom"
                    menuShouldScrollIntoView={false}
                    className="mt-1"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#efcc61",
                            primary25: "#efcc6154",
                            primary50: "#efcc6154",
                        },
                    })}
                />
            </div>

            {/* City */}
            <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-gray-500 uppercase ml-4">City</label>
                <Select
                    options={cities}
                    placeholder="Select city"
                    value={selectedCity}
                    onChange={setSelectedCity}
                    isDisabled={!selectedState}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuPlacement="bottom"
                    menuShouldScrollIntoView={false}
                    className="mt-1"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#efcc61",
                            primary25: "#efcc6154",
                            primary50: "#efcc6154",
                        },
                    })}
                />
            </div>

            {/* Date Range */}
            <div className="flex-1 min-w-[220px] relative" ref={calendarRef}>
                <label className="text-xs text-gray-500 uppercase ml-4">Check-in / Check-out</label>
                <div
                    className="flex items-center justify-between border border-gray-300 hover:border-black rounded-full px-4 py-2 mt-1 cursor-pointer transition-all duration-200"
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    <span className="text-gray-700 text-sm font-medium">
                        {`${format(dateRange[0].startDate, "MMM d")} - ${format(
                            dateRange[0].endDate,
                            "MMM d"
                        )}`}
                    </span>
                    <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                {showCalendar && (
                    <div className="absolute top-[71px] left-0 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 z-50">
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
                            className="z-10"
                        />
                    </div>
                )}
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-gray-500 uppercase ml-4">Traveller</label>
                <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="border border-gray-300 hover:border-black rounded-full px-4 py-2 mt-1 w-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-black transition-all duration-200"
                />
            </div>

            {/* Search Button */}
            <button
                onClick={applyFilters}
                className="bg-primary text-black rounded-full px-8 py-2 mt-6 font-semibold transition-all duration-300 shadow-md"
            >
                Search
            </button>
        </div>
    );
}
