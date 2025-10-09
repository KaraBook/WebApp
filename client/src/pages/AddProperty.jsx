import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import { toast } from "sonner";
import SummaryApi from "../common/SummaryApi";
import { getIndianStates, getCitiesByState } from "../utils/locationUtils";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import FullPageLoader from "@/components/FullPageLoader";
import 'react-time-picker/dist/TimePicker.css'
import 'react-clock/dist/Clock.css'
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import SingleSelectButtons from "@/components/SingleSelectButtons";
import MultiSelectButtons from "../components/MultiSelectButtons";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { QuantityBox } from "@/components/QuantityBox";
import { Check } from "lucide-react";
import { propertyTypeOptions, roomTypeOptions, foodOptions, amenitiesOptions, kycVerifiedOptions, formSteps, approvalStatusOptions, featuredOptions, publishNowOptions } from "../constants/dropdownOptions";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";
import TagInput from "@/components/TagInput";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const AddProperty = () => {
    const navigate = useNavigate();
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [shopActFile, setShopActFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [shopActPreview, setShopActPreview] = useState(null);
    const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // NEW: keep the draft id we get after step 7
    const [propertyId, setPropertyId] = useState(null);

    const [formData, setFormData] = useState({
        propertyName: "",
        resortOwner: {
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            resortEmail: "",
            resortMobile: ""
        },
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
        pricingPerNightWeekdays: "",
        pricingPerNightWeekend: "",
        extraGuestCharge: "",
        checkInTime: "",
        checkOutTime: "",
        minStayNights: "",
        foodAvailability: [],
        amenities: [],
        pan: "",
        gstin: "",
        kycVerified: false,
        featured: false,
        approvalStatus: "pending",
        publishNow: false,
        internalNotes: "",
    });

    const nextStep = () => {
        if (currentStep < formSteps.length) setCurrentStep((p) => p + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((p) => p - 1);
    };
    const isStepCompleted = (stepId) => stepId < currentStep;

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

    const buildDraftPayload = () => {
        const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
        const payload = {
            propertyName: formData.propertyName?.trim(),
            resortOwner: {
                ...formData.resortOwner,
                firstName: formData.resortOwner.firstName?.trim(),
                lastName: formData.resortOwner.lastName?.trim(),
                email: formData.resortOwner.email?.trim(),
                mobile: formData.resortOwner.mobile?.trim(),
                resortEmail: formData.resortOwner.resortEmail?.trim(),
                resortMobile: formData.resortOwner.resortMobile?.trim(),
            },
            propertyType: formData.propertyType,
            description: formData.description,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2 || undefined,
            state: formData.state,
            city: formData.city,
            pinCode: formData.pinCode,
            locationLink: formData.locationLink,
            totalRooms: num(formData.totalRooms),
            maxGuests: num(formData.maxGuests),
            roomTypes: formData.roomTypes,
            pricingPerNightWeekdays: num(formData.pricingPerNightWeekdays),
            pricingPerNightWeekend: num(formData.pricingPerNightWeekend),
            extraGuestCharge: num(formData.extraGuestCharge),
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            minStayNights: num(formData.minStayNights),
            foodAvailability: formData.foodAvailability,
            amenities: formData.amenities,
            pan: formData.pan?.toUpperCase().trim(),
            gstin: formData.gstin ? formData.gstin.toUpperCase().trim() : "",
            kycVerified: !!formData.kycVerified,
            publishNow: !!formData.publishNow,
            featured: !!formData.featured,
            approvalStatus: formData.approvalStatus,
            internalNotes: formData.internalNotes,
        };
        return payload;
    };

    const createDraft = async () => {
        if (formData.gstin && !GSTIN_REGEX.test(formData.gstin.toUpperCase())) {
            toast.error("Invalid GSTIN format");
            return;
        }

        setLoading(true);
        try {
            const payload = buildDraftPayload();
            const resp = await Axios.post(SummaryApi.createPropertyDraft.url, payload, {
                headers: { "Content-Type": "application/json" },
            });

            const created = resp?.data?.data || resp?.data;
            if (!created?._id) {
                toast.error("Draft saved but no ID in response");
                return;
            }

            setPropertyId(created._id);
            toast.success("Draft saved. Continue to upload media.");
            setCurrentStep(6);
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to create draft";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const finalizeMedia = async () => {
        if (!propertyId) {
            await createDraft();
            toast.error("Draft not created yet. Please complete previous step.");
            return;
        }
        if (!coverImageFile || !shopActFile || galleryImageFiles.length === 0) {
            toast.error("Please add cover image, shop act and at least 1 gallery photo.");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("publishNow", String(!!formData.publishNow));

            fd.append("coverImage", coverImageFile);
            fd.append("shopAct", shopActFile);
            galleryImageFiles.forEach((file) => fd.append("galleryPhotos", file));

            const { url, method } = SummaryApi.finalizeProperty(propertyId);
            const resp = await Axios({
                url,
                method,
                data: fd,
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Property created successfully!");
            navigate("/admin/properties");
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to upload media";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (currentStep === 5) {
            await createDraft();
        } else {
            nextStep();
        }
    };

    useEffect(() => {
        const allStates = getIndianStates();
        setStates(allStates);
    }, []);

    return (
        <div className="p-3 w-full mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Property</h2>

            {/* Stepper */}
            <TooltipProvider delayDuration={200}>
                <div className="flex items-center space-x-0 overflow-x-auto w-full mt-20 mb-8">
                    <div className="w-[25%] text-xl font-semibold text-black">
                        {formSteps[currentStep - 1].title}
                    </div>
                    {loading && <FullPageLoader />}
                    {formSteps.map((step, index) => {
                        const completed = isStepCompleted(step.id);
                        const isCurrent = currentStep === step.id;
                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCurrentStep(step.id);
                                                    }}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border-2 transition-colors duration-200
                                                           ${completed
                                                            ? "bg-black text-white border-black hover:bg-gray-800"
                                                            : isCurrent
                                                                ? "border-black text-white bg-black hover:bg-gray-800"
                                                                : "border-gray-300 text-gray-400 hover:border-black hover:text-black"
                                                        }`}
                                                >
                                                    {completed ? <Check size={16} /> : step.id}
                                                </button>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">{step.title}</TooltipContent>
                                    </Tooltip>

                                </div>
                                {index !== formSteps.length - 1 && (
                                    <div className="h-0.5 w-[12%] bg-gray-300 mx-2" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </TooltipProvider>


            <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-wrap justify-between gap-4">
                {currentStep === 1 && (
                    <>
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
                            <SingleSelectButtons label="Property Type"
                                options={propertyTypeOptions}
                                selected={formData.propertyType}
                                onChange={(selected) =>
                                    setFormData((prev) => ({ ...prev, propertyType: selected }))
                                }
                            />
                        </div>

                        {/* First Name */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerFirstName" className="text-sm">
                                Resort Owner First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerFirstName" name="resortOwnerFirstName" type="text"
                                className="mt-2"
                                value={formData.resortOwner.firstName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        resortOwner: {
                                            ...prev.resortOwner,
                                            firstName: e.target.value,
                                        },
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerLastName" className="text-sm">
                                Resort Owner Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerLastName" name="resortOwnerLastName" type="text"
                                className="mt-2"
                                value={formData.resortOwner.lastName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        resortOwner: {
                                            ...prev.resortOwner,
                                            lastName: e.target.value,
                                        },
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerEmail" className="text-sm">
                                Resort Owner Email <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerEmail" name="resortOwnerEmail" type="email"
                                className="mt-2"
                                value={formData.resortOwner.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        resortOwner: {
                                            ...prev.resortOwner,
                                            email: e.target.value,
                                        },
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Mobile Number */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerMobile" className="text-sm">
                                Resort Owner Mobile Number <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerMobile" name="resortOwnerMobile" type="tel"
                                className="mt-2"
                                value={formData.resortOwner.mobile}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            resortOwner: {
                                                ...prev.resortOwner,
                                                mobile: value,
                                            },
                                        }));
                                    }
                                }}
                                maxLength={10}
                                required
                            />
                        </div>

                        {/* Resort Email */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerResortEmail" className="text-sm">
                                Resort Email <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerResortEmail" name="resortOwnerResortEmail" type="email"
                                className="mt-2"
                                value={formData.resortOwner.resortEmail}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        resortOwner: {
                                            ...prev.resortOwner,
                                            resortEmail: e.target.value,
                                        },
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Resort Mobile Number */}
                        <div className="w-[48%]">
                            <Label htmlFor="resortOwnerResortMobile" className="text-sm">
                                Resort Mobile Number <span className="text-red-500">*</span>
                            </Label>
                            <Input id="resortOwnerResortMobile" name="resortOwnerResortMobile" type="tel"
                                className="mt-2"
                                value={formData.resortOwner.resortMobile}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            resortOwner: {
                                                ...prev.resortOwner,
                                                resortMobile: value,
                                            },
                                        }));
                                    }
                                }}
                                maxLength={10}
                                required
                            />
                        </div>


                        <div className="w-full">
                            <Label htmlFor="description" className="text-sm">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea id="description" name="description"
                                className="mt-2"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                minLength={30}
                                maxLength={500}
                                required
                            />
                        </div>
                    </>
                )}


                {currentStep === 2 && (
                    <>
                        <div className="w-[48%]">
                            <Label htmlFor="addressLine1" className="text-sm">
                                Address Line 1<span className="text-red-500"> *</span>
                            </Label>
                            <Input id="addressLine1" name="addressLine1" type="text"
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
                            <Input id="addressLine2" name="addressLine2" type="text"
                                className="mt-2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                maxLength={100}
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

                    </>
                )}



                {currentStep === 3 && (
                    <>
                        <div className="w-[32%]">
                            <Label htmlFor="totalRooms" className="text-sm">
                                Total Rooms / Units <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.totalRooms}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, totalRooms: val }))
                                    }
                                    min={1}
                                    max={999}
                                />
                            </div>
                        </div>

                        <div className="w-[32%]">
                            <Label htmlFor="maxGuests" className="text-sm">
                                Max Guests Allowed <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.maxGuests}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, maxGuests: val }))
                                    }
                                    min={1}
                                    max={999}
                                />
                            </div>
                        </div>

                        <div className="w-[32%]">
                            <MultiSelectButtons label="Room Types"
                                options={roomTypeOptions}
                                selected={formData.roomTypes}
                                onChange={(selected) =>
                                    setFormData((prev) => ({ ...prev, roomTypes: selected }))
                                }
                            />
                        </div>

                        <div className="w-[32%]">
                            <Label htmlFor="pricingPerNightWeekdays" className="block font-medium">
                                Price Per Night (Weekdays) (₹) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="pricingPerNightWeekdays" name="pricingPerNightWeekdays" type="text" inputMode="numeric" className="mt-2"
                                value={formData.pricingPerNightWeekdays}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,6}$/.test(value)) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            pricingPerNightWeekdays: value,
                                        }));
                                    }
                                }}
                                required
                            />
                        </div>

                        <div className="w-[32%]">
                            <Label htmlFor="pricingPerNightWeekend" className="block font-medium">
                                Price Per Night (Weekend) (₹) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="pricingPerNightWeekend" name="pricingPerNightWeekend" type="text" inputMode="numeric" className="mt-2"
                                value={formData.pricingPerNightWeekend}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,6}$/.test(value)) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            pricingPerNightWeekend: value,
                                        }));
                                    }
                                }}
                                required
                            />
                        </div>

                        <div className="w-[32%]">
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


                        <CustomTimePicker
                            label="Check-In Time"
                            value={formData.checkInTime}
                            onChange={(val) => setFormData({ ...formData, checkInTime: val })}
                            className="w-full"
                        />

                        <CustomTimePicker
                            label="Check-Out Time"
                            value={formData.checkOutTime}
                            onChange={(val) => setFormData({ ...formData, checkOutTime: val })}
                        />

                        <div className="w-[32%]">
                            <Label htmlFor="minStayNights" className="text-sm">
                                Minimum Stay (Nights) <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.minStayNights}
                                    onChange={(val) =>
                                        setFormData((prev) => ({ ...prev, minStayNights: val }))
                                    }
                                    min={1}
                                    max={999}
                                />
                            </div>
                        </div>



                    </>
                )}


                {currentStep === 4 && (
                    <>
                        <div className="w-[48%]">
                            <MultiSelectButtons label="Food Availability"
                                options={foodOptions}
                                selected={formData.foodAvailability}
                                onChange={(selected) =>
                                    setFormData((prev) => ({ ...prev, foodAvailability: selected }))
                                }
                            />
                        </div>

                        <div className="w-[48%]">
                            <TagInput
                                label="Amenities"
                                values={formData.amenities}
                                onChange={(vals) => setFormData((prev) => ({ ...prev, amenities: vals }))}
                                placeholder="Type and press Enter to add amenities"
                            />
                        </div>
                    </>
                )}


                {currentStep === 5 && (
                    <>
                        <div className="w-[48%]">
                            <Label htmlFor="pan" className="text-sm">
                                Property PAN <span className="text-gray-400 text-xs">(10 characters)</span>
                            </Label>
                            <Input id="pan" name="pan" type="text" maxLength={10}
                                value={formData.pan || ""}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    if (/^[A-Z0-9]*$/.test(value)) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            pan: value,
                                        }));
                                    }
                                }}
                                className="mt-2 uppercase"

                            />
                        </div>


                        <div className="w-[48%]">
                            <SingleSelectDropdown
                                label="KYC Verified"
                                value={formData.kycVerified}
                                options={kycVerifiedOptions}
                                onChange={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        kycVerified: val,
                                    }))
                                }
                                placeholder="Select KYC status"
                            />
                        </div>

                        <div className="w-[48%]">
                            <Label htmlFor="gstin" className="text-sm">
                                GSTIN <span className="text-gray-400 text-xs">(15 characters)</span> <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="gstin"
                                name="gstin"
                                type="text"
                                className="mt-2 uppercase"
                                value={formData.gstin}
                                maxLength={15}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                    if (val.length <= 15) {
                                        setFormData((prev) => ({ ...prev, gstin: val }));
                                    }
                                }}
                                required
                            />
                            {formData.gstin && !GSTIN_REGEX.test(formData.gstin) && (
                                <p className="text-xs text-red-500 mt-1">Please enter a valid GSTIN.</p>
                            )}
                        </div>

                        <div className="w-[48%]">
                            <SingleSelectDropdown
                                label="Approval Status"
                                value={formData.approvalStatus}
                                options={approvalStatusOptions}
                                onChange={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        approvalStatus: val,
                                    }))
                                }
                                placeholder="Select Approval Status"
                            />
                        </div>

                        <div className="w-[48%]">
                            <SingleSelectDropdown
                                label="Featured Property"
                                value={formData.featured}
                                options={featuredOptions}
                                onChange={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        featured: val,
                                    }))
                                }
                                placeholder="Select Featured Status"
                            />
                        </div>

                        <div className="w-[48%]">
                            <Label htmlFor="internaNotes" className="text-sm">
                                Internal Notes <span className="text-red-500">*</span>
                            </Label>
                            <Textarea id="internalNotes" name="internalNotes"
                                className="mt-2"
                                rows={4}
                                value={formData.internalNotes}
                                onChange={handleChange}
                                minLength={3}
                                maxLength={500}
                                required
                            />
                        </div>
                    </>
                )}

                {currentStep === 6 && (
                    <>
                        <div className="w-[48%] -mt-2">
                            <FileUploadsSection
                                setShopActFile={setShopActFile}
                                shopActFile={shopActFile}
                                shopActPreview={shopActPreview}
                                setShopActPreview={setShopActPreview}
                                showFields={{ coverImage: false, galleryPhotos: false, shopAct: true }}
                            />
                        </div>

                        <div className="w-[32%]">
                            <SingleSelectDropdown
                                label="Publish Now"
                                value={formData.publishNow}
                                options={publishNowOptions}
                                onChange={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        publishNow: val,
                                    }))
                                }
                                placeholder="Select Publish Status"
                            />
                        </div>

                        <FileUploadsSection
                            // cover
                            setCoverImageFile={setCoverImageFile}
                            coverImageFile={coverImageFile}
                            coverImagePreview={coverImagePreview}
                            setCoverImagePreview={setCoverImagePreview}

                            // gallery
                            setGalleryImageFiles={setGalleryImageFiles}
                            galleryImageFiles={galleryImageFiles}
                            galleryImagePreviews={galleryImagePreviews}
                            setGalleryImagePreviews={setGalleryImagePreviews}

                            showFields={{ coverImage: true, galleryPhotos: true, shopAct: false }}
                        />


                    </>
                )}

                <div className="w-full border mt-6"></div>
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 border rounded-md bg-gray-200 text-black hover:bg-gray-300"
                    >
                        Back
                    </button>
                )}

                {currentStep < formSteps.length ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="ml-auto px-4 py-2 border rounded-md bg-black text-white hover:bg-gray-900"
                    >
                        {currentStep === 5 ? "Save & Continue" : "Next"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={async () => {
                            if (!propertyId) {
                                await createDraft();
                            }
                            finalizeMedia();
                        }}
                        className="ml-auto px-4 py-2 border rounded-md bg-black text-white hover:bg-gray-900"
                    >
                        Submit
                    </button>

                )}
            </form>
        </div>
    );
};

export default AddProperty;
