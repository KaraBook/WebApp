import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import MultiSelectButtons from "../components/MultiSelectButtons";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import { QuantityBox } from "@/components/QuantityBox";
import FullPageLoader from "@/components/FullPageLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
    foodOptions,
    amenitiesOptions,
    petFriendlyOptions,
} from "../constants/dropdownOptions";

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    // File uploads
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
    const [shopActFile, setShopActFile] = useState(null);
    const [shopActPreview, setShopActPreview] = useState(null);

    const [formData, setFormData] = useState({
        description: "",
        roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
        maxGuests: "",
        pricingPerNightWeekdays: "",
        pricingPerNightWeekend: "",
        extraGuestCharge: "",
        checkInTime: "",
        checkOutTime: "",
        foodAvailability: [],
        amenities: [],
        petFriendly: false,
    });

    useEffect(() => {
        const init = async () => {
            try {
                setFetching(true);

                const res = await api.get(SummaryApi.getSingleProperty(id).url);
                const prop = res.data?.data;
                if (!prop) throw new Error("Property not found");

                if (prop.isDraft || prop.isBlocked || !prop.publishNow) {
                    toast.error("You cannot edit this property right now.");
                    navigate(`/view-property/${id}`);
                    return;
                }

                setFormData({
                    description: prop.description || "",
                    roomBreakdown: prop.roomBreakdown || { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
                    maxGuests: prop.maxGuests || "",
                    pricingPerNightWeekdays: prop.pricingPerNightWeekdays?.toString?.() || "",
                    pricingPerNightWeekend: prop.pricingPerNightWeekend?.toString?.() || "",
                    extraGuestCharge: prop.extraGuestCharge?.toString?.() || "",
                    checkInTime: prop.checkInTime || "",
                    checkOutTime: prop.checkOutTime || "",
                    foodAvailability: prop.foodAvailability || [],
                    amenities: prop.amenities || [],
                    petFriendly: !!prop.petFriendly,
                });

                setCoverImagePreview(prop.coverImage || null);
                setGalleryImagePreviews(Array.isArray(prop.galleryPhotos) ? prop.galleryPhotos : []);
                setShopActPreview(prop.shopAct || null);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load property details");
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

            const rb = formData.roomBreakdown;
            const total = Number(rb.ac) + Number(rb.nonAc) + Number(rb.deluxe) + Number(rb.luxury);

            formData.roomBreakdown.total = total;

            Object.entries(formData).forEach(([key, val]) => {
                if (key === "roomBreakdown") {
                    Object.entries(val).forEach(([k, v]) =>
                        data.append(`roomBreakdown[${k}]`, v)
                    );
                } else if (Array.isArray(val)) {
                    val.forEach((v) => data.append(`${key}[]`, v));
                } else data.append(key, val ?? "");
            });

            if (coverImageFile) data.append("coverImage", coverImageFile);
            if (shopActFile) data.append("shopAct", shopActFile);

           galleryImageFiles.forEach((file) => data.append("galleryPhotos", file));

            await api.put(SummaryApi.updateOwnerProperty(id).url, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Property updated successfully!");
            setTimeout(() => navigate("/properties"), 1500);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update property");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <FullPageLoader />;

    return (
        <div className="p-2 w-full max-w-5xl">
            <h2 className="text-2xl font-bold mb-6">Edit Property</h2>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* DESCRIPTION */}
                <div className="bg-white p-5 rounded-lg border">
                    <Label>Description *</Label>
                    <Textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* ROOMS & PRICING */}
                <div className="bg-white p-5 rounded-lg border space-y-4">
                    <h3 className="font-semibold text-lg">Rooms & Pricing</h3>

                    <div className="space-y-3">
                        {["ac", "nonAc", "deluxe", "luxury"].map((key) => (
                            <div key={key} className="flex items-center gap-3">
                                <span className="w-28 capitalize">
                                    {key === "nonAc" ? "Non AC" : key}
                                </span>

                                <QuantityBox
                                    value={formData.roomBreakdown[key]}
                                    onChange={(val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            roomBreakdown: {
                                                ...prev.roomBreakdown,
                                                [key]: val,
                                            },
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <Label>Max Guests</Label>
                            <QuantityBox
                                value={formData.maxGuests}
                                onChange={(val) => setFormData((prev) => ({ ...prev, maxGuests: val }))}
                                min={1}
                            />
                        </div>

                        <div>
                            <SingleSelectDropdown
                                label="Pet Friendly"
                                value={formData.petFriendly}
                                options={petFriendlyOptions}
                                onChange={(val) => setFormData((prev) => ({ ...prev, petFriendly: val }))}
                            />
                        </div>

                        <div>
                            <Label>Price (Weekdays)</Label>
                            <Input
                                name="pricingPerNightWeekdays"
                                value={formData.pricingPerNightWeekdays}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label>Price (Weekend)</Label>
                            <Input
                                name="pricingPerNightWeekend"
                                value={formData.pricingPerNightWeekend}
                                onChange={handleChange}
                            />
                        </div>
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
                </div>

                {/* AMENITIES */}
                <div className="bg-white p-5 rounded-lg border grid grid-cols-2 gap-6">
                    <MultiSelectButtons
                        label="Food Availability"
                        selected={formData.foodAvailability}
                        onChange={(val) => setFormData((prev) => ({ ...prev, foodAvailability: val }))}
                        options={foodOptions}
                    />

                    <MultiSelectButtons
                        label="Amenities"
                        selected={formData.amenities}
                        onChange={(val) => setFormData((prev) => ({ ...prev, amenities: val }))}
                        options={amenitiesOptions}
                    />
                </div>

                {/* IMAGE UPLOADS */}
                <div className="bg-white p-5 rounded-lg border">
                    <FileUploadsSection
                        setCoverImageFile={setCoverImageFile}
                        coverImagePreview={coverImagePreview}
                        setCoverImagePreview={setCoverImagePreview}
                        setGalleryImageFiles={setGalleryImageFiles}
                        galleryImagePreviews={galleryImagePreviews}
                        setGalleryImagePreviews={setGalleryImagePreviews}
                        showFields={{ coverImage: true, galleryPhotos: true, shopAct: true }}
                        shopActFile={shopActFile}
                        setShopActFile={setShopActFile}
                        shopActPreview={shopActPreview}
                        setShopActPreview={setShopActPreview}
                    />

                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <Button type="submit" className="bg-black text-white px-6">
                        {loading ? "Updating..." : "Update Property"}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default EditProperty;
