import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import MultiSelectButtons from "../components/MultiSelectButtons";
import FileUploadsSection from "../components/FileUploadsSection";
import CustomTimePicker from "../components/CustomTimePicker";
import { QuantityBox } from "@/components/QuantityBox";
import FullPageLoader from "@/components/FullPageLoader";
import AmenitiesAccordion from "@/components/AmenitiesAccordion";

import {
  Home,
  IndianRupee,
  Users,
  PawPrint,
  Images,
  ArrowLeft,
} from "lucide-react";

import {
  foodOptions,
  amenitiesOptions,
  petFriendlyOptions,
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
    roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
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

        if (!prop) throw new Error("Property not found");

        if (prop.isDraft || prop.isBlocked || !prop.publishNow) {
          toast.error("You cannot edit this property right now.");
          navigate(`/view-property/${id}`);
          return;
        }

        setFormData({
          description: prop.description || "",
          roomBreakdown: prop.roomBreakdown || {
            ac: 0,
            nonAc: 0,
            deluxe: 0,
            luxury: 0,
            total: 0,
          },
          maxGuests: prop.maxGuests || "",
          baseGuests: prop.baseGuests || "",
          pricingPerNightWeekdays: `${prop.pricingPerNightWeekdays || ""}`,
          pricingPerNightWeekend: `${prop.pricingPerNightWeekend || ""}`,
          extraAdultCharge: `${prop.extraAdultCharge || ""}`,
          extraChildCharge: `${prop.extraChildCharge || ""}`,
          checkInTime: prop.checkInTime || "",
          checkOutTime: prop.checkOutTime || "",
          foodAvailability: prop.foodAvailability || [],
          amenities: prop.amenities || [],
          petFriendly: !!prop.petFriendly,
        });

        setCoverImagePreview(prop.coverImage || null);
        setGalleryImagePreviews(prop.galleryPhotos || []);
        setShopActPreview(prop.shopAct || null);
      } catch (err) {
        toast.error("Failed to load property details.");
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
      const total =
        Number(rb.ac) +
        Number(rb.nonAc) +
        Number(rb.deluxe) +
        Number(rb.luxury);

      formData.roomBreakdown.total = total;

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

      if (!coverImagePreview && !coverImageFile)
        data.append("removedCoverImage", "true");

      if (!shopActPreview && !shopActFile)
        data.append("removedShopAct", "true");

      removedGalleryImages.forEach((url) =>
        data.append("removedGalleryImages[]", url)
      );

      galleryImageFiles.forEach((file) =>
        data.append("galleryPhotos", file)
      );

      await api.put(SummaryApi.updateOwnerProperty(id).url, data);

      toast.success("Property updated!");
      navigate(`/view-property/${id}`);
    } catch (err) {
      toast.error("Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <FullPageLoader />;

  return (
    <div className="bg-[#f9fafb] min-h-screen px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-3">
            Edit Property
          </h1>

          <Button
            variant="outline"
            onClick={() => navigate(`/view-property/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>


        <form onSubmit={handleSubmit} className="flex flex-wrap items-start justify-start gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-8 w-[48%]">

            {/* DESCRIPTION */}
            <div className="bg-white rounded-2xl border p-6">
              <Label>Description *</Label>
              <Textarea
                rows={4}
                className="mt-2"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* ROOMS & STAY DETAILS */}
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Rooms & Stay Details
              </h2>

              {/* Room Breakdown */}
              {["ac", "nonAc", "deluxe", "luxury"].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">
                    {key === "nonAc" ? "Non AC" : key}
                  </span>
                  <QuantityBox
                    value={formData.roomBreakdown[key]}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        roomBreakdown: {
                          ...formData.roomBreakdown,
                          [key]: val,
                        },
                      })
                    }
                  />
                </div>
              ))}

              {/* Guests */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Check In / Out */}
              <div className="flex flex-wrap justify-between">
                <CustomTimePicker
                  label="Check-In Time"
                  value={formData.checkInTime}
                  onChange={(val) =>
                    setFormData({ ...formData, checkInTime: val })
                  }
                />
                <CustomTimePicker
                  label="Check-Out Time"
                  value={formData.checkOutTime}
                  onChange={(val) =>
                    setFormData({ ...formData, checkOutTime: val })
                  }
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold -mt-[11px]">Food</h2>
              {/* Food */}
              <MultiSelectButtons
              className="mt-[0px]"
                selected={formData.foodAvailability}
                onChange={(val) =>
                  setFormData({ ...formData, foodAvailability: val })
                }
                options={foodOptions}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8 w-[48%]">

            {/* PRICING */}
            <div className="bg-white rounded-2xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Pricing
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weekday Price</Label>
                  <Input
                    className="bg-[#bec3ff26] text-[15px] p-[20px] mt-[7px]"
                    value={formData.pricingPerNightWeekdays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricingPerNightWeekdays: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Weekend Price</Label>
                  <Input
                    className="bg-[#bec3ff26] text-[15px] p-[20px] mt-[7px]"
                    value={formData.pricingPerNightWeekend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricingPerNightWeekend: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Extra Adult (₹ / night)</Label>
                  <Input
                    className="bg-[#bec3ff26] text-[15px] p-[20px] mt-[7px]"
                    value={formData.extraAdultCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraAdultCharge: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Extra Child (₹ / night)</Label>
                  <Input
                    className="bg-[#bec3ff26] text-[15px] p-[20px] mt-[7px]"
                    value={formData.extraChildCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraChildCharge: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* IMAGES */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Images & Documents
              </h2>

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

          {/* AMENITIES & FOOD */}
          <div className="w-[100%]">
            <div className="bg-white rounded-2xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Amenities </h2>
                <AmenitiesAccordion
                  options={amenitiesOptions}
                  selected={formData.amenities}
                  onChange={(val) =>
                    setFormData({ ...formData, amenities: val })
                  }
                />
            </div>
          </div>

           {/* SUBMIT */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-primary text-white"
              >
                {loading ? "Updating..." : "Update Property"}
              </Button>
            </div>

        </form>
      </div>
    </div>
  );
}
