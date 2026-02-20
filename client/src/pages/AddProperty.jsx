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
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { propertyTypeOptions, foodOptions, amenitiesCategories, kycVerifiedOptions, formSteps, approvalStatusOptions, featuredOptions, publishNowOptions } from "../constants/dropdownOptions";
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
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [shopActPreview, setShopActPreview] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);
    const [newGalleryFiles, setNewGalleryFiles] = useState([]);
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
    const [errors, setErrors] = useState({});

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [propertyId, setPropertyId] = useState(null);

    const refundableOptions = [
        { label: "Yes", value: true },
        { label: "No", value: false },
    ];

    const [formData, setFormData] = useState({
        propertyName: "",
        resortOwner: {
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            resortEmail: "",
            resortMobile: "",
            password: ""
        },
        propertyType: "",
        description: "",
        addressLine1: "",
        area: "",
        addressLine2: "",
        state: "",
        city: "",
        pinCode: "",
        locationLink: "",
        roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, hall: 0, total: 0 },
        bedrooms: 0,
        bathrooms: 0,
        maxGuests: "",
        pricingPerNightWeekdays: "",
        pricingPerNightWeekend: "",
        baseGuests: "",
        extraAdultCharge: "",
        extraChildCharge: "",
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
        isRefundable: false,
        refundNotes: "",
        cancellationPolicy: []
    });

    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };

    const clearFieldError = (field) => {
        setErrors(prev => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    const validateStep = (stepToValidate = currentStep) => {
        const e = {};

        if (stepToValidate === 1) {

            if (!formData.propertyName || formData.propertyName.trim().length < 10)
                e.propertyName = "Property name must be at least 10 characters";
            if (!formData.propertyType)
                e.propertyType = "Please select property type";
            if (!formData.resortOwner.firstName)
                e.firstName = "Owner first name is required";
            if (!formData.resortOwner.lastName)
                e.lastName = "Owner last name is required";
            if (!/^[6-9]\d{9}$/.test(formData.resortOwner.mobile))
                e.mobile = "Enter valid 10 digit Indian mobile number";
            if (!/\S+@\S+\.\S+/.test(formData.resortOwner.email))
                e.email = "Enter valid email address";
            if (!formData.resortOwner.password || formData.resortOwner.password.length < 6)
                e.password = "Password must be at least 6 characters";
            if (!formData.description || formData.description.length < 30)
                e.description = "Description must be minimum 30 characters";
        }

        if (stepToValidate === 2) {
            if (!formData.addressLine1)
                e.addressLine1 = "Address is required";
            if (!formData.area || formData.area.trim().length === 0)
                e.area = "Area is required";
            if (!formData.state)
                e.state = "Select state";
            if (!formData.city)
                e.city = "Select city";
            if (!/^\d{6}$/.test(formData.pinCode))
                e.pinCode = "Enter valid 6 digit pincode";
            if (!/(google\.com|goo\.gl)/i.test(formData.locationLink || ""))
                e.locationLink = "Paste valid Google Maps link";
        }

        if (stepToValidate === 3) {
            if (!formData.minStayNights || Number(formData.minStayNights) < 1)
                e.minStayNights = "Minimum stay is required";
            if (!formData.bedrooms || Number(formData.bedrooms) < 1)
                e.bedrooms = "Bedrooms required";
            if (!formData.bathrooms || Number(formData.bathrooms) < 1)
                e.bathrooms = "Bathrooms required";
            if (!formData.maxGuests || Number(formData.maxGuests) < 1)
                e.maxGuests = "Enter max guests";
            if (!formData.baseGuests || Number(formData.baseGuests) < 1)
                e.baseGuests = "Enter base guests";
            if (Number(formData.baseGuests) > Number(formData.maxGuests))
                e.baseGuests = "Base guests cannot exceed max guests";
            if (!formData.pricingPerNightWeekdays)
                e.weekdayPrice = "Enter weekday price";
            if (!formData.pricingPerNightWeekend)
                e.weekendPrice = "Enter weekend price";
            if (!formData.checkInTime)
                e.checkIn = "Check-in time required";
            if (!formData.checkOutTime)
                e.checkOut = "Check-out time required";
            if (formData.isRefundable && !formData.refundNotes)
                e.refundNotes = "Refund policy required for refundable property";
        }
        if (stepToValidate === 4) {
            if (!formData.foodAvailability || formData.foodAvailability.length === 0) {
                e.foodAvailability = "Please select at least one food option";
            }
        }
        if (stepToValidate === 6) {
            const totalGalleryCount =
                (existingGallery?.length || 0) + (newGalleryFiles?.length || 0);
            if (!coverImageFile && !coverImagePreview) {
                e.coverImage = "Cover image is required";
            }
            if (totalGalleryCount < 3) {
                e.galleryPhotos = "Minimum 3 gallery images required";
            }
            if (totalGalleryCount > 10) {
                e.galleryPhotos = "Maximum 10 gallery images allowed";
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => {
        if (currentStep < formSteps.length) setCurrentStep((p) => p + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((p) => p - 1);
    };
    const isStepCompleted = (stepId) => stepId < currentStep;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };
            if (name === "state") {
                const selectedCities = getCitiesByState(value);
                setCities(selectedCities);
                updated.city = "";
            }
            return updated;
        });
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
                password: formData.resortOwner.password
            },
            propertyType: formData.propertyType,
            description: formData.description?.slice(0, 1000),
            addressLine1: formData.addressLine1,
            area: formData.area,
            addressLine2: formData.addressLine2 || undefined,
            state: formData.state,
            city: formData.city,
            pinCode: formData.pinCode,
            locationLink: formData.locationLink,
            roomBreakdown: {
                ac: Number(formData.roomBreakdown.ac || 0),
                nonAc: Number(formData.roomBreakdown.nonAc || 0),
                deluxe: Number(formData.roomBreakdown.deluxe || 0),
                luxury: Number(formData.roomBreakdown.luxury || 0),
                hall: Number(formData.roomBreakdown.hall || 0),
                total:
                    Number(formData.roomBreakdown.ac || 0) +
                    Number(formData.roomBreakdown.nonAc || 0) +
                    Number(formData.roomBreakdown.deluxe || 0) +
                    Number(formData.roomBreakdown.luxury || 0) +
                    Number(formData.roomBreakdown.hall || 0),
            },
            totalRooms:
                Number(formData.roomBreakdown.ac || 0) +
                Number(formData.roomBreakdown.nonAc || 0) +
                Number(formData.roomBreakdown.deluxe || 0) +
                Number(formData.roomBreakdown.luxury || 0) +
                Number(formData.roomBreakdown.hall || 0),
            bedrooms: num(formData.bedrooms),
            bathrooms: num(formData.bathrooms),
            maxGuests: num(formData.maxGuests),
            pricingPerNightWeekdays: num(formData.pricingPerNightWeekdays),
            pricingPerNightWeekend: num(formData.pricingPerNightWeekend),
            baseGuests: num(formData.baseGuests),
            extraAdultCharge: num(formData.extraAdultCharge),
            extraChildCharge: num(formData.extraChildCharge),
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            minStayNights: num(formData.minStayNights),
            foodAvailability: formData.foodAvailability,
            amenities: formData.amenities,
            pan: formData.pan?.trim() ? formData.pan.toUpperCase().trim() : undefined,
            gstin: formData.gstin?.trim() ? formData.gstin.toUpperCase().trim() : undefined,
            kycVerified: !!formData.kycVerified,
            publishNow: !!formData.publishNow,
            featured: !!formData.featured,
            approvalStatus: formData.approvalStatus,
            internalNotes: formData.internalNotes,
            isRefundable: !!formData.isRefundable,
            refundNotes: formData.isRefundable ? formData.refundNotes?.trim() : "",
            cancellationPolicy: formData.isRefundable
                ? formData.cancellationPolicy
                    .filter(r =>
                        r &&
                        r.minDaysBefore !== "" &&
                        r.refundPercent !== "" &&
                        !isNaN(r.minDaysBefore) &&
                        !isNaN(r.refundPercent)
                    )
                    .map(r => ({
                        minDaysBefore: Number(r.minDaysBefore),
                        refundPercent: Number(r.refundPercent),
                    }))
                : [],
        };
        if (!payload.gstin) delete payload.gstin;
        if (!payload.pan) delete payload.pan;
        return payload;
    };


    const createDraft = async () => {

        if (formData.isRefundable) {
            const isInvalid = formData.cancellationPolicy.some(r => {
                return (
                    r == null ||
                    r.minDaysBefore === "" ||
                    r.refundPercent === "" ||
                    isNaN(Number(r.minDaysBefore)) ||
                    isNaN(Number(r.refundPercent))
                );
            });

            if (isInvalid || formData.cancellationPolicy.length === 0) {
                toast.error("Please complete cancellation rules");
                return;
            }
        }

        if (formData.gstin?.trim().length > 0 &&
            !GSTIN_REGEX.test(formData.gstin.toUpperCase())
        ) {
            toast.error("Invalid GSTIN format");
            return;
        }
        setLoading(true);

        try {
            const payload = buildDraftPayload();
            const resp = await Axios.post(
                SummaryApi.createPropertyDraft.url,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            const created = resp?.data?.data || resp?.data;

            if (!created?._id) {
                toast.error("Draft saved but no ID in response");
                return;
            }

            setPropertyId(created._id);
            toast.success("Draft saved. Continue to upload media.");
            setCurrentStep(6);

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create draft");
        } finally {
            setLoading(false);
        }
    };


    const finalizeMedia = async () => {
        if (!propertyId) {
            await createDraft();
            return;
        }
        const totalGalleryCount =
            (existingGallery?.length || 0) + (newGalleryFiles?.length || 0);
        const valid = validateStep(6);
        if (!valid) {
            toast.error("Please fix media upload errors");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();

            fd.append("publishNow", String(!!formData.publishNow));
            fd.append("existingGallery", JSON.stringify(existingGallery));

            if (coverImageFile) fd.append("coverImage", coverImageFile);
            if (shopActFile) fd.append("shopAct", shopActFile); // ✅ optional

            newGalleryFiles.forEach((file) => {
                fd.append("galleryPhotos", file);
            });

            const { url, method } = SummaryApi.finalizeProperty(propertyId);

            await Axios({
                url,
                method,
                data: fd,
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Property created successfully!");
            navigate("/properties");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while uploading media";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        const valid = validateStep();
        if (!valid) {
            toast.error("Please correct the highlighted fields");

            setTimeout(() => {
                const el = document.querySelector(".border-red-500");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);

            return;
        }
        if (currentStep === 5) {
            for (let i = 1; i <= 3; i++) {
                const ok = validateStep(i);
                if (!ok) {
                    setCurrentStep(i);
                    toast.error("Please complete all previous steps");
                    return;
                }
            }

            await createDraft();
        }
        else {
            nextStep();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const allStates = getIndianStates();
        setStates(allStates);
    }, []);

    const fieldClass = (field) =>
        errors[field]
            ? "mt-2 border-red-500 focus-visible:ring-red-500"
            : "mt-2";

    const DESCRIPTION_LIMIT = 1000;
    const descriptionLength = formData.description?.length || 0;
    const remainingChars = DESCRIPTION_LIMIT - descriptionLength;

    return (
        <div className="md:p-3 p-0 w-full mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Property</h2>

            {/* Stepper */}
            <TooltipProvider delayDuration={200}>
                <div className="flex flex-row flex-wrap items-center md:flex-nowrap md:flex-row md:items-start md:items-center space-x-0 overflow-x-auto w-full mt-[30px] md:mt-20 mb-8">
                    <div className="md:w-[25%] mb-4 w-[100%] text-xl font-semibold text-black">
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

                                                        if (step.id <= currentStep) {
                                                            setCurrentStep(step.id);
                                                            return;
                                                        }
                                                        for (let i = 1; i < step.id; i++) {
                                                            const ok = validateStep(i);
                                                            if (!ok) {
                                                                setCurrentStep(i);
                                                                toast.error("Please complete previous steps first");
                                                                return;
                                                            }
                                                        }
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
                                    <div className="h-0.5 w-[8%] md:w-[12%] bg-gray-300 mx-2" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </TooltipProvider>


            <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-wrap justify-between md:gap-5 gap-3">
                {currentStep === 1 && (
                    <>
                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="propertyName">
                                Property Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="propertyName"
                                name="propertyName"
                                className={fieldClass("propertyName")}
                                value={formData.propertyName}
                                onChange={(e) => {
                                    handleChange(e);
                                    clearFieldError("propertyName");
                                }}
                            />

                            {errors.propertyName && (
                                <p className="text-red-500 text-xs mt-1">{errors.propertyName}</p>
                            )}
                        </div>

                        <div className="md:w-[48%] w-[100%]">
                            <SingleSelectButtons
                                label={
                                    <>
                                        Property Type <span className="text-red-500">*</span>
                                    </>
                                }
                                options={propertyTypeOptions}
                                selected={formData.propertyType}
                                onChange={(selected) => {
                                    setFormData((prev) => ({ ...prev, propertyType: selected }));
                                    clearFieldError("propertyType");
                                }}
                            />

                            {errors.propertyType && (
                                <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>
                            )}
                        </div>

                        {/* First Name */}
                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="resortOwnerFirstName" className="text-sm">
                                Resort Owner First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className={fieldClass("firstName")}
                                value={formData.resortOwner.firstName}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        resortOwner: { ...prev.resortOwner, firstName: e.target.value }
                                    }));
                                    clearFieldError("firstName");
                                }}
                            />

                            {errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="resortOwnerLastName" className="text-sm">
                                Resort Owner Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className={fieldClass("lastName")}
                                value={formData.resortOwner.lastName}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        resortOwner: { ...prev.resortOwner, lastName: e.target.value }
                                    }));
                                    clearFieldError("lastName");
                                }}
                            />

                            {errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="resortOwnerEmail" className="text-sm">
                                Resort Owner Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className={fieldClass("email")}
                                value={formData.resortOwner.email}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        resortOwner: { ...prev.resortOwner, email: e.target.value }
                                    }));
                                    clearFieldError("email");
                                }}
                            />

                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="md:w-[48%] w-[100%] flex justify-between ">

                            <div className="md:w-[48%] w-[100%] relative">
                                <Label className="text-sm">
                                    Owner Password <span className="text-red-500">*</span>
                                </Label>

                                <Input
                                    type={showPassword ? "text" : "password"}
                                    className={fieldClass("password")}
                                    value={formData.resortOwner.password}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            resortOwner: { ...prev.resortOwner, password: e.target.value }
                                        }));
                                        clearFieldError("password");
                                    }}
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-500 hover:text-black"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>


                            {/* Mobile Number */}
                            <div className="md:w-[48%] w-[100%]">
                                <Label htmlFor="resortOwnerMobile" className="text-sm">
                                    Resort Owner Mobile Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    className={fieldClass("mobile")}
                                    value={formData.resortOwner.mobile}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d*$/.test(v)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                resortOwner: { ...prev.resortOwner, mobile: v }
                                            }));
                                            clearFieldError("mobile");
                                        }
                                    }}
                                />

                                {errors.mobile && (
                                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                                )}
                            </div>
                        </div>

                        {/* Resort Email */}
                        <div className="md:w-[48%] w-[100%]">
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
                        <div className="md:w-[48%] w-[100%]">
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

                            <Textarea
                                id="description"
                                name="description"
                                rows={5}
                                className={`mt-2 resize-none ${descriptionLength >= DESCRIPTION_LIMIT
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                    }`}
                                value={formData.description}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value.length > DESCRIPTION_LIMIT) {
                                        return;
                                    }

                                    setFormData((prev) => ({
                                        ...prev,
                                        description: value,
                                    }));

                                    if (value.length >= 30) clearFieldError("description");
                                }}
                                placeholder="Minimum 30 characters. Provide full property details..."
                                required
                            />

                            {/* CHARACTER COUNTER */}
                            <div className="flex justify-between items-center mt-1">
                                <p
                                    className={`text-xs ${descriptionLength < 30
                                        ? "text-orange-500"
                                        : descriptionLength >= DESCRIPTION_LIMIT
                                            ? "text-red-500 font-semibold"
                                            : "text-gray-500"
                                        }`}
                                >
                                    {descriptionLength < 30
                                        ? `Minimum ${30 - descriptionLength} more characters required`
                                        : descriptionLength >= DESCRIPTION_LIMIT
                                            ? "Maximum character limit reached"
                                            : `${remainingChars} characters remaining`}
                                </p>

                                <span className="text-xs text-gray-400">
                                    {descriptionLength} / {DESCRIPTION_LIMIT}
                                </span>
                            </div>
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                    </>
                )}


                {currentStep === 2 && (
                    <>
                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="addressLine1" className="text-sm">
                                Address Line 1<span className="text-red-500"> *</span>
                            </Label>
                            <Input
                                id="addressLine1"
                                name="addressLine1"
                                type="text"
                                className={fieldClass("addressLine1")}
                                value={formData.addressLine1}
                                onChange={(e) => {
                                    handleChange(e);
                                    clearFieldError("addressLine1");
                                }}
                            />
                            {errors.addressLine1 && (
                                <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                            )}
                        </div>

                        <div className="md:w-[48%] w-[100%]">
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

                        <div className="md:w-[32%] w-[48%]">
                            <Label htmlFor="state" className="text-sm">
                                State <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.state}
                                onValueChange={(value) => {
                                    setFormData((prev) => ({ ...prev, state: value, city: "" }));
                                    clearFieldError("state");
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

                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>


                        <div className="md:w-[32%] w-[48%]">
                            <Label htmlFor="city" className="text-sm">
                                City <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.city}
                                onValueChange={(value) => {
                                    handleChange({ target: { name: "city", value } });
                                    clearFieldError("city");
                                }}
                            >
                                <SelectTrigger className="w-full border p-2 rounded mt-2">
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
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>


                        <div className="md:w-[32%] w-[48%]">
                            <Label htmlFor="area" className="text-sm">
                                Area <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="area"
                                name="area"
                                type="text"
                                className={fieldClass("area")}
                                value={formData.area}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({
                                        ...prev,
                                        area: value,
                                    }));
                                    clearFieldError("area");
                                }}
                            />

                            {errors.area && (
                                <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                            )}
                        </div>


                        <div className="w-[48%]">
                            <Label htmlFor="pinCode" className="text-sm">
                                Pin Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="pinCode" type="text" name="pinCode" maxLength={6} className={fieldClass("pinCode")}
                                value={formData.pinCode}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,6}$/.test(value)) {
                                        setFormData((prev) => ({ ...prev, pinCode: value }));
                                        clearFieldError("pinCode");
                                    }
                                }}
                                required
                            />
                            {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                        </div>

                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="locationLink" className="text-sm">
                                Google Maps Location Link <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="locationLink" type="url" name="locationLink" className="mt-2"
                                value={formData.locationLink}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({ ...prev, locationLink: value }));
                                    clearFieldError("locationLink");
                                }}
                                pattern="https://.*"
                                required
                            />
                            {errors.locationLink && (
                                <p className="text-red-500 text-xs mt-1">{errors.locationLink}</p>
                            )}
                        </div>

                    </>
                )}



                {currentStep === 3 && (
                    <>
                        <div className="w-full">
                            <Label className="text-sm font-semibold">Total Rooms / Units</Label>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                {["ac", "nonAc", "deluxe", "luxury", "hall"].map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="px-3 py-2 bg-black text-white rounded-md text-sm capitalize">
                                            {key === "nonAc" ? "Non AC" : key}
                                        </span>
                                        <QuantityBox
                                            value={formData.roomBreakdown[key]}
                                            onChange={(val) => {
                                                setFormData((prev) => {
                                                    const updated = {
                                                        ...prev,
                                                        roomBreakdown: {
                                                            ...prev.roomBreakdown,
                                                            [key]: val,
                                                        },
                                                    };
                                                    const { ac, nonAc, deluxe, luxury, hall } = updated.roomBreakdown;
                                                    updated.roomBreakdown.total =
                                                        Number(ac) + Number(nonAc) + Number(deluxe) + Number(luxury) + Number(updated.roomBreakdown.hall || 0);
                                                    return updated;
                                                });
                                            }}
                                            min={0}
                                            max={999}
                                        />
                                    </div>
                                ))}

                                <div className="flex items-center gap-2 md:ml-0 ml-0">
                                    <span className="px-3 py-2 bg-black text-white rounded-md text-sm">
                                        Total
                                    </span>
                                    <input
                                        readOnly
                                        className="w-16 text-center border rounded-md py-[5px]"
                                        value={formData.roomBreakdown.total}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="md:w-[16%] w-[48%]">
                            <Label htmlFor="minStayNights" className="text-sm">
                                Minimum Stay (Nights) <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.minStayNights}
                                    onChange={(val) => {
                                        setFormData((prev) => ({ ...prev, minStayNights: val }));
                                        clearFieldError("minStayNights");
                                    }}
                                    min={1}
                                    max={999}
                                />
                                {errors.minStayNights && (
                                    <p className="text-red-500 text-xs mt-1">{errors.minStayNights}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:w-[16%] w-[48%]">
                            <Label htmlFor="bedrooms" className="text-sm">
                                Bedrooms <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.bedrooms}
                                    onChange={(val) => {
                                        setFormData((prev) => ({ ...prev, bedrooms: val }));
                                        clearFieldError("bedrooms");
                                    }}
                                    min={1}
                                    max={999}
                                />
                                {errors.bedrooms && (
                                    <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:w-[16%] w-[48%]">
                            <Label htmlFor="bathrooms" className="text-sm">
                                Bathrooms <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.bathrooms}
                                    onChange={(val) => {
                                        setFormData((prev) => ({ ...prev, bathrooms: val }));
                                        clearFieldError("bathrooms");
                                    }}
                                    min={1}
                                    max={999}
                                />
                                {errors.bathrooms && (
                                    <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:w-[15%] w-[48%]">
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
                                {errors.maxGuests && <p className="text-red-500 text-xs mt-1">{errors.maxGuests}</p>}
                            </div>
                        </div>

                        <div className="md:w-[15%] w-[48%]">
                            <Label className="text-sm">
                                Base Guests <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <QuantityBox
                                    value={formData.baseGuests}
                                    onChange={(val) => {
                                        setFormData((prev) => ({ ...prev, baseGuests: val }));
                                        clearFieldError("baseGuests");
                                    }}
                                    min={1}
                                    max={formData.maxGuests || 999}
                                />
                                {errors.baseGuests && (
                                    <p className="text-red-500 text-xs mt-1">{errors.baseGuests}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:w-[22%] w-[100%]">
                            <Label htmlFor="pricingPerNightWeekdays" className="block font-medium mt-2">
                                Price Per Night (Weekdays) (₹) <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
                                <Input
                                    id="pricingPerNightWeekdays" name="pricingPerNightWeekdays" type="text" inputMode="numeric"
                                    className={fieldClass("weekdayPrice")}
                                    value={formData.pricingPerNightWeekdays}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,6}$/.test(value)) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                pricingPerNightWeekdays: value,
                                            }));
                                            clearFieldError("weekdayPrice");
                                        }
                                    }}
                                    required
                                />
                                {errors.weekdayPrice && <p className="text-red-500 text-xs mt-1">{errors.weekdayPrice}</p>}
                            </div>
                        </div>


                        <div className="md:w-[22%] w-[100%]">
                            <Label htmlFor="pricingPerNightWeekend" className="block font-medium mt-2">
                                Price Per Night (Weekend) (₹) <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
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
                                            clearFieldError("weekendPrice");
                                        }
                                    }}
                                    required
                                />
                                {errors.weekendPrice && <p className="text-red-500 text-xs mt-1">{errors.weekendPrice}</p>}
                            </div>
                        </div>

                        <div className="md:w-[22%] w-[100%]">
                            <Label className="text-sm">
                                Extra Adult Charge (₹ / night)
                            </Label>
                            <div className="mt-2">
                                <Input
                                    value={formData.extraAdultCharge}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d{0,5}$/.test(v)) {
                                            setFormData((p) => ({ ...p, extraAdultCharge: v }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="md:w-[22%] w-[100%]">
                            <Label className="text-sm">
                                Extra Child Charge (₹ / night)
                            </Label>
                            <div className="mt-2">
                                <Input
                                    value={formData.extraChildCharge}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d{0,5}$/.test(v)) {
                                            setFormData((p) => ({ ...p, extraChildCharge: v }));
                                        }
                                    }}
                                />
                            </div>
                        </div>


                        <div className="md:w-[48%] w-[100%]">
                            <CustomTimePicker
                                label={
                                    <>
                                        Check-In Time
                                    </>
                                }
                                value={formData.checkInTime}
                                onChange={(val) => {
                                    setFormData({ ...formData, checkInTime: val });
                                    clearFieldError("checkIn");
                                }}
                                error={!!errors.checkIn}
                            />
                            {errors.checkIn && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.checkIn}
                                </p>
                            )}
                        </div>

                        <div className="md:w-[48%] w-[100%]">
                            <CustomTimePicker
                                label={
                                    <>
                                        Check-Out Time
                                    </>
                                }
                                value={formData.checkOutTime}
                                onChange={(val) => {
                                    setFormData({ ...formData, checkOutTime: val });
                                    clearFieldError("checkOut");
                                }}
                                error={!!errors.checkOut}
                            />
                            {errors.checkOut && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.checkOut}
                                </p>
                            )}
                        </div>
                        <div className="md:w-[48%] w-[100%] flex flex-col gap-2">
                            <Label className="text-sm">
                                Is this property refundable?
                                <span className="text-red-500">*</span>
                            </Label>

                            <SingleSelectDropdown
                                value={formData.isRefundable}
                                options={[
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ]}
                                onChange={(val) => {
                                    const boolVal = val === true || val === "true";

                                    setFormData((prev) => ({
                                        ...prev,
                                        isRefundable: boolVal,
                                        refundNotes: boolVal ? prev.refundNotes : "",
                                    }));
                                }}
                                placeholder="Select Option"
                            />
                        </div>

                        {formData.isRefundable === true && (
                            <div className="md:w-[48%] w-[100%]">
                                <Label className="text-sm">
                                    Refund Policy / Notes <span className="text-red-500">*</span>
                                </Label>

                                <textarea
                                    rows={4}
                                    className="w-full mt-2 border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                                    placeholder="Example: 100% refund if cancelled 7 days before check-in"
                                    value={formData.refundNotes}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, refundNotes: e.target.value }));
                                        clearFieldError("refundNotes");
                                    }}
                                />
                                {errors.refundNotes && <p className="text-red-500 text-xs mt-1">{errors.refundNotes}</p>}
                            </div>
                        )}


                        {formData.isRefundable && (
                            <div className="w-full mt-4">
                                <Label className="text-sm font-semibold">
                                    Cancellation Rules (in days before check-in)
                                </Label>

                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex gap-3 mt-2">
                                        <Input
                                            placeholder="Min days"
                                            type="number"
                                            value={formData.cancellationPolicy[i]?.minDaysBefore ?? ""}
                                            onChange={(e) => {
                                                const arr = [...formData.cancellationPolicy];
                                                arr[i] = {
                                                    ...arr[i],
                                                    minDaysBefore:
                                                        e.target.value === ""
                                                            ? ""
                                                            : Number(e.target.value),
                                                };
                                                setFormData(p => ({ ...p, cancellationPolicy: arr }));
                                            }}
                                        />

                                        <Input
                                            placeholder="Refund %"
                                            type="number"
                                            value={formData.cancellationPolicy[i]?.refundPercent ?? ""}
                                            onChange={(e) => {
                                                const arr = [...formData.cancellationPolicy];
                                                arr[i] = {
                                                    ...arr[i],
                                                    refundPercent:
                                                        e.target.value === ""
                                                            ? ""
                                                            : Number(e.target.value),
                                                };
                                                setFormData(p => ({ ...p, cancellationPolicy: arr }));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}


                    </>
                )}


                {currentStep === 4 && (
                    <>
                        <div className="w-[100%]">
                            <MultiSelectButtons
                                label={
                                    <>
                                        Food Availability <span className="text-red-500">*</span>
                                    </>
                                }
                                options={foodOptions}
                                selected={formData.foodAvailability}
                                onChange={(selected) => {
                                    setFormData((prev) => ({ ...prev, foodAvailability: selected }));
                                    clearFieldError("foodAvailability");
                                }}
                            />
                            {errors.foodAvailability && (
                                <p className="text-red-500 text-xs mt-2">
                                    {errors.foodAvailability}
                                </p>
                            )}
                        </div>

                        <div className="w-[100%]">
                            <label className="block mb-2 text-sm font-medium">Amenities</label>

                            <div className="flex flex-wrap items-start justify-start gap-4">
                                {amenitiesCategories.map((cat) => (
                                    <div key={cat.key} className="border rounded-lg md:w-[48%] w-[100%]">

                                        {/* Category Header */}
                                        <details className="group">
                                            <summary className="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-100">
                                                <span className="font-semibold">{cat.label}</span>
                                                <ChevronDown className="group-open:rotate-180 transition" size={18} />
                                            </summary>

                                            {/* Category items */}
                                            <div className="p-3 grid grid-cols-2 gap-2">
                                                {cat.items.map((item) => {
                                                    const Icon = item.icon;
                                                    const selected = formData.amenities.includes(item.value);

                                                    return (
                                                        <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() => {
                                                                const exists = formData.amenities.includes(item.value);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    amenities: exists
                                                                        ? prev.amenities.filter((a) => a !== item.value)
                                                                        : [...prev.amenities, item.value],
                                                                }));
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition 
                    ${selected ? "bg-black text-white border-black" : "bg-white border-gray-300"}
                  `}
                                                        >
                                                            <Icon size={16} />
                                                            {item.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>

                            {/* Selected Tags (Like Gulposh UI) */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {formData.amenities.map((am) => {
                                    const item = amenitiesCategories.flatMap(c => c.items).find(i => i.value === am);
                                    return (
                                        <span key={am} className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2">
                                            {item?.label}
                                            <button
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    amenities: prev.amenities.filter(a => a !== am)
                                                }))}
                                                className="text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}


                {currentStep === 5 && (
                    <>
                        <div className="md:w-[48%] w-[100%]">
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


                        <div className="md:w-[48%] w-[100%]">
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

                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="gstin" className="text-sm">
                                GSTIN <span className="text-gray-400 text-xs">(15 characters)</span>
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
                            />
                            {formData.gstin && !GSTIN_REGEX.test(formData.gstin) && (
                                <p className="text-xs text-red-500 mt-1">Please enter a valid GSTIN.</p>
                            )}
                        </div>

                        <div className="md:w-[48%] w-[100%]">
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

                        <div className="md:w-[48%] w-[100%]">
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

                        <div className="md:w-[48%] w-[100%]">
                            <Label htmlFor="internaNotes" className="text-sm">
                                Internal Notes
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
                        <div className="md:w-[48%] w-[100%] -mt-2">
                            <FileUploadsSection
                                setShopActFile={setShopActFile}
                                shopActFile={shopActFile}
                                shopActPreview={shopActPreview}
                                setShopActPreview={setShopActPreview}
                                showFields={{ coverImage: false, galleryPhotos: false, shopAct: true }}
                                errors={errors}
                                clearFieldError={clearFieldError}
                            />
                        </div>

                        <div className="md:w-[48%] w-[100%]">
                            <SingleSelectDropdown
                                className="mt-2"
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
                            coverImageFile={coverImageFile}
                            setCoverImageFile={setCoverImageFile}
                            coverImagePreview={coverImagePreview}
                            setCoverImagePreview={setCoverImagePreview}

                            existingGallery={existingGallery}
                            setExistingGallery={setExistingGallery}

                            newGalleryFiles={newGalleryFiles}
                            setNewGalleryFiles={setNewGalleryFiles}
                            newGalleryPreviews={newGalleryPreviews}
                            setNewGalleryPreviews={setNewGalleryPreviews}

                            showFields={{ coverImage: true, galleryPhotos: true, shopAct: false }}
                            errors={errors}
                            clearFieldError={clearFieldError}
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
                            const ok = validateStep(5);
                            if (!ok) {
                                toast.error("Please complete KYC details");
                                setCurrentStep(5);
                                return;
                            }
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
