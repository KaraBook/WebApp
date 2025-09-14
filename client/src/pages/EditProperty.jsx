// src/pages/EditProperty.jsx
import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Check } from "lucide-react";
import {
  propertyTypeOptions,
  roomTypeOptions,
  foodOptions,
  amenitiesOptions,
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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // images/files
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [shopActFile, setShopActFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);

  // previews (can be URL strings)
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  // gallery handling
  const [replaceGallery, setReplaceGallery] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    propertyName: "",
    resortOwner: { firstName: "", lastName: "", email: "", mobile: "", resortEmail: "", resortMobile: "" },
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
    kycVerified: false,
    featured: false,
    approvalStatus: "pending",
    publishNow: false,
    internalNotes: "",
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

  // Fetch property and hydrate UI
  useEffect(() => {
    const init = async () => {
      try {
        setFetching(true);
        const allStates = getIndianStates();
        setStates(allStates);

        const res = await Axios.get(SummaryApi.getSingleProperty(id).url);
        const prop = res.data?.data;

        if (!prop) throw new Error("Property not found");

        // Set state/city lists based on stored state code
        const cityList = prop.state ? getCitiesByState(prop.state) : [];
        setCities(cityList);

        // hydrate form
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
          addressLine2: prop.addressLine2 || "",
          state: prop.state || "",
          city: prop.city || "",
          pinCode: prop.pinCode || "",
          locationLink: prop.locationLink || "",
          totalRooms: prop.totalRooms || "",
          maxGuests: prop.maxGuests || "",
          roomTypes: prop.roomTypes || [],
          pricingPerNightWeekdays: prop.pricingPerNightWeekdays?.toString?.() || "",
          pricingPerNightWeekend: prop.pricingPerNightWeekend?.toString?.() || "",
          extraGuestCharge: prop.extraGuestCharge?.toString?.() || "",
          checkInTime: prop.checkInTime || "",
          checkOutTime: prop.checkOutTime || "",
          minStayNights: prop.minStayNights || "",
          foodAvailability: prop.foodAvailability || [],
          amenities: prop.amenities || [],
          pan: prop.pan || "",
          kycVerified: !!prop.kycVerified,
          featured: !!prop.featured,
          approvalStatus: prop.approvalStatus || "pending",
          publishNow: !!prop.publishNow,
          internalNotes: prop.internalNotes || "",
        });

        // image previews
        setCoverImagePreview(prop.coverImage || null);
        setShopActPreview(prop.shopAct || null);
        setGalleryImagePreviews(Array.isArray(prop.galleryPhotos) ? prop.galleryPhotos : []);

      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || err.message || "Failed to fetch property details");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append fields (same strategy as AddProperty)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "resortOwner") {
          Object.entries(value).forEach(([ownerKey, ownerValue]) => {
            data.append(`resortOwner[${ownerKey}]`, ownerValue);
          });
        } else if (Array.isArray(value)) {
          value.forEach((v) => data.append(`${key}[]`, v));
        } else if (typeof value === "object" && value !== null) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value);
        }
      });

      // Only append files when changed
      if (coverImageFile) {
        data.append("coverImage", coverImageFile);
      }
      if (shopActFile) {
        data.append("shopAct", shopActFile);
      }

      // Gallery strategy:
      // - If replaceGallery=true and user selected files -> send those files to fully replace on backend
      // - If replaceGallery=false -> do not send any gallery files, backend will keep existing galleryPhotos
      if (replaceGallery && galleryImageFiles.length > 0) {
        galleryImageFiles.forEach((file) => data.append("galleryPhotos", file));
      }

      const response = await Axios.put(SummaryApi.editProperty(id).url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property updated successfully!");
      navigate("/admin/properties");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  // helpers to keep numeric-only inputs consistent (same as AddProperty)
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
    <div className="p-3 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Property</h2>

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
                      <button
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium border-2 transition-colors duration-200
                          ${
                            completed
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
                {index !== formSteps.length - 1 && <div className="h-0.5 w-[8%] bg-gray-300 mx-2" />}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>

      <form onSubmit={handleSubmit} className="flex w-full flex-wrap justify-between gap-4">
        {/* STEP 1 */}
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
              <SingleSelectButtons
                label="Property Type"
                options={propertyTypeOptions}
                selected={formData.propertyType}
                onChange={(selected) => setFormData((prev) => ({ ...prev, propertyType: selected }))}
              />
            </div>

            {/* First Name */}
            <div className="w-[48%]">
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
            <div className="w-[48%]">
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
            <div className="w-[48%]">
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
            <div className="w-[48%]">
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
            <div className="w-[48%]">
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
            <div className="w-[48%]">
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

            <div className="w-[48%]">
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
            <div className="w-[32%]">
              <Label htmlFor="totalRooms" className="text-sm">
                Total Rooms / Units <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <QuantityBox
                  value={formData.totalRooms}
                  onChange={(val) => setFormData((prev) => ({ ...prev, totalRooms: val }))}
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
                  onChange={(val) => setFormData((prev) => ({ ...prev, maxGuests: val }))}
                  min={1}
                  max={999}
                />
              </div>
            </div>

            <div className="w-[32%]">
              <MultiSelectButtons
                label="Room Types"
                options={roomTypeOptions}
                selected={formData.roomTypes}
                onChange={(selected) => setFormData((prev) => ({ ...prev, roomTypes: selected }))}
              />
            </div>

            <div className="w-[32%]">
              <Label htmlFor="pricingPerNightWeekdays" className="block font-medium">
                Price Per Night (Weekdays) (₹) <span className="text-red-500">*</span>
              </Label>
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

            <div className="w-[32%]">
              <Label htmlFor="pricingPerNightWeekend" className="block font-medium">
                Price Per Night (Weekend) (₹) <span className="text-red-500">*</span>
              </Label>
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

            <div className="w-[32%]">
              <Label htmlFor="extraGuestCharge" className="block font-medium">
                Extra Guest Charge (₹)
              </Label>
              <Input
                id="extraGuestCharge"
                name="extraGuestCharge"
                type="text"
                inputMode="numeric"
                className="mt-2"
                value={formData.extraGuestCharge}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,4}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, extraGuestCharge: value }));
                  }
                }}
              />
            </div>
          </>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <>
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

            <div className="w-[32%]">
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
          </>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <>
            <div className="w-[48%]">
              <MultiSelectButtons
                label="Food Availability"
                options={foodOptions}
                selected={formData.foodAvailability}
                onChange={(selected) => setFormData((prev) => ({ ...prev, foodAvailability: selected }))}
              />
            </div>

            <div className="w-[48%]">
              <MultiSelectButtons
                label="Amenities"
                options={amenitiesOptions}
                selected={formData.amenities}
                onChange={(selected) => setFormData((prev) => ({ ...prev, amenities: selected }))}
              />
            </div>
          </>
        )}

        {/* STEP 6: Cover + Gallery (with previews and replacement option) */}
        {currentStep === 6 && (
          <>
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

            <div className="w-full -mt-2 flex items-center gap-3">
              <input
                id="replaceGallery"
                type="checkbox"
                checked={replaceGallery}
                onChange={(e) => setReplaceGallery(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="replaceGallery" className="text-sm">
                Replace gallery with newly selected images (leave unchecked to keep current gallery)
              </Label>
            </div>
          </>
        )}

        {/* STEP 7: Shop Act + PAN/KYC */}
        {currentStep === 7 && (
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

            <div className="w-[48%]">
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

            <div className="w-[48%]">
              <SingleSelectDropdown
                label="KYC Verified"
                value={formData.kycVerified}
                options={kycVerifiedOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, kycVerified: val }))}
                placeholder="Select KYC status"
              />
            </div>
          </>
        )}

        {/* STEP 8 */}
        {currentStep === 8 && (
          <>
            <div className="w-[32%]">
              <SingleSelectDropdown
                label="Approval Status"
                value={formData.approvalStatus}
                options={approvalStatusOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, approvalStatus: val }))}
                placeholder="Select Approval Status"
              />
            </div>

            <div className="w-[32%]">
              <SingleSelectDropdown
                label="Publish Now"
                value={formData.publishNow}
                options={publishNowOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, publishNow: val }))}
                placeholder="Select Publish Status"
              />
            </div>

            <div className="w-[32%]">
              <SingleSelectDropdown
                label="Featured Property"
                value={formData.featured}
                options={featuredOptions}
                onChange={(val) => setFormData((prev) => ({ ...prev, featured: val }))}
                placeholder="Select Featured Status"
              />
            </div>

            <div className="w-full">
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
                required
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

        {currentStep < formSteps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="ml-auto px-4 py-2 border rounded-md bg-black text-white hover:bg-gray-900"
          >
            Next
          </button>
        ) : (
          <button type="submit" className="ml-auto px-4 py-2 border rounded-md bg-black text-white hover:bg-gray-900">
            Update
          </button>
        )}
      </form>
    </div>
  );
};

export default EditProperty;
