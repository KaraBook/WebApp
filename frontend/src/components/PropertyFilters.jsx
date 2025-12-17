import { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import Select from "react-select";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import SummaryApi from "@/common/SummaryApi";
import Axios from "@/utils/Axios";
import { STATE_CODE_TO_NAME } from "@/utils/stateMap";

export default function PropertyFilters({ onFilter, defaultValues = {} }) {
    const [locationTree, setLocationTree] = useState([]);

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);

    const guestRef = useRef(null);
    const calendarRef = useRef(null);

    const [guests, setGuests] = useState({
        adults: 1,
        children: 0,
        infants: 0
    });

    const [showGuestBox, setShowGuestBox] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            key: "selection",
        },
    ]);

    useEffect(() => {
        async function loadLocations() {
            try {
                const res = await Axios.get(SummaryApi.getUniqueLocations.url);
                const data = res.data.data;

                setLocationTree(data);

                setStates(
                    data.map((item) => ({
                        value: item.state,
                        label: STATE_CODE_TO_NAME[item.state] || item.state,
                    }))
                );
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        }
        loadLocations();
    }, []);


    useEffect(() => {
        if (!selectedState || !locationTree.length) return;

        const stateObj = locationTree.find((s) => s.state === selectedState.value);
        if (!stateObj) return;

        const cityOptions = stateObj.cities.map((c) => ({
            value: c.city,
            label: c.city,
        }));

        setCities(cityOptions);
        setSelectedCity(null);
        setAreas([]);
        setSelectedArea(null);
    }, [selectedState, locationTree]);


    useEffect(() => {
        if (!selectedState || !selectedCity || !locationTree.length) return;

        const stateObj = locationTree.find((s) => s.state === selectedState.value);
        const cityObj = stateObj?.cities.find((c) => c.city === selectedCity.value);

        if (!cityObj) return;

        const areaOptions = cityObj.areas.map((a) => ({
            value: a,
            label: a,
        }));

        setAreas(areaOptions);
    }, [selectedCity, selectedState, locationTree]);

    useEffect(() => {
        if (!locationTree.length || !defaultValues || !defaultValues.state) return;

        const { state, city, area, guests: g, checkIn, checkOut } = defaultValues;

        const foundState = locationTree.find((s) => s.state === state);
        if (foundState) {
            const stObj = {
                value: foundState.state,
                label: STATE_CODE_TO_NAME[foundState.state] || foundState.state,
            };
            setSelectedState(stObj);

            const cityOptions = foundState.cities.map((c) => ({
                value: c.city,
                label: c.city,
            }));
            setCities(cityOptions);

            if (city) {
                const cityObj = { value: city, label: city };
                setSelectedCity(cityObj);

                const foundCity = foundState.cities.find((c) => c.city === city);

                if (foundCity) {
                    const areaOptions = foundCity.areas.map((a) => ({
                        value: a,
                        label: a,
                    }));
                    setAreas(areaOptions);

                    if (area) {
                        setSelectedArea({ value: area, label: area });
                    }
                }
            }
        }

        if (g) setGuests(g);

        if (checkIn && checkOut) {
            setDateRange([
                {
                    startDate: new Date(checkIn),
                    endDate: new Date(checkOut),
                    key: "selection",
                },
            ]);
        }
    }, [defaultValues, locationTree]);


    useEffect(() => {
        const handler = (e) => {
            if (guestRef.current && !guestRef.current.contains(e.target))
                setShowGuestBox(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target))
                setShowCalendar(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);


    const applyFilters = () => {
        onFilter({
            state: selectedState?.value || "",
            city: selectedCity?.value || "",
            area: selectedArea?.value || "",
            checkIn: dateRange[0].startDate,
            checkOut: dateRange[0].endDate,
            guests,
        });
    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: "0px",
            border: state.isFocused ? "1.5px solid #038ba0" : "1px solid #e5e7eb",
            boxShadow: "none",
            paddingLeft: "8px",
            height: "40px",
            cursor: "pointer",
            backgroundColor: "#ededed",
            borderRadius: "8px",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#038ba0"
                : state.isFocused
                    ? "#038ba02d"
                    : "white",
            color: state.isSelected ? "#ffffff" : "#111827",
            cursor: "pointer",
            borderRadius: "8px",
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "6px",             
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: "8px",
        }),
    };



    return (
        <div className="w-full rounded-[15px] bg-white shadow-xl p-[25px] flex flex-wrap items-center justify-between gap-3 relative -mt-10 z-[20] border border-gray-100 overflow-visible">
            {/* State */}
            <div className="flex-1 min-w-[150px] z-10">
                <label className="text-[14px] text-black uppercase ml-1">State</label>
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
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#038ba0",
                            primary25: "#038ba0",
                            primary50: "#038ba0",
                        },
                    })}
                />
            </div>

            {/* City */}
            <div className="flex-1 min-w-[150px]">
                <label className="text-[14px] text-black uppercase ml-1">City</label>
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
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#038ba0",
                            primary25: "#038ba0",
                            primary50: "#038ba0",
                        },
                    })}
                />
            </div>

            {/* Area */}
            <div className="flex-1 min-w-[150px]">
                <label className="text-[14px] text-black uppercase ml-1">Area</label>
                <Select
                    options={areas}
                    placeholder="Select area"
                    value={selectedArea}
                    onChange={setSelectedArea}
                    isDisabled={!selectedCity}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuPlacement="bottom"
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                />
            </div>

            {/* Date Range */}
            <div className="flex-1 min-w-[200px] relative" ref={calendarRef}>
                <label className="text-[14px] text-black uppercase ml-1">Check-in - Check-out</label>
                <div
                    className="flex items-center justify-between border bg-[#ededed] rounded-[8px] border-gray-200 hover:border-primary px-4 py-2 mt-1 cursor-pointer transition-all duration-200"
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
                    <div className="absolute top-[71px] left-0 bg-white rounded-[8px] p-3 shadow-2xl border border-gray-100 z-[999999]">
                        <DateRange
                            ranges={dateRange}
                            onChange={(item) => setDateRange([item.selection])}
                            minDate={new Date()}
                            moveRangeOnFirstSelection={false}
                            showSelectionPreview={false}
                            showDateDisplay={false}
                            months={1}
                            direction="horizontal"
                            rangeColors={["#04929f"]}
                            className="z-10"
                            dayContentRenderer={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const isPast = date < today;
                                const isSelected =
                                    date >= dateRange[0].startDate &&
                                    date <= dateRange[0].endDate;

                                return (
                                    <div
                                        className={`
                flex items-center justify-center w-full h-full
                transition-all duration-150
                ${isPast
                                                ? "bg-[#1297a317] text-gray-400 cursor-not-allowed"
                                                : isSelected
                                                    ? "bg-[#038ba033] text-white font-semibold"
                                                    : "hover:bg-primary hover:text-white cursor-pointer"
                                            }
            `}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            }}
                        />

                    </div>
                )}
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-[180px] relative" ref={guestRef}>
                <label className="text-[14px] text-black uppercase ml-1">Travellers</label>

                <div
                    onClick={() => setShowGuestBox(!showGuestBox)}
                    className="border rounded-[8px] bg-[#ededed] text-sm border-gray-200 hover:border-primary px-4 py-2 mt-1 cursor-pointer flex items-center justify-between"
                >
                    <span>{guests.adults + guests.children} guests</span>
                </div>

                {showGuestBox && (
                    <div className="absolute z-[99999] bg-white shadow-xl border rounded-[8px] p-4 mt-2 w-[260px]">
                        {/* Adults */}
                        <div className="flex justify-between items-center py-2">
                            <div>
                                <p className="font-medium">Adults</p>
                                <p className="text-xs text-gray-500">Age 13+</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                                    onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                                >−</button>

                                <span>{guests.adults}</span>

                                <button
                                    className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                                    onClick={() => setGuests(g => ({ ...g, adults: g.adults + 1 }))}
                                >+</button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex justify-between items-center py-2">
                            <div>
                                <p className="font-medium">Children</p>
                                <p className="text-xs text-gray-500">Ages 2–12</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                                    onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}
                                >−</button>

                                <span>{guests.children}</span>

                                <button
                                    className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                                    onClick={() => setGuests(g => ({ ...g, children: g.children + 1 }))}
                                >+</button>
                            </div>
                        </div>

                    </div>
                )}
            </div>


            {/* Search Button */}
            <button
                onClick={applyFilters}
                className="bg-primary rounded-[8px] text-white px-8 py-2 mt-6 font-semibold transition-all duration-300 shadow-md"
            >
                Search
            </button>
        </div>
    );
}
