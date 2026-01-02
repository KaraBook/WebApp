import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MultiSelectButtons from "../components/MultiSelectButtons";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import { QuantityBox } from "@/components/QuantityBox";
import FullPageLoader from "@/components/FullPageLoader";
import AmenitiesAccordion from "@/components/AmenitiesAccordion";

import {
  IndianRupee,
  Users,
  ArrowLeft,
} from "lucide-react";

import {
  foodOptions,
  amenitiesOptions,
} from "../constants/dropdownOptions";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [shopActFile, setShopActFile] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);
  const [removedGalleryImages, setRemovedGalleryImages] = useState([]);

  const [formData, setFormData] = useState({
    description: "",
    roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, hall: 0, total: 0 },
    maxGuests: "",
    baseGuests: "",
    pricingPerNightWeekdays: "",
    pricingPerNightWeekend: "",
    extraAdultCharge: "",
    extraChildCharge: "",
    checkInTime: "",
    checkOutTime: "",
    foodAvailability: [],
    amenities: [],
    petFriendly: false,
  });

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        const prop = res.data?.data;
        if (!prop) throw new Error();

        setFormData({
          description: prop.description || "",
          roomBreakdown: prop.roomBreakdown,
          maxGuests: prop.maxGuests,
          baseGuests: prop.baseGuests,
          pricingPerNightWeekdays: `${prop.pricingPerNightWeekdays || ""}`,
          pricingPerNightWeekend: `${prop.pricingPerNightWeekend || ""}`,
          extraAdultCharge: `${prop.extraAdultCharge || ""}`,
          extraChildCharge: `${prop.extraChildCharge || ""}`,
          checkInTime: prop.checkInTime || "",
          checkOutTime: prop.checkOutTime || "",
          foodAvailability: prop.foodAvailability || [],
          amenities: prop.amenities || [],
        });

        setCoverImagePreview(prop.coverImage);
        setGalleryImagePreviews(prop.galleryPhotos || []);
        setShopActPreview(prop.shopAct || null);
      } catch {
        toast.error("Failed to load property");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      const rb = formData.roomBreakdown;
      rb.total = Number(rb.ac) + Number(rb.nonAc) + Number(rb.deluxe) + Number(rb.luxury) + Number(rb.hall);

      Object.entries(formData).forEach(([key, val]) => {
        if (key === "roomBreakdown") {
          Object.entries(val).forEach(([k, v]) =>
            data.append(`roomBreakdown[${k}]`, v)
          );
        } else if (Array.isArray(val)) {
          val.forEach((v) => data.append(`${key}[]`, v));
        } else {
          data.append(key, val ?? "");
        }
      });

      if (coverImageFile) data.append("coverImage", coverImageFile);
      if (shopActFile) data.append("shopAct", shopActFile);
      removedGalleryImages.forEach((url) =>
        data.append("removedGalleryImages[]", url)
      );
      galleryImageFiles.forEach((file) =>
        data.append("galleryPhotos", file)
      );

      await api.put(SummaryApi.updateOwnerProperty(id).url, data);
      toast.success("Property updated!");
      navigate(`/view-property/${id}`);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <FullPageLoader />;

  return (
    <div className="bg-[#f9fafb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-[24px] sm:text-[26px] font-bold">Edit Property</h1>
          <Button variant="outline" onClick={() => navigate(`/view-property/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row flex-wrap gap-6 lg:gap-8"
        >

          {/* LEFT */}
          <div className="space-y-8 w-full lg:w-[48%]">

            <div className="bg-white rounded-2xl border p-4 sm:p-6">
              <Label>Description *</Label>
              <Textarea
                rows={4}
                className="mt-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="bg-white rounded-2xl border p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Rooms & Stay Details
              </h2>

             <div className="flex flex-wrap gap-2 justify-between items-center">
              {["ac", "nonAc", "deluxe", "luxury", "hall", "total"].map((key) => (
                <div key={key} className="flex flex-col gap-2 justify-between items-start">
                  <span className="capitalize">{key === "nonAc" ? "Non AC" : key}</span>
                  <QuantityBox
                    value={formData.roomBreakdown[key]}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        roomBreakdown: { ...formData.roomBreakdown, [key]: val },
                      })
                    }
                  />
                </div>
              ))}
              </div>

                {/* Guests */}
              <div className="grid grid-cols-2 md:grid-cols-3 md:gap-[3.5rem]">
                <div>
                  <Label className="pb-2">Max Guests</Label>
                  <QuantityBox
                    className="pt-2"
                    value={formData.maxGuests}
                    onChange={(val) =>
                      setFormData({ ...formData, maxGuests: val })
                    }
                  />
                </div>

                <div>
                  <Label className="pb-2">Base Guests</Label>
                  <QuantityBox
                    className="pt-2"
                    value={formData.baseGuests}
                    onChange={(val) =>
                      setFormData({ ...formData, baseGuests: val })
                    }
                  />
                </div>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomTimePicker
                  label="Check-In Time"
                  value={formData.checkInTime}
                  onChange={(v) => setFormData({ ...formData, checkInTime: v })}
                />
                <CustomTimePicker
                  label="Check-Out Time"
                  value={formData.checkOutTime}
                  onChange={(v) => setFormData({ ...formData, checkOutTime: v })}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-3">Food</h2>
              <MultiSelectButtons
                selected={formData.foodAvailability}
                onChange={(v) => setFormData({ ...formData, foodAvailability: v })}
                options={foodOptions}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8 w-full lg:w-[48%]">

            <div className="bg-white rounded-2xl border p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Pricing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Weekday Price", "pricingPerNightWeekdays"],
                  ["Weekend Price", "pricingPerNightWeekend"],
                  ["Extra Adult (₹)", "extraAdultCharge"],
                  ["Extra Child (₹)", "extraChildCharge"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      className="bg-[#bec3ff26] mt-2"
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Images & Documents</h2>
              <FileUploadsSection
                setCoverImageFile={setCoverImageFile}
                coverImagePreview={coverImagePreview}
                setCoverImagePreview={setCoverImagePreview}
                shopActFile={shopActFile}
                setShopActFile={setShopActFile}
                shopActPreview={shopActPreview}
                setShopActPreview={setShopActPreview}
                showFields={{ coverImage: true, shopAct: true }}
              />
              <FileUploadsSection
                setGalleryImageFiles={setGalleryImageFiles}
                galleryImagePreviews={galleryImagePreviews}
                setGalleryImagePreviews={setGalleryImagePreviews}
                setRemovedGalleryImages={setRemovedGalleryImages}
                showFields={{ galleryPhotos: true }}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl border p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Amenities</h2>
              <AmenitiesAccordion
                options={amenitiesOptions}
                selected={formData.amenities}
                onChange={(v) => setFormData({ ...formData, amenities: v })}
              />
            </div>
          </div>

          <div className="w-full flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 rounded-xl"
            >
              {loading ? "Updating..." : "Update Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
