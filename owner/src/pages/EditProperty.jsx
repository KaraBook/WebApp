import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { getIndianStates, getCitiesByState } from "../utils/locationUtils";
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import MultiSelectButtons from "../components/MultiSelectButtons";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import { QuantityBox } from "@/components/QuantityBox";
import FullPageLoader from "@/components/FullPageLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

import {
    propertyTypeOptions,
    foodOptions,
    amenitiesOptions,
    petFriendlyOptions,
    formSteps
} from "../constants/dropdownOptions";

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // File uploads
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
    const [replaceGallery, setReplaceGallery] = useState(false);
    const [shopActFile, setShopActFile] = useState(null);

    const [formData, setFormData] = useState({
        propertyName: "",
        propertyType: "",
        description: "",
        addressLine1: "",
        addressLine2: "",
        state: "",
        city: "",
        pinCode: "",
        locationLink: "",
        roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
        maxGuests: "",
        pricingPerNightWeekdays: "",
        pricingPerNightWeekend: "",
        extraGuestCharge: "",
        checkInTime: "",
        checkOutTime: "",
        minStayNights: "",
        foodAvailability: [],
        amenities: [],
        petFriendly: false,
        pan: "",
        gstin: "",
        shopAct: "",
    });

    useEffect(() => {
        const init = async () => {
            try {
                setFetching(true);
                const allStates = getIndianStates();
                setStates(allStates);

                const res = await api.get(SummaryApi.getSingleProperty(id).url);
                const prop = res.data?.data;
                if (!prop) throw new Error("Property not found");

                if (prop.isDraft || prop.isBlocked || !prop.publishNow) {
                    toast.error("You cannot edit this property while it’s in draft or blocked mode.");
                    navigate(`/view-property/${id}`);
                    return;
                }

                const cityList = prop.state ? getCitiesByState(prop.state) : [];
                setCities(cityList);

                setFormData({
                    ...formData,
                    propertyName: prop.propertyName || "",
                    propertyType: prop.propertyType || "",
                    description: prop.description || "",
                    addressLine1: prop.addressLine1 || "",
                    addressLine2: prop.addressLine2 || "",
                    state: prop.state || "",
                    city: prop.city || "",
                    pinCode: prop.pinCode || "",
                    locationLink: prop.locationLink || "",
                    roomBreakdown: prop.roomBreakdown || { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
                    maxGuests: prop.maxGuests || "",
                    pricingPerNightWeekdays: prop.pricingPerNightWeekdays?.toString?.() || "",
                    pricingPerNightWeekend: prop.pricingPerNightWeekend?.toString?.() || "",
                    extraGuestCharge: prop.extraGuestCharge?.toString?.() || "",
                    checkInTime: prop.checkInTime || "",
                    checkOutTime: prop.checkOutTime || "",
                    minStayNights: prop.minStayNights || "",
                    foodAvailability: prop.foodAvailability || [],
                    amenities: prop.amenities || [],
                    petFriendly: !!prop.petFriendly,
                    pan: prop.pan || "",
                    gstin: prop.gstin || "",
                    shopAct: prop.shopAct || "",
                });

                setCoverImagePreview(prop.coverImage || null);
                setGalleryImagePreviews(Array.isArray(prop.galleryPhotos) ? prop.galleryPhotos : []);
                setShopActFile(prop.shopAct || null);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to fetch property details");
            } finally {
                setFetching(false);
            }
        };
        init();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Total room calc
            const rb = formData.roomBreakdown;
            const total =
                Number(rb.ac || 0) + Number(rb.nonAc || 0) + Number(rb.deluxe || 0) + Number(rb.luxury || 0);
            formData.roomBreakdown = { ...rb, total };
            formData.totalRooms = total;

            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((v) => data.append(`${key}[]`, v));
                } else if (typeof value === "object" && value !== null) {
                    data.append(key, JSON.stringify(value));
                } else {
                    data.append(key, value);
                }
            });

            if (coverImageFile) data.append("coverImage", coverImageFile);
            if (replaceGallery && galleryImageFiles.length > 0)
                galleryImageFiles.forEach((file) => data.append("galleryPhotos", file));
            if (shopActFile) data.append("shopAct", shopActFile);

            const res = await api({
                url: SummaryApi.updateOwnerProperty(id).url,
                method: SummaryApi.updateOwnerProperty(id).method,
                data,
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Property updated successfully! Redirecting...");
            setTimeout(() => navigate("/properties"), 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update property");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <FullPageLoader />;

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className="p-3 w-full mx-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Property</h2>

            {/* Stepper */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-10 mb-8">
                {/* Left title */}
                <div className="text-xl font-semibold text-black w-full sm:w-auto">
                    {formSteps[currentStep - 1].title}
                </div>

                {/* Right steps */}
                <div className="flex items-center justify-end flex-1">
                    <div className="flex items-center w-full max-w-[60%] justify-between">
                        {formSteps.map((step, index) => {
                            const isCompleted = step.id < currentStep;
                            const isActive = currentStep === step.id;

                            return (
                                <div key={step.id} className="flex items-center w-full">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(step.id)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200
                                            ${isCompleted
                                                ? "bg-black border-black text-white"
                                                : isActive
                                                    ? "bg-black border-black text-white"
                                                    : "border-gray-300 text-gray-500 bg-white"
                                            }`}
                                    >
                                        {isCompleted ? <Check size={14} /> : step.id}
                                    </button>

                                    {/* Connector line (fills remaining width) */}
                                    {index !== formSteps.length - 1 && (
                                        <div
                                            className={`flex-1 h-[2px] transition-all duration-300 ${step.id < currentStep ? "bg-black" : "bg-gray-300"
                                                }`}
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>



            <form onSubmit={handleSubmit} className="flex flex-wrap justify-between gap-4">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <>
                        <div className="w-[48%]">
                            <Label>Property Name *</Label>
                            <Input name="propertyName" value={formData.propertyName} onChange={handleChange} required />
                        </div>

                        <div className="w-[48%]">
                            <SingleSelectDropdown
                                label="Property Type"
                                value={formData.propertyType}
                                options={propertyTypeOptions}
                                onChange={(val) => setFormData((prev) => ({ ...prev, propertyType: val }))}
                            />
                        </div>

                        <div className="w-full">
                            <Label>Description *</Label>
                            <Textarea
                                name="description"
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

                {/* Step 2: Location */}
                {currentStep === 2 && (
                    <>
                        <div className="w-[48%]">
                            <Label>Address Line 1 *</Label>
                            <Input name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                        </div>

                        <div className="w-[48%]">
                            <Label>Address Line 2</Label>
                            <Input name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                        </div>

                        <div className="w-[48%]">
                            <Label>State *</Label>
                            <Select
                                value={formData.state}
                                onValueChange={(value) => {
                                    setFormData((prev) => ({ ...prev, state: value, city: "" }));
                                    setCities(getCitiesByState(value));
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                <SelectContent>
                                    {states.map((s) => (
                                        <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[48%]">
                            <Label>City *</Label>
                            <Select
                                value={formData.city}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                            >
                                <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                <SelectContent>
                                    {cities.map((city) => (
                                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[48%]">
                            <Label>Pin Code *</Label>
                            <Input name="pinCode" value={formData.pinCode} onChange={handleChange} maxLength={6} />
                        </div>

                        <div className="w-[48%]">
                            <Label>Google Maps Location Link *</Label>
                            <Input name="locationLink" value={formData.locationLink} onChange={handleChange} />
                        </div>
                    </>
                )}

                {/* Step 3: Rooms & Pricing */}
                {currentStep === 3 && (
                    <>
                        <div className="w-full">
                            <Label>Total Rooms / Units</Label>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {["ac", "nonAc", "deluxe", "luxury"].map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-black text-white rounded-md text-sm capitalize">
                                            {key === "nonAc" ? "Non AC" : key}
                                        </span>
                                        <QuantityBox
                                            value={formData.roomBreakdown[key]}
                                            onChange={(val) =>
                                                setFormData((prev) => {
                                                    const updated = {
                                                        ...prev,
                                                        roomBreakdown: { ...prev.roomBreakdown, [key]: val }
                                                    };
                                                    const { ac, nonAc, deluxe, luxury } = updated.roomBreakdown;
                                                    updated.roomBreakdown.total = Number(ac) + Number(nonAc) + Number(deluxe) + Number(luxury);
                                                    return updated;
                                                })
                                            }
                                            min={0}
                                            max={999}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[48%]">
                            <Label>Max Guests *</Label>
                            <QuantityBox
                                value={formData.maxGuests}
                                onChange={(val) => setFormData((prev) => ({ ...prev, maxGuests: val }))}
                                min={1}
                                max={999}
                            />
                        </div>

                        <div className="w-[48%]">
                            <SingleSelectDropdown
                                label="Pet Friendly"
                                value={formData.petFriendly}
                                options={petFriendlyOptions}
                                onChange={(val) => setFormData((prev) => ({ ...prev, petFriendly: val }))}
                            />
                        </div>

                        <div className="w-[48%]">
                            <Label>Price (Weekdays)</Label>
                            <Input name="pricingPerNightWeekdays" value={formData.pricingPerNightWeekdays} onChange={handleChange} />
                        </div>

                        <div className="w-[48%]">
                            <Label>Price (Weekend)</Label>
                            <Input name="pricingPerNightWeekend" value={formData.pricingPerNightWeekend} onChange={handleChange} />
                        </div>

                        <CustomTimePicker
                            label="Check-In Time"
                            value={formData.checkInTime}
                            onChange={(val) => setFormData((prev) => ({ ...prev, checkInTime: val }))}
                        />
                        <CustomTimePicker
                            label="Check-Out Time"
                            value={formData.checkOutTime}
                            onChange={(val) => setFormData((prev) => ({ ...prev, checkOutTime: val }))}
                        />
                    </>
                )}

                {/* Step 4: Amenities */}
                {currentStep === 4 && (
                    <>
                        <div className="w-[48%]">
                            <MultiSelectButtons
                                label="Food Availability"
                                options={foodOptions}
                                selected={formData.foodAvailability}
                                onChange={(val) => setFormData((prev) => ({ ...prev, foodAvailability: val }))}
                            />
                        </div>

                        <div className="w-[48%]">
                            <MultiSelectButtons
                                label="Amenities"
                                options={amenitiesOptions}
                                selected={formData.amenities}
                                onChange={(val) => setFormData((prev) => ({ ...prev, amenities: val }))}
                            />
                        </div>
                    </>
                )}

                {/* Step 5: Docs */}
                {currentStep === 5 && (
                    <>
                        <FileUploadsSection
                            setCoverImageFile={setCoverImageFile}
                            coverImageFile={coverImageFile}
                            coverImagePreview={coverImagePreview}
                            setCoverImagePreview={setCoverImagePreview}
                            setGalleryImageFiles={setGalleryImageFiles}
                            galleryImageFiles={galleryImageFiles}
                            galleryImagePreviews={galleryImagePreviews}
                            setGalleryImagePreviews={setGalleryImagePreviews}
                            showFields={{ coverImage: true, galleryPhotos: true, shopAct: false }}
                            shopActFile={shopActFile}
                            setShopActFile={setShopActFile}

                        />

                        <div className="w-full flex items-center gap-3 mt-4">
                            <input
                                id="replaceGallery"
                                type="checkbox"
                                checked={replaceGallery}
                                onChange={(e) => setReplaceGallery(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="replaceGallery" className="text-sm">
                                Replace gallery with newly selected images
                            </Label>
                        </div>
                    </>
                )}

                {/* Step 6: PAN/GST */}
                {currentStep === 6 && (
                    <>
                        <div className="w-[48%]">
                            <Label>PAN</Label>
                            <Input name="pan" value={formData.pan} onChange={handleChange} />
                        </div>

                        <div className="w-[48%]">
                            <Label>GSTIN</Label>
                            <Input name="gstin" value={formData.gstin} onChange={handleChange} />
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="w-full border-t pt-5 flex justify-between mt-8">
                    {currentStep > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep}>
                            Back
                        </Button>
                    )}
                    {currentStep < 6 ? (
                        <Button type="button" onClick={nextStep} className="ml-auto bg-black text-white hover:bg-gray-900">
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" className="ml-auto bg-black text-white hover:bg-gray-900">
                            {loading ? "Updating..." : "Update Property"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EditProperty;
