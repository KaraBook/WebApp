import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Axios from "../utils/Axios";
import { toast } from "sonner";
import SummaryApi from "../common/SummaryApi";
import { getIndianStates, getCitiesByState } from "../utils/locationUtils";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import FullPageLoader from "@/components/FullPageLoader";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import SingleSelectButtons from "@/components/SingleSelectButtons";
import MultiSelectButtons from "../components/MultiSelectButtons";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { QuantityBox } from "@/components/QuantityBox";
import { Check, ChevronDown } from "lucide-react";
import {
  propertyTypeOptions, foodOptions, amenitiesCategories, kycVerifiedOptions,
  formSteps, approvalStatusOptions, featuredOptions, publishNowOptions
} from "../constants/dropdownOptions";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { MdBathroom } from "react-icons/md";


const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EditProperty = () => {
  const { id } = useParams();
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
  const [submitMode, setSubmitMode] = useState("step");
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [isDraftProperty, setIsDraftProperty] = useState(false);

  const [formData, setFormData] = useState({
    propertyName: "",
    resortOwner: { firstName: "", lastName: "", email: "", mobile: "", resortEmail: "", resortMobile: "", password: "" },
    propertyType: "",
    description: "",
    addressLine1: "",
    area: "",
    addressLine2: "",
    state: "",
    city: "",
    pinCode: "",
    locationLink: "",
    roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: "",
    baseGuests: "",
    pricingPerNightWeekdays: "",
    pricingPerNightWeekend: "",
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
    cancellationPolicy: [],
  });

  const setFieldError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message,
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
      if (!/\S+@\S+\.\S+/.test(formData.resortOwner.resortEmail || ""))
        e.resortEmail = "Enter valid resort email";
      if (!/^[6-9]\d{9}$/.test(formData.resortOwner.resortMobile || ""))
        e.resortMobile = "Enter valid resort mobile number";
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
      if (formData.isRefundable) {
        if (!formData.refundNotes?.trim()) {
          e.refundNotes = "Refund policy required";
        }
        const validRules = formData.cancellationPolicy.filter(
          rule =>
            rule?.minDaysBefore > 0 &&
            rule?.refundPercent >= 0
        );
        if (!validRules.length) {
          e.cancellationPolicy = "Add at least one valid cancellation rule";
        }
      }
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

  const DESCRIPTION_LIMIT = 1000;
  const descriptionLength = formData.description?.length || 0;
  const remainingChars = DESCRIPTION_LIMIT - descriptionLength;

  const nextStep = () => {
    if (currentStep < formSteps.length) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
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

  useEffect(() => {
    const init = async () => {
      try {
        setFetching(true);

        const allStates = getIndianStates();
        setStates(allStates);

        const res = await Axios.get(SummaryApi.getSingleProperty(id).url);
        const prop = res.data?.data;

        if (!prop) throw new Error("Property not found");

        setIsDraftProperty(!!prop.isDraft);

        const cityList = prop.state ? getCitiesByState(prop.state) : [];
        setCities(cityList);

        setFormData({
          propertyName: prop.propertyName || "",
          resortOwner: {
            firstName: prop?.resortOwner?.firstName || "",
            lastName: prop?.resortOwner?.lastName || "",
            email: prop?.resortOwner?.email || "",
            mobile: prop?.resortOwner?.mobile || "",
            resortEmail: prop?.resortOwner?.resortEmail || "",
            resortMobile: prop?.resortOwner?.resortMobile || "",
          },
          propertyType: prop.propertyType || "",
          description: prop.description || "",
          addressLine1: prop.addressLine1 || "",
          area: prop.area || "",
          addressLine2: prop.addressLine2 || "",
          state: prop.state || "",
          city: prop.city || "",
          pinCode: prop.pinCode || "",
          locationLink: prop.locationLink || "",
          roomBreakdown: prop.roomBreakdown || { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
          bedrooms: prop.bedrooms || "",
          bathrooms: prop.bathrooms || "",
          maxGuests: prop.maxGuests || "",
          baseGuests: prop.baseGuests || "",
          pricingPerNightWeekdays: prop.pricingPerNightWeekdays?.toString?.() || "",
          pricingPerNightWeekend: prop.pricingPerNightWeekend?.toString?.() || "",
          extraAdultCharge: prop.extraAdultCharge?.toString?.() || "",
          extraChildCharge: prop.extraChildCharge?.toString?.() || "",
          checkInTime: prop.checkInTime || "",
          checkOutTime: prop.checkOutTime || "",
          minStayNights: prop.minStayNights || "",
          foodAvailability: prop.foodAvailability || [],
          amenities: prop.amenities || [],
          pan: prop.pan || "",
          gstin: prop.gstin || "",
          kycVerified: !!prop.kycVerified,
          featured: !!prop.featured,
          approvalStatus: prop.approvalStatus || "pending",
          publishNow: !!prop.publishNow,
          internalNotes: prop.internalNotes || "",
          isRefundable: !!prop.isRefundable,
          refundNotes: prop.refundNotes || "",
          cancellationPolicy: Array.isArray(prop.cancellationPolicy)
            ? prop.cancellationPolicy
            : [],
        });

        setCoverImagePreview(prop.coverImage || null);
        setShopActPreview(prop.shopAct || null);
        setExistingGallery(Array.isArray(prop.galleryPhotos) ? prop.galleryPhotos : []);

        const stepFromQuery = Number(searchParams.get("step"));
        if (stepFromQuery && stepFromQuery >= 1 && stepFromQuery <= formSteps.length) {
          setCurrentStep(stepFromQuery);
        }

      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || err.message || "Failed to fetch property details");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id]);


  useEffect(() => {
    if (
      formData.baseGuests &&
      formData.maxGuests &&
      Number(formData.baseGuests) > Number(formData.maxGuests)
    ) {
      toast.error("Base guests cannot exceed max guests");
    }
  }, [formData.baseGuests, formData.maxGuests]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = validateStep(currentStep);
    if (!valid) {
      toast.error("Please fix highlighted fields");
      return;
    }
    if (submitMode === "final") {
      for (let i = 1; i <= formSteps.length; i++) {
        const ok = validateStep(i);
        if (!ok) {
          setCurrentStep(i);
          toast.error("Please complete all required fields");
          return;
        }
      }
    }

    if (
      formData.isRefundable &&
      (!formData.refundNotes || !formData.refundNotes.trim())
    ) {
      toast.error("Please enter refund policy / notes");
      return;
    }
    setLoading(true);

    try {
      const data = new FormData();

      const rb = formData.roomBreakdown;
      const total =
        Number(rb.ac || 0) +
        Number(rb.nonAc || 0) +
        Number(rb.deluxe || 0) +
        Number(rb.luxury || 0);

      const payloadData = {
        ...formData,
        roomBreakdown: { ...rb, total },
        totalRooms: total,
      };
      Object.entries(payloadData).forEach(([key, value]) => {

        if (key === "cancellationPolicy") {
          data.append("cancellationPolicy", JSON.stringify(value));
          return;
        }

        if (key === "resortOwner") {
          const safeOwner = { ...value };

          if (!isDraftProperty) {
            delete safeOwner.password;
          }

          data.append("resortOwner", JSON.stringify(safeOwner));
          return;
        }

        if (key === "roomBreakdown") {
          data.append("roomBreakdown", JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
          return;
        }

        if (typeof value === "object" && value !== null) {
          data.append(key, JSON.stringify(value));
          return;
        }

        if (typeof value === "boolean") {
          data.append(key, value ? "true" : "false");
        } else {
          data.append(key, value);
        }
      });
      if (coverImageFile) {
        data.append("coverImage", coverImageFile);
      }
      if (shopActFile) {
        data.append("shopAct", shopActFile);
      }

      data.append("existingGallery", JSON.stringify(existingGallery));
      newGalleryFiles.forEach((file) => {
        data.append("galleryPhotos", file);
      });


      const response = await Axios.put(
        SummaryApi.editProperty(id).url,
        data
      );
      toast.success("Property updated successfully!");
      if (submitMode === "final") {
        navigate("/properties");
      }
    } catch (error) {
      console.error(error);
      if (!error.response) {
        toast.error("Network error. Please check your internet connection.");
      }
      else if (error.response.status === 401) {
        toast.error("Session expired. Please login again.");
      }
      else if (error.response.status === 413) {
        toast.error("Uploaded files are too large. Please reduce image size (Max 5MB each).");
      }
      else if (error.response.status === 400) {
        toast.error(error.response.data?.message || "Invalid data submitted.");
      }
      else if (error.response.status === 500) {
        toast.error("Server error. Please try again later.");
      }
      else {
        toast.error(error.response.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const setOwnerField = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      resortOwner: { ...prev.resortOwner, [field]: value },
    }));

  if (fetching) {
    return (
      <div className="p-3 w-full mx-auto">
        <FullPageLoader />
      </div>
    );
  }

  return (
    <div className="md:p-3 p-0 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Property</h2>

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
                              toast.error("Please complete previous steps");
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
                    </TooltipTrigger>
                    <TooltipContent side="top">{step.title}</TooltipContent>
                  </Tooltip>
                </div>
                {index !== formSteps.length - 1 && <div className="h-0.5 w-[8%] md:w-[12%] bg-gray-300 mx-2" />}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>

      <form onSubmit={handleSubmit} className="flex w-full flex-wrap justify-between gap-3 md:gap-4">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <>
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="propertyName">
                Property Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="propertyName"
                name="propertyName"
                className="mt-2"
                value={formData.propertyName}
                onChange={(e) => {
                  handleChange(e);
                  clearFieldError("propertyName");
                }}
                required
              />
              {errors.propertyName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.propertyName}
                </p>
              )}
            </div>

            <div className="md:w-[48%] w-[100%]">
              <Label className="text-sm">
                Property Type <span className="text-red-500">*</span>
              </Label>

              <div className="mt-2">
                <SingleSelectButtons
                  options={propertyTypeOptions}
                  selected={formData.propertyType}
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      propertyType: selected,
                    }));
                    clearFieldError("propertyType");
                  }}
                  className={errors.propertyType ? "border-red-500" : ""}
                />
              </div>

              {errors.propertyType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.propertyType}
                </p>
              )}
            </div>

            {/* First Name */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerFirstName" className="text-sm">
                Resort Owner First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerFirstName"
                type="text"
                className={`mt-2 ${errors.firstName ? "border-red-500" : ""}`}
                value={formData.resortOwner.firstName}
                onChange={(e) => {
                  setOwnerField("firstName", e.target.value);
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
                id="resortOwnerLastName"
                type="text"
                className={`mt-2 ${errors.lastName ? "border-red-500" : ""}`}
                value={formData.resortOwner.lastName}
                onChange={(e) => {
                  setOwnerField("lastName", e.target.value);
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
                id="resortOwnerEmail"
                type="email"
                className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
                value={formData.resortOwner.email}
                onChange={(e) => {
                  setOwnerField("email", e.target.value);
                  clearFieldError("email");
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="md:w-[48%] w-[100%] flex justify-between items-start">

              {isDraftProperty && (
                <div className="md:w-[48%] w-[100%]">
                  <Label className="text-sm">
                    Owner Password <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    type="password"
                    className="mt-2"
                    value={formData.resortOwner.password}
                    placeholder="Password already set. Enter to change"
                    onChange={(e) => setOwnerField("password", e.target.value)}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    For security, password is not displayed. Enter a new one only if you want to change it.
                  </p>
                </div>
              )}

              {!isDraftProperty && (
                <div className="md:w-[48%] w-[100%]">
                  <Label className="text-sm">Owner Password</Label>
                  <Input
                    type="password"
                    disabled
                    placeholder="Password cannot be edited after publish"
                    className="mt-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Mobile Number */}
              <div className="md:w-[48%] w-[100%]">
                <Label htmlFor="resortOwnerMobile" className="text-sm">
                  Resort Owner Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="resortOwnerMobile"
                  type="tel"
                  className={`mt-2 ${errors.mobile ? "border-red-500" : ""}`}
                  value={formData.resortOwner.mobile}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v)) {
                      setOwnerField("mobile", v);
                      clearFieldError("mobile");
                    }
                  }}
                  maxLength={10}
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
              <Input
                id="resortOwnerResortEmail"
                type="email"
                className="mt-2"
                value={formData.resortOwner.resortEmail}
                onChange={(e) => setOwnerField("resortEmail", e.target.value)}
              />
            </div>

            {/* Resort Mobile Number */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerResortMobile" className="text-sm">
                Resort Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerResortMobile"
                name="resortOwnerResortMobile"
                type="tel"
                className="mt-2"
                value={formData.resortOwner.resortMobile}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v)) setOwnerField("resortMobile", v);
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
                rows={5}
                className={`mt-2 resize-none ${errors.description
                  ? "border-red-500 focus-visible:ring-red-500"
                  : descriptionLength >= DESCRIPTION_LIMIT
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                  }`}
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length > DESCRIPTION_LIMIT) return;

                  setFormData((prev) => ({
                    ...prev,
                    description: value,
                  }));
                  clearFieldError("description");
                }}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}

              {/* COUNTER + VALIDATION */}
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
            </div>

          </>
        )}

        {/* STEP 2 */}
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
                className={`mt-2 ${errors.addressLine1 ? "border-red-500" : ""}`}
                value={formData.addressLine1}
                onChange={(e) => {
                  handleChange(e);
                  clearFieldError("addressLine1");
                }}
              />
              {errors.addressLine1 && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.addressLine1}
                </p>
              )}
            </div>

            <div className="md:w-[48%] w-[100%]">
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

            <div className="md:w-[32%] w-[48%]">
              <Label htmlFor="state" className="text-sm">
                State <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    state: value,
                    city: "",
                  }));
                  setCities(getCitiesByState(value));
                  clearFieldError("state");
                }}
              >
                <SelectTrigger
                  id="state"
                  className={`mt-2 ${errors.state ? "border-red-500" : ""}`}
                >
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

              {errors.state && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.state}
                </p>
              )}
            </div>

            <div className="md:w-[32%] w-[48%]">
              <Label htmlFor="city" className="text-sm">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, city: value }));
                  clearFieldError("city");
                }}
              >
                <SelectTrigger
                  className={`mt-2 ${errors.city ? "border-red-500" : ""}`}
                >
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
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city}
                </p>
              )}
            </div>


            <div className="md:w-[32%] w-[48%]">
              <Label htmlFor="area" className="text-sm">
                Area <span className="text-red-500">*</span>
              </Label>
              <Input
                id="area"
                name="area"
                type="text"
                className={`mt-2 ${errors.area ? "border-red-500" : ""}`}
                value={formData.area}
                onChange={(e) => {
                  handleChange(e);
                  clearFieldError("area");
                }}
              />
              {errors.area && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.area}
                </p>
              )}
            </div>


            <div className="w-[48%]">
              <Label htmlFor="pinCode" className="text-sm">
                Pin Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pinCode"
                type="text"
                name="pinCode"
                maxLength={6}
                className={`mt-2 ${errors.pinCode ? "border-red-500" : ""}`}
                value={formData.pinCode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, pinCode: value }));
                    clearFieldError("pinCode");
                  }
                }}
              />
              {errors.pinCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.pinCode}
                </p>
              )}
            </div>

            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="locationLink" className="text-sm">
                Google Maps Location Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationLink"
                type="url"
                name="locationLink"
                className={`mt-2 ${errors.locationLink ? "border-red-500" : ""}`}
                value={formData.locationLink}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, locationLink: value }));
                  clearFieldError("locationLink");
                }}
              />
              {errors.locationLink && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.locationLink}
                </p>
              )}
            </div>
          </>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <>
            <div className="w-full">
              <Label className="text-sm font-semibold">Total Rooms / Units</Label>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {["ac", "nonAc", "deluxe", "luxury"].map((key) => (
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
                          const { ac, nonAc, deluxe, luxury } = updated.roomBreakdown;
                          updated.roomBreakdown.total =
                            Number(ac) + Number(nonAc) + Number(deluxe) + Number(luxury);
                          return updated;
                        });
                      }}
                      min={0}
                      max={999}
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2 ml-0 md:ml-0">
                  <span className="px-3 py-2 bg-black text-white rounded-md text-sm">
                    Total
                  </span>
                  <input
                    readOnly
                    className="w-14 text-center border rounded-md py-[5px]"
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.minStayNights}
                  </p>
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
                    setFormData((prev) => ({ ...prev, bedrooms: val }))
                    clearFieldError("bedrooms");
                  }}
                  min={1}
                  max={999}
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bedrooms}
                  </p>
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
                    setFormData((prev) => ({ ...prev, bathrooms: val }))
                    clearFieldError("bathrooms");
                  }}
                  min={1}
                  max={999}
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bathrooms}
                  </p>
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
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, maxGuests: val }));
                    clearFieldError("maxGuests");
                  }}
                  min={1}
                  max={999}
                />
                {errors.maxGuests && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maxGuests}
                  </p>
                )}
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.baseGuests}
                  </p>
                )}
              </div>
            </div>

            <div className="md:w-[22%] w-[100%]">
              <Label htmlFor="pricingPerNightWeekdays" className="block font-medium mt-2">
                Price Per Night (Weekdays) (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <Input
                  id="pricingPerNightWeekdays"
                  type="text"
                  inputMode="numeric"
                  className={`mt-2 ${errors.weekdayPrice ? "border-red-500" : ""}`}
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
                />
                {errors.weekdayPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.weekdayPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="md:w-[22%] w-[100%]">
              <Label htmlFor="pricingPerNightWeekend" className="block font-medium mt-2">
                Price Per Night (Weekend) (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <Input
                  id="pricingPerNightWeekend"
                  name="pricingPerNightWeekend"
                  type="text"
                  inputMode="numeric"
                  className={`mt-2 ${errors.weekendPrice ? "border-red-500" : ""}`}
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
                {errors.weekendPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.weekendPrice}
                  </p>
                )}
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
                label="Check-In Time"
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
                label="Check-Out Time"
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
                options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
                onChange={(val) => {
                  const boolVal = val === true || val === "true";

                  setFormData((prev) => ({
                    ...prev,
                    isRefundable: boolVal,
                    refundNotes: boolVal ? prev.refundNotes : "",
                    cancellationPolicy: boolVal ? prev.cancellationPolicy : [],
                  }));

                  clearFieldError("isRefundable");
                }}
              />
              {errors.isRefundable && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.isRefundable}
                </p>
              )}
            </div>

            {formData.isRefundable === true && (
              <div className="w-full mt-4">
                <Label className="text-sm font-semibold">
                  Cancellation Rules (Days before check-in)
                </Label>

                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 mt-2">
                    <Input
                      type="number"
                      placeholder="Min days"
                      value={formData.cancellationPolicy[i]?.minDaysBefore ?? ""}
                      onChange={(e) => {
                        const arr = [...formData.cancellationPolicy];
                        arr[i] = {
                          ...arr[i],
                          minDaysBefore: Number(e.target.value),
                        };
                        setFormData(p => ({ ...p, cancellationPolicy: arr }));
                      }}
                    />

                    <Input
                      type="number"
                      placeholder="Refund %"
                      value={formData.cancellationPolicy[i]?.refundPercent ?? ""}
                      onChange={(e) => {
                        const arr = [...formData.cancellationPolicy];
                        arr[i] = {
                          ...arr[i],
                          refundPercent: Number(e.target.value),
                        };
                        setFormData(p => ({ ...p, cancellationPolicy: arr }));
                      }}
                    />
                  </div>
                ))}

                <Textarea
                  className={`mt-3 ${errors.refundNotes ? "border-red-500" : ""}`}
                  value={formData.refundNotes}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, refundNotes: e.target.value }));
                    clearFieldError("refundNotes");
                  }}
                />
                {errors.refundNotes && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.refundNotes}
                  </p>
                )}
              </div>
            )}

          </>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <>
            <div className="w-[100%]">
              <Label className="text-sm">
                Food Availability <span className="text-red-500">*</span>
              </Label>

              <div className="mt-2">
                <MultiSelectButtons
                  options={foodOptions}
                  selected={formData.foodAvailability}
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      foodAvailability: selected,
                    }));
                    clearFieldError("foodAvailability");
                  }}
                  className={errors.foodAvailability ? "border-red-500" : ""}
                />
              </div>

              {errors.foodAvailability && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.foodAvailability}
                </p>
              )}
            </div>

            <div className="w-[100%]">
              <label className="block text-sm mb-2 font-medium">Amenities</label>

              <div className="flex flex-wrap items-start justify-start gap-4">
                {amenitiesCategories.map((cat) => (
                  <div key={cat.key} className="border rounded-lg w-[100%] md:w-[48%]">

                    {/* Category Header */}
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-100">
                        <span className="font-semibold">{cat.label}</span>
                        <ChevronDown className="group-open:rotate-180 transition" size={18} />
                      </summary>

                      {/* Category Items */}
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {cat.items.map((item) => {
                          const Icon = item.icon;
                          const isSelected = formData.amenities.includes(item.value);

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => {
                                  const exists = prev.amenities.includes(item.value);
                                  return {
                                    ...prev,
                                    amenities: exists
                                      ? prev.amenities.filter((v) => v !== item.value)
                                      : [...prev.amenities, item.value],
                                  };
                                });
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition 
                    ${isSelected ? "bg-black text-white border-black" : "bg-white border-gray-300"}
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

              {/* Selected tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.amenities.map((am) => {
                  const item = amenitiesCategories.flatMap(c => c.items).find(i => i.value === am);
                  return (
                    <span key={am} className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2">
                      {item?.label}
                      <button
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            amenities: prev.amenities.filter(v => v !== am),
                          }))
                        }
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

        {/* STEP 5 */}
        {currentStep === 5 && (
          <>

            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="pan" className="text-sm">
                Property PAN <span className="text-gray-400 text-xs">(10 characters)</span>
              </Label>
              <Input
                id="pan"
                name="pan"
                type="text"
                maxLength={10}
                value={formData.pan || ""}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (/^[A-Z0-9]*$/.test(value)) {
                    setFormData((prev) => ({ ...prev, pan: value }));
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
                onChange={(val) => setFormData((prev) => ({ ...prev, kycVerified: val }))}
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
                value={formData.gstin || ""}
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
                onChange={(val) => setFormData((prev) => ({ ...prev, approvalStatus: val }))}
                placeholder="Select Approval Status"
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <SingleSelectDropdown
                label="Featured Property"
                value={formData.featured}
                options={featuredOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, featured: val }))}
                placeholder="Select Featured Status"
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="internalNotes" className="text-sm">
                Internal Notes
              </Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                className="mt-2"
                rows={4}
                value={formData.internalNotes}
                onChange={handleChange}
                maxLength={500}
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
                setFieldError={setFieldError}
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <SingleSelectDropdown
                className="mt-2"
                label="Publish Now"
                value={formData.publishNow}
                options={publishNowOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, publishNow: val }))}
                placeholder="Select Publish Status"
              />
            </div>


            <FileUploadsSection
              setCoverImageFile={setCoverImageFile}
              coverImageFile={coverImageFile}
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
              setFieldError={setFieldError}
            />

          </>
        )}

        {/* Footer buttons */}
        <div className="w-full border mt-6"></div>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-4 py-2 border rounded-md bg-gray-200 text-black hover:bg-gray-300"
          >
            Back
          </button>
        )}

        {currentStep < formSteps.length ? (
          <button
            type="button"
            onClick={() => {
              const valid = validateStep(currentStep);
              if (!valid) {
                toast.error("Please fix highlighted fields");
                return;
              }
              setCurrentStep((prev) => prev + 1);
            }}
            className="ml-auto px-4 py-2 border rounded-md bg-black text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            onClick={() => setSubmitMode("final")}
            className="ml-auto px-4 py-2 border rounded-md bg-black text-white"
          >
            Update
          </button>
        )}
      </form>
    </div>
  );
};

export default EditProperty;
