import React, { useState, useRef, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FileUploadsSection = ({
  setCoverImageFile,
  setGalleryImageFiles,
  existingGalleryImages = [],
  setExistingGalleryImages,
  existingCoverImageUrl = "",
  setExistingCoverImageUrl,
}) => {
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [coverInputKey, setCoverInputKey] = useState(Date.now());
  const [galleryInputKey, setGalleryInputKey] = useState(Date.now());


  useEffect(() => {
    setCoverImagePreview(existingCoverImageUrl || null);
  }, [existingCoverImageUrl]);

  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setExistingCoverImageUrl("");
      setCoverInputKey(Date.now());
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverInputKey(Date.now());
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setExistingCoverImageUrl("");
    if (coverInputRef.current) coverInputRef.current.value = null;
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3 || files.length > 10) {
      alert("Please select between 3 to 10 images.");
      setGalleryInputKey(Date.now());
      return;
    }

    setGalleryImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryImagePreviews(previews);
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImagePreviews((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) setGalleryInputKey(Date.now());
      return updated;
    });

    setGalleryImageFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) setGalleryInputKey(Date.now()); return updated;
    });
  };

  const handleRemoveExistingGalleryImage = (index) => {
    const updated = [...existingGalleryImages];
    updated.splice(index, 1);
    setExistingGalleryImages(updated);
  };

  return (
    <div className="mt-2 w-full flex justify-between gap-4">
      {/* Cover Image Upload */}
      <div className="w-[48%]">
        <Label htmlFor="coverImage" className="font-medium">
          Cover Image <span className="text-red-500">*</span>
        </Label>
        <Input
          key={coverInputKey}
          id="coverImage"
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="mt-2"
          ref={coverInputRef}
        />
        {(coverImagePreview || existingCoverImageUrl) && (
          <div className="relative w-20 h-20 mt-3">
            <img
              src={coverImagePreview || existingCoverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleRemoveCoverImage}
              className="absolute top-1 right-1 p-1 h-5 w-5"
            >
              <RxCross2 size={12} />
            </Button>
          </div>
        )}
      </div>

      {/* Gallery Photos Upload */}
      <div className="w-[48%]">
        <Label htmlFor="galleryPhotos" className="font-medium">
          Gallery Photos (Min 3, Max 10)
        </Label>
        <Input
          key={galleryInputKey}
          id="galleryPhotos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryImagesChange}
          className="mt-2"
          ref={galleryInputRef}
        />
        {galleryImagePreviews.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {galleryImagePreviews.length} file{galleryImagePreviews.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Existing Gallery Images */}
        {existingGalleryImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {existingGalleryImages.map((imgUrl, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={imgUrl}
                  alt={`Existing ${index}`}
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveExistingGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 h-5 w-5"
                >
                  <RxCross2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* New Gallery Upload Previews */}
        {galleryImagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {galleryImagePreviews.map((src, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={src}
                  alt={`Gallery ${index}`}
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 h-5 w-5"
                >
                  <RxCross2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadsSection;
