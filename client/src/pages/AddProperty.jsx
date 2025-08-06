// src/pages/AddProperty.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import { successToast, errorToast } from "../utils/toastHelper";
import SummaryApi from "../common/SummaryApi";
import { getIndianStates, getCitiesByState } from "../utils/locationUtils";
import FileUploadsSection from "../components/FileUploadsSection";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import CustomTimePicker from "../components/CustomTimePicker";
import StatusToggle from "../components/StatusToggle";
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import {
    propertyTypeOptions,
    roomTypeOptions,
    foodOptions,
    amenitiesOptions,
    confirmationTypeOptions,
    approvalStatusOptions,
    kycVerifiedOptions,
    publishNowOptions,
} from "../constants/dropdownOptions";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "../components/ui/select";
import { Button } from "../components/ui/button";

const AddProperty = () => {
    const navigate = useNavigate();
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isPublished, setIsPublished] = useState(true);

    const [formData, setFormData] = useState({
        propertyName: "",
        resortOwner: { name: "", contact: "" },
        propertyType: "",
        description: "",
        addressLine1: "",
        addressLine2: "",
        state: "",
        city: "",
        pinCode: "",
        locationLink: "",
        totalRooms: "",
        maxGuests: "",
        roomTypes: [],
        pricingPerNight: "",
        extraGuestCharge: "",
        checkInTime: "",
        checkOutTime: "",
        confirmationType: "",
        minStayNights: "",
        foodAvailability: [],
        amenities: [],
        nearbyAttractions: "",
        gstin: "",
        pan: "",
        kycVerified: false,
        approvalStatus: "pending",
        publishNow: false,
        internalNotes: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "state") {
            const stateCode = value;
            const selectedCities = getCitiesByState(stateCode);
            setCities(selectedCities);
            setFormData((prev) => ({
                ...prev,
                state: value,
                city: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((v) => data.append(`${key}[]`, v));
                } else if (typeof value === "object" && value !== null) {
                    data.append(key, JSON.stringify(value));
                } else {
                    data.append(key, value);
                }
            });

            if (coverImageFile) {
                data.append("coverImage", coverImageFile);
            }

            if (galleryImageFiles.length > 0) {
                galleryImageFiles.forEach((file) => data.append("galleryPhotos", file));
            }

            const response = await Axios.post(SummaryApi.addProperty.url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Response:", response.data);

            successToast("Property added successfully");
            navigate("/admin/properties");
        } catch (error) {
            errorToast(error.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        const allStates = getIndianStates();
        setStates(allStates);
    }, []);

    return (
        <div className="p-3 w-full mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Property</h2>
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-wrap justify-between gap-4"
            >
                <div className="w-[48%]">
                    <Label htmlFor="propertyName">
                        Property Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="propertyName"
                        name="propertyName"
                        className="mt-2"
                        value={formData.propertyName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                        onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, propertyType: val }))
                        }
                        defaultValue={formData.propertyType}
                    >
                        <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                            {propertyTypeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>


                <div className="w-[48%]">
                    <Label htmlFor="resortOwnerName" className="text-sm">
                        Resort Owner Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="resortOwnerName"
                        name="resortOwnerName"
                        type="text"
                        className="mt-2"
                        value={formData.resortOwner.name}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                resortOwner: {
                                    ...prev.resortOwner,
                                    name: e.target.value,
                                },
                            }))
                        }
                        required
                    />
                </div>


                <div className="w-[48%]">
                    <Label htmlFor="resortOwnerContact" className="text-sm">
                        Resort Owner Contact No<span className="text-red-500"> *</span>
                    </Label>
                    <Input
                        id="resortOwnerContact"
                        name="resortOwnerContact"
                        type="tel"
                        className="mt-2"
                        value={formData.resortOwner.contact}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    resortOwner: {
                                        ...prev.resortOwner,
                                        contact: value,
                                    },
                                }));
                            }
                        }}
                        maxLength={10}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="addressLine1" className="text-sm">
                        Address Line 1<span className="text-red-500"> *</span>
                    </Label>
                    <Input
                        id="addressLine1"
                        name="addressLine1"
                        type="text"
                        className="mt-2"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="addressLine2" className="text-sm">
                        Address Line 2
                    </Label>
                    <Input
                        id="addressLine2"
                        name="addressLine2"
                        type="text"
                        className="mt-2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        maxLength={100}
                    />
                </div>

                <div className="w-full">
                    <Label htmlFor="description" className="text-sm">
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        className="mt-2"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        minLength={30}
                        maxLength={500}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="state" className="text-sm">
                        State <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.state}
                        onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, state: value, city: "" }));
                            const selectedCities = getCitiesByState(value);
                            setCities(selectedCities);
                        }}
                        required
                    >
                        <SelectTrigger id="state" className="mt-2">
                            <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                            {states.map((state) => (
                                <SelectItem key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* City Dropdown using shadcn/ui */}
                <div className="w-[48%]">
                    <label className="block font-small mb-1">
                        City <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.city}
                        onValueChange={(value) => handleChange({ target: { name: "city", value } })}
                    >
                        <SelectTrigger className="w-full border p-2 rounded mt-1">
                            <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city.name} value={city.name}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="pinCode" className="text-sm">
                        Pin Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="pinCode" type="text" name="pinCode" maxLength={6} className="mt-2"
                        value={formData.pinCode}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,6}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    pinCode: value,
                                }));
                            }
                        }}
                        required
                    />
                </div>


                <div className="w-[48%]">
                    <Label htmlFor="locationLink" className="text-sm">
                        Google Maps Location Link <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="locationLink" type="url" name="locationLink" className="mt-2"
                        value={formData.locationLink}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                                ...prev,
                                locationLink: value,
                            }));
                        }}
                        pattern="https://.*"
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="totalRooms" className="text-sm">
                        Total Rooms / Units <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="totalRooms" type="text" name="totalRooms" className="mt-2"
                        value={formData.totalRooms}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,3}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    totalRooms: value,
                                }));
                            }
                        }}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="maxGuests" className="text-sm">
                        Max Guests Allowed <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="maxGuests" type="text" name="maxGuests" className="mt-2"
                        value={formData.maxGuests}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,3}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    maxGuests: value,
                                }));
                            }
                        }}
                        required
                    />
                </div>

                <FileUploadsSection
                    setCoverImageFile={setCoverImageFile}
                    setGalleryImageFiles={setGalleryImageFiles}
                />

                <div className="w-[32%]">
                    <MultiSelectDropdown
                        label="Room Types"
                        options={roomTypeOptions}
                        selected={formData.roomTypes}
                        onChange={(val) => setFormData((prev) => ({ ...prev, roomTypes: val }))}
                    />
                </div>

                <div className="w-[32%]">
                    <MultiSelectDropdown
                        label="Food Availability"
                        options={foodOptions}
                        selected={formData.foodAvailability}
                        onChange={(val) => setFormData((prev) => ({ ...prev, foodAvailability: val }))}
                    />
                </div>

                <div className="w-[32%]">
                    <MultiSelectDropdown
                        label="Amenities"
                        options={amenitiesOptions}
                        selected={formData.amenities}
                        onChange={(val) => setFormData((prev) => ({ ...prev, amenities: val }))}
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="pricingPerNight" className="block font-medium">
                        Price Per Night (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="pricingPerNight" name="pricingPerNight" type="text" inputMode="numeric" className="mt-2"
                        value={formData.pricingPerNight}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,6}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    pricingPerNight: value,
                                }));
                            }
                        }}
                        required
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="extraGuestCharge" className="block font-medium">
                        Extra Guest Charge (₹)
                    </Label>
                    <Input
                        id="extraGuestCharge" name="extraGuestCharge" type="text" inputMode="numeric" className="mt-2"
                        value={formData.extraGuestCharge}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,4}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    extraGuestCharge: value,
                                }));
                            }
                        }}
                    />
                </div>

                <div className="w-[48%]">
                    <Label htmlFor="minStayNights" className="block font-medium">
                        Minimum Stay (Nights) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="minStayNights" name="minStayNights" type="text" inputMode="numeric" className="mt-2"
                        value={formData.minStayNights}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Allow only digits and max 3 digits
                            if (/^\d{0,3}$/.test(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    minStayNights: value,
                                }));
                            }
                        }}
                        required
                    />
                </div>

                <CustomTimePicker
                    label="Check-In Time"
                    value={formData.checkInTime}
                    onChange={(val) => setFormData({ ...formData, checkInTime: val })}
                />

                <CustomTimePicker
                    label="Check-Out Time"
                    value={formData.checkOutTime}
                    onChange={(val) => setFormData({ ...formData, checkOutTime: val })}
                />

                <div className="w-[48%]">
                    <StatusToggle
                        label="Featured"
                        checked={isFeatured}
                        onChange={setIsFeatured}
                        tooltipText={isFeatured ? "Mark as Unfeatured" : "Mark as Featured"}
                    />

                </div>

                <div className="w-[48%]">
                    <StatusToggle
                        label="Published"
                        checked={isPublished}
                        onChange={setIsPublished}
                        tooltipText={isPublished ? "Unpublish this property" : "Publish this property"}
                    />
                </div>









                {/* Add other form fields similarly using shadcn/ui components */}

                <div className="w-full mt-6">
                    <Button type="submit">Submit Property</Button>
                </div>
            </form>
        </div>
    );
};

export default AddProperty;
