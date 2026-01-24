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
  propertyTypeOptions,
  foodOptions,
  amenitiesCategories,
  kycVerifiedOptions,
  formSteps,
  approvalStatusOptions,
  featuredOptions,
  publishNowOptions,
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


  const [formData, setFormData] = useState({
    propertyName: "",
    resortOwner: { firstName: "", lastName: "", email: "", mobile: "", resortEmail: "", resortMobile: "" },
    propertyType: "",
    description: "",
    addressLine1: "",
    area: "",
    addressLine2: "",
    state: "",
    petFriendly: false,
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
          petFriendly: !!prop.petFriendly,
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

    if (
      formData.isRefundable &&
      (!formData.refundNotes || !formData.refundNotes.trim())
    ) {
      toast.error("Please enter refund policy / notes");
      return;
    }

    if (submitMode === "step" && currentStep === 5) {
      setCurrentStep(6);
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

      formData.roomBreakdown = { ...rb, total };
      formData.totalRooms = total;
      Object.entries(formData).forEach(([key, value]) => {

        // 1️⃣ Always handle complex JSON FIRST
        if (key === "cancellationPolicy") {
          data.append("cancellationPolicy", JSON.stringify(value));
          return;
        }

        if (key === "resortOwner") {
          data.append("resortOwner", JSON.stringify(value));
          return;
        }

        if (key === "roomBreakdown") {
          data.append("roomBreakdown", JSON.stringify(value));
          return;
        }

        if (Array.isArray(value)) {
          value.forEach(v => data.append(`${key}[]`, v));
          return;
        }

        if (typeof value === "object" && value !== null) {
          data.append(key, JSON.stringify(value));
          return;
        }

        data.append(key, value);
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


      const response = await Axios.put(SummaryApi.editProperty(id).url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property updated successfully!");
      if (submitMode === "final") {
        navigate("/properties");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update property");
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
                        onClick={() => setCurrentStep(step.id)}
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
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <SingleSelectButtons
                label="Property Type"
                options={propertyTypeOptions}
                selected={formData.propertyType}
                onChange={(selected) => setFormData((prev) => ({ ...prev, propertyType: selected }))}
              />
            </div>

            {/* First Name */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerFirstName" className="text-sm">
                Resort Owner First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerFirstName"
                name="resortOwnerFirstName"
                type="text"
                className="mt-2"
                value={formData.resortOwner.firstName}
                onChange={(e) => setOwnerField("firstName", e.target.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerLastName" className="text-sm">
                Resort Owner Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerLastName"
                name="resortOwnerLastName"
                type="text"
                className="mt-2"
                value={formData.resortOwner.lastName}
                onChange={(e) => setOwnerField("lastName", e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerEmail" className="text-sm">
                Resort Owner Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerEmail"
                name="resortOwnerEmail"
                type="email"
                className="mt-2"
                value={formData.resortOwner.email}
                onChange={(e) => setOwnerField("email", e.target.value)}
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerMobile" className="text-sm">
                Resort Owner Mobile Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerMobile"
                name="resortOwnerMobile"
                type="tel"
                className="mt-2"
                value={formData.resortOwner.mobile}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v)) setOwnerField("mobile", v);
                }}
                maxLength={10}
                required
              />
            </div>

            {/* Resort Email */}
            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="resortOwnerResortEmail" className="text-sm">
                Resort Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resortOwnerResortEmail"
                name="resortOwnerResortEmail"
                type="email"
                className="mt-2"
                value={formData.resortOwner.resortEmail}
                onChange={(e) => setOwnerField("resortEmail", e.target.value)}
                required
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
                className="mt-2"
                value={formData.addressLine1}
                onChange={handleChange}
                required
              />
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

            <div className="md:w-[32%] w-[48%]">
              <Label htmlFor="city" className="text-sm">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleChange({ target: { name: "city", value } })}
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
            </div>


            <div className="md:w-[32%] w-[48%]">
              <Label htmlFor="area" className="text-sm">
                Area <span className="text-red-500">*</span>
              </Label>
              <Input
                id="area"
                name="area"
                type="text"
                className="mt-2"
                value={formData.area}
                onChange={handleChange}
                required
              />
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
                className="mt-2"
                value={formData.pinCode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, pinCode: value }));
                  }
                }}
                required
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <Label htmlFor="locationLink" className="text-sm">
                Google Maps Location Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationLink"
                type="url"
                name="locationLink"
                className="mt-2"
                value={formData.locationLink}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, locationLink: value }));
                }}
                pattern="https://.*"
                required
              />
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

                <div className="flex items-center gap-2 ml-0 md:ml-4">
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

            <div className="md:w-[16%] w-[100%]">
              <Label htmlFor="minStayNights" className="text-sm">
                Minimum Stay (Nights) <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.minStayNights}
                  onChange={(val) => setFormData((prev) => ({ ...prev, minStayNights: val }))}
                  min={1}
                  max={999}
                />
              </div>
            </div>


            <div className="md:w-[16%] w-[100%]">
              <Label htmlFor="bedrooms" className="text-sm">
                Bedrooms <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.bedrooms}
                  onChange={(val) => setFormData((prev) => ({ ...prev, bedrooms: val }))}
                  min={1}
                  max={999}
                />
              </div>
            </div>


            <div className="md:w-[16%] w-[100%]">
              <Label htmlFor="bathrooms" className="text-sm">
                Bathrooms <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.bathrooms}
                  onChange={(val) => setFormData((prev) => ({ ...prev, bathrooms: val }))}
                  min={1}
                  max={999}
                />
              </div>
            </div>


            <div className="md:w-[15%] w-[48%]">
              <Label htmlFor="maxGuests" className="text-sm">
                Max Guests Allowed <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.maxGuests}
                  onChange={(val) => setFormData((prev) => ({ ...prev, maxGuests: val }))}
                  min={1}
                  max={999}
                />
              </div>
            </div>

            <div className="md:w-[15%] w-[48%]">
              <Label className="text-sm">
                Base Guests <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.baseGuests}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, baseGuests: val }))
                  }
                  min={1}
                  max={formData.maxGuests || 999}
                />
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

            <div className="md:w-[22%] w-[100%]">
              <Label htmlFor="pricingPerNightWeekdays" className="block font-medium mt-2">
                Price Per Night (Weekdays) (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <Input
                  id="pricingPerNightWeekdays"
                  name="pricingPerNightWeekdays"
                  type="text"
                  inputMode="numeric"
                  className="mt-2"
                  value={formData.pricingPerNightWeekdays}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) {
                      setFormData((prev) => ({ ...prev, pricingPerNightWeekdays: value }));
                    }
                  }}
                  required
                />
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
                  className="mt-2"
                  value={formData.pricingPerNightWeekend}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) {
                      setFormData((prev) => ({ ...prev, pricingPerNightWeekend: value }));
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="md:w-[32%] w-[100%]">
              <SingleSelectDropdown
                label="Is this property Pet Friendly?"
                value={formData.petFriendly}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    petFriendly: val,
                  }))
                }
                placeholder="Select Option"
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
                  className="mt-3"
                  placeholder="Human readable notes"
                  value={formData.refundNotes}
                  onChange={(e) =>
                    setFormData(p => ({ ...p, refundNotes: e.target.value }))
                  }
                />
              </div>
            )}

          </>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <>
            <div className="w-[100%]">
              <MultiSelectButtons
                label="Food Availability"
                options={foodOptions}
                selected={formData.foodAvailability}
                onChange={(selected) => setFormData((prev) => ({ ...prev, foodAvailability: selected }))}
              />
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
                GSTIN <span className="text-gray-400 text-xs">(15 characters)</span> <span className="text-red-500">*</span>
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
                Internal Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                className="mt-2"
                rows={4}
                value={formData.internalNotes}
                onChange={handleChange}
                minLength={3}
                maxLength={500}
              />
            </div>

          </>
        )}

        {currentStep === 6 && (
          <>
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
            />


            <div className="md:w-[48%] w-[100%] -mt-2">
              <FileUploadsSection
                setShopActFile={setShopActFile}
                shopActFile={shopActFile}
                shopActPreview={shopActPreview}
                setShopActPreview={setShopActPreview}
                showFields={{ coverImage: false, galleryPhotos: false, shopAct: true }}
              />
            </div>

            <div className="md:w-[48%] w-[100%]">
              <SingleSelectDropdown
                label="Publish Now"
                value={formData.publishNow}
                options={publishNowOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, publishNow: val }))}
                placeholder="Select Publish Status"
              />
            </div>

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

        {currentStep === 5 ? (
          <button
            type="submit"
            onClick={() => setSubmitMode("step")}
            className="ml-auto px-4 py-2 border rounded-md bg-black text-white"
          >
            Next
          </button>
        ) : currentStep < formSteps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev + 1)}
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
