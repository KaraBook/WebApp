// src/pages/FinalizeMedia.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FileUploadsSection from "@/components/FileUploadsSection";
import SingleSelectDropdown from "@/components/SingleSelectDropdown";
import { publishNowOptions } from "@/constants/dropdownOptions";
import FullPageLoader from "@/components/FullPageLoader";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_MB = 5;

export default function FinalizeMedia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Media state
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [shopActFile, setShopActFile] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);

  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  const [publishNow, setPublishNow] = useState(false);

  /* ================= LOAD PROPERTY ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await Axios(SummaryApi.getSingleProperty(id));
        const p = res?.data?.data;

        setProperty(p || null);
        setPublishNow(!!p?.publishNow);

        // preload previews (important UX)
        setCoverImagePreview(p?.coverImage || null);
        setShopActPreview(p?.shopAct || null);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= VALIDATION ================= */
  const validateFiles = () => {
    // Cover
    if (!coverImageFile && !property?.coverImage) {
      return "Cover image is required.";
    }

    if (
      coverImageFile &&
      (!ALLOWED_IMAGE_TYPES.includes(coverImageFile.type) ||
        coverImageFile.size > MAX_FILE_MB * 1024 * 1024)
    ) {
      return "Cover image must be JPG/PNG/WEBP under 5MB.";
    }

    // Shop Act
    if (!shopActFile && !property?.shopAct) {
      return "Shop Act file is required.";
    }

    if (shopActFile) {
      const isValid =
        ALLOWED_IMAGE_TYPES.includes(shopActFile.type) ||
        shopActFile.type === "application/pdf";

      if (!isValid || shopActFile.size > MAX_FILE_MB * 1024 * 1024) {
        return "Shop Act must be an image or PDF under 5MB.";
      }
    }

    // Gallery (MIN 3 TOTAL)
    const existingCount = property?.galleryPhotos?.length || 0;
    const newCount = galleryImageFiles.length;
    const totalGallery = existingCount + newCount;

    if (totalGallery < 3) {
      return "Minimum 3 gallery images are required.";
    }

    for (const f of galleryImageFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(f.type) ||
        f.size > MAX_FILE_MB * 1024 * 1024
      ) {
        return "All gallery images must be JPG/PNG/WEBP under 5MB.";
      }
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (e) => {
    e.preventDefault();

    const error = validateFiles();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("publishNow", String(!!publishNow));

      if (coverImageFile) fd.append("coverImage", coverImageFile);
      if (shopActFile) fd.append("shopAct", shopActFile);

      // ✅ IMPORTANT: send existing gallery (same as EditProperty)
      fd.append(
        "existingGallery",
        JSON.stringify(property?.galleryPhotos || [])
      );

      galleryImageFiles.forEach((f) => {
        fd.append("galleryPhotos", f);
      });

      const { url, method } = SummaryApi.finalizeProperty(id);

      await Axios({
        url,
        method,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Media uploaded & property published!");
      navigate("/admin/properties", { state: { refresh: true } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload media");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageLoader />;

  return (
    <div className="p-3 w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">
          Attach Media — {property?.propertyName}
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/properties/drafts")}
          >
            Back to Drafts
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex w-full flex-wrap justify-between gap-4"
      >
        {/* Shop Act */}
        <div className="w-[48%] min-w-[320px] -mt-2">
          <FileUploadsSection
            setShopActFile={setShopActFile}
            shopActFile={shopActFile}
            shopActPreview={shopActPreview}
            setShopActPreview={setShopActPreview}
            showFields={{ coverImage: false, galleryPhotos: false, shopAct: true }}
          />
        </div>

        {/* Publish */}
        <div className="w-[48%] min-w-[320px]">
          <SingleSelectDropdown
            label="Publish Now"
            value={publishNow}
            options={publishNowOptions}
            onChange={(val) => setPublishNow(val)}
            placeholder="Select Publish Status"
          />
        </div>

        {/* Cover + Gallery */}
        <div className="w-full">
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
          />
        </div>

        <div className="w-full border mt-6"></div>

        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Uploading..." : "Upload & Publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
