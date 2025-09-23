// src/pages/FinalizeMedia.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
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

  // Media state (mirrors AddProperty)
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [shopActFile, setShopActFile] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);

  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  // Publish now (same control you use in AddProperty)
  const [publishNow, setPublishNow] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios(SummaryApi.getSingleProperty(id));
        const p = res?.data?.data;
        setProperty(p || null);
        // If draft already has a preference, reflect it; otherwise default false
        setPublishNow(!!p?.publishNow);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filesOk = () => {
    if (!coverImageFile) {
      return { ok: false, message: "Cover image is required." };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(coverImageFile.type) || coverImageFile.size > MAX_FILE_MB * 1024 * 1024) {
      return { ok: false, message: "Cover image must be JPG/PNG/WEBP under 5MB." };
    }

    if (!shopActFile) {
      return { ok: false, message: "Shop Act file is required." };
    }
    const isShopActOk =
      ALLOWED_IMAGE_TYPES.includes(shopActFile.type) || shopActFile.type === "application/pdf";
    if (!isShopActOk || shopActFile.size > MAX_FILE_MB * 1024 * 1024) {
      return { ok: false, message: "Shop Act must be an image (JPG/PNG/WEBP) or PDF under 5MB." };
    }

    if (!galleryImageFiles.length) {
      return { ok: false, message: "Please add at least one gallery photo." };
    }
    for (const f of galleryImageFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type) || f.size > MAX_FILE_MB * 1024 * 1024) {
        return { ok: false, message: "All gallery photos must be JPG/PNG/WEBP under 5MB." };
      }
    }
    return { ok: true };
  };

  const onSubmit = async (e) => {
  e?.preventDefault?.();

  if (!coverImageFile && !property?.coverImage) {
    toast.error("Cover image is required.");
    return;
  }
  if (!galleryImageFiles.length && (!property?.galleryPhotos || property.galleryPhotos.length === 0)) {
    toast.error("Please add at least one gallery photo.");
    return;
  }

  setSubmitting(true);
  try {
    const fd = new FormData();
    fd.append("publishNow", String(!!publishNow));

    if (coverImageFile) fd.append("coverImage", coverImageFile);
    if (shopActFile) fd.append("shopAct", shopActFile);
    galleryImageFiles.forEach((f) => fd.append("galleryPhotos", f));

    const { url, method } = SummaryApi.finalizeProperty(id);
    await Axios({
      url,
      method,
      data: fd,
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Media uploaded. Property published!");
    // 👇 pass refresh flag to properties page
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
          Attach Media{property ? ` — ${property.propertyName}` : ""}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/properties/drafts")}>
            Back to Drafts
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {/* Layout matches your AddProperty media step */}
      <form onSubmit={onSubmit} className="flex w-full flex-wrap justify-between gap-4">
        {/* Shop Act first (you used this order in AddProperty step) */}
        <div className="w-[48%] min-w-[320px] -mt-2">
          <FileUploadsSection
            setShopActFile={setShopActFile}
            shopActFile={shopActFile}
            shopActPreview={shopActPreview}
            setShopActPreview={setShopActPreview}
            showFields={{ coverImage: false, galleryPhotos: false, shopAct: true }}
          />
        </div>

        {/* Publish Now selector (same component and options as AddProperty) */}
        <div className="w-[48%] min-w-[320px]">
          <SingleSelectDropdown
            label="Publish Now"
            value={publishNow}
            options={publishNowOptions}
            onChange={(val) => setPublishNow(val)}
            placeholder="Select Publish Status"
          />
        </div>

        {/* Cover + Gallery block (identical to AddProperty UI) */}
        <div className="w-full">
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
        </div>

        {/* Actions */}
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
