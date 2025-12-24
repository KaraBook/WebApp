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

  /* ================= COVER ================= */
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  /* ================= SHOP ACT ================= */
  const [shopActFile, setShopActFile] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);

  /* ================= GALLERY (MATCHES EditProperty) ================= */
  const [existingGallery, setExistingGallery] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  const [publishNow, setPublishNow] = useState(false);

  /* ================= LOAD PROPERTY ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await Axios(SummaryApi.getSingleProperty(id));
        const p = res?.data?.data;

        setProperty(p);
        setPublishNow(!!p?.publishNow);

        setCoverImagePreview(p?.coverImage || null);
        setShopActPreview(p?.shopAct || null);
        setExistingGallery(p?.galleryPhotos || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= VALIDATION ================= */
  const validateFiles = () => {
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

    if (!shopActFile && !property?.shopAct) {
      return "Shop Act file is required.";
    }

    if (shopActFile) {
      const valid =
        ALLOWED_IMAGE_TYPES.includes(shopActFile.type) ||
        shopActFile.type === "application/pdf";

      if (!valid || shopActFile.size > MAX_FILE_MB * 1024 * 1024) {
        return "Shop Act must be image/PDF under 5MB.";
      }
    }

    const totalGallery =
      existingGallery.length + newGalleryFiles.length;

    if (totalGallery < 3) {
      return "Minimum 3 gallery images are required.";
    }

    for (const f of newGalleryFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(f.type) ||
        f.size > MAX_FILE_MB * 1024 * 1024
      ) {
        return "Gallery images must be JPG/PNG/WEBP under 5MB.";
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
      fd.append("existingGallery", JSON.stringify(existingGallery));

      if (coverImageFile) fd.append("coverImage", coverImageFile);
      if (shopActFile) fd.append("shopAct", shopActFile);

      newGalleryFiles.forEach((file) =>
        fd.append("galleryPhotos", file)
      );

      const { url, method } = SummaryApi.finalizeProperty(id);

      await Axios({
        url,
        method,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Media uploaded & property published");
      navigate("/properties", { state: { refresh: true } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageLoader />;

  return (
    <div className="p-3 w-full mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6">
        Attach Media — {property?.propertyName}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-wrap gap-4">
        {/* Shop Act */}
        <div className="w-[48%] min-w-[320px]">
          <FileUploadsSection
            shopActFile={shopActFile}
            setShopActFile={setShopActFile}
            shopActPreview={shopActPreview}
            setShopActPreview={setShopActPreview}
            showFields={{ shopAct: true }}
          />
        </div>

        {/* Publish */}
        <div className="w-[48%] min-w-[320px] mt-2">
          <SingleSelectDropdown
            label="Publish Now"
            value={publishNow}
            options={publishNowOptions}
            onChange={setPublishNow}
          />
        </div>

        {/* Cover + Gallery */}
        <div className="w-full">
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

            showFields={{ coverImage: true, galleryPhotos: true }}
          />
        </div>

        <div className="ml-auto flex gap-2 mt-6">
          <Button type="button" onClick={() => navigate(-1)}>
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
