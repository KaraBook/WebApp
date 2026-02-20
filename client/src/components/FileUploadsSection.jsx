import React, { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FileUploadsSection = ({
  setCoverImageFile,
  coverImageFile,
  coverImagePreview,
  setCoverImagePreview,

  setShopActFile,
  shopActFile,
  shopActPreview,
  setShopActPreview,

  existingGallery = [],
  setExistingGallery = () => { },
  newGalleryFiles = [],
  setNewGalleryFiles = () => { },
  newGalleryPreviews = [],
  setNewGalleryPreviews = () => { },

  showFields = { coverImage: true, shopAct: true, galleryPhotos: true },

  minGallery = 3,
  maxGallery = 10,
  errors = {},
  clearFieldError,
}) => {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const shopActInputRef = useRef(null);

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldError("coverImage", "Only JPG, PNG, WEBP allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFieldError("coverImage", "Image must be under 5MB");
      return;
    }
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    clearFieldError("coverImage");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile && setCoverImageFile(null);
    setCoverImagePreview && setCoverImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // -------- Shop Act --------------
  const handleShopActChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (shopActPreview) URL.revokeObjectURL(shopActPreview);

    setShopActFile && setShopActFile(file);
    setShopActPreview && setShopActPreview(URL.createObjectURL(file));
    if (shopActInputRef.current) shopActInputRef.current.value = "";
  };

  const handleRemoveShopAct = () => {
    if (shopActPreview) URL.revokeObjectURL(shopActPreview);
    setShopActFile && setShopActFile(null);
    setShopActPreview && setShopActPreview(null);
    if (shopActInputRef.current) shopActInputRef.current.value = "";
  };

  // -------- Gallery ----------------
  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFieldError("galleryPhotos", "Only JPG, PNG, WEBP files allowed");
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_SIZE) {
        setFieldError("galleryPhotos", "Each image must be less than 5MB");
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        return;
      }
    }
    const totalCount =
      existingGallery.length + newGalleryFiles.length + files.length;
    if (totalCount > maxGallery) {
      setFieldError(
        "galleryPhotos",
        `Maximum ${maxGallery} images allowed`
      );
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...previews]);
    clearFieldError("galleryPhotos");
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };


  const removeExisting = (index) => {
    const updated = existingGallery.filter((_, i) => i !== index);
    setExistingGallery(updated);
  };

  const removeNew = (index) => {
    const preview = newGalleryPreviews[index];
    if (preview) URL.revokeObjectURL(preview);

    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalGalleryCount = existingGallery.length + newGalleryFiles.length;

  return (
    <div className="mt-2 w-full flex flex-wrap md:flex-nowrap justify-between gap-4">
      {/* Cover Image */}
      {showFields.coverImage && (
        <div className="md:w-[48%] w-[100%]">
          <Label htmlFor="coverImage" className="font-medium">
            Cover Image <span className="text-red-500">*</span>
          </Label>

          <div className={`mt-2 flex items-center gap-2 bg-white p-4 rounded-[10px] border 
               ${errors.coverImage ? "border-red-500" : "border-gray-300"} `}>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              ref={coverInputRef}
              className="hidden"
            />
            <Button
              type="button"
              className="bg-[#e5e7eb] text-black hover:bg-[#e5e7eb]"
              onClick={() => coverInputRef.current?.click()}
            >
              Choose File
            </Button>
            <span className="text-sm text-gray-600 truncate max-w-[150px]">
              {coverImageFile?.name || "No file chosen"}
            </span>
          </div>

          {coverImagePreview && (
            <div className="relative w-20 h-20 mt-3">
              <img
                src={coverImagePreview}
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
          {errors.coverImage && (
            <p className="text-red-500 text-xs mt-2">
              {errors.coverImage}
            </p>
          )}
        </div>
      )}

      {/* Shop Act */}
      {showFields.shopAct && (
        <div className="w-[100%]">
          <Label htmlFor="shopAct" className="font-medium">
            Shop Act (Optional)
          </Label>

          <div className="mt-2 flex items-center gap-2 bg-white p-4 rounded-[10px] border">
            <Input
              id="shopAct"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleShopActChange}
              ref={shopActInputRef}
              className="hidden"
            />
            <Button
              type="button"
              className="bg-[#e5e7eb] text-black hover:bg-[#e5e7eb]"
              onClick={() => shopActInputRef.current?.click()}
            >
              Choose File
            </Button>
            <span className="text-sm text-gray-600 truncate max-w-[150px]">
              {shopActFile?.name || "No file chosen"}
            </span>
          </div>

          {shopActPreview && (
            <div className="relative w-20 h-20 mt-3">
              <img
                src={shopActPreview}
                alt="Shop Act"
                className="w-full h-full object-cover rounded"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleRemoveShopAct}
                className="absolute top-1 right-1 p-1 h-5 w-5"
              >
                <RxCross2 size={12} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Photos */}
      {showFields.galleryPhotos && (
        <div className="md:w-[48%] w-[100%]">
          <Label htmlFor="galleryPhotos" className="font-medium">
            Gallery Photos (Min {minGallery}, Max {maxGallery})
          </Label>

          <div className={`mt-2 flex items-center gap-2 bg-white p-4 rounded-[10px] border
               ${errors.galleryPhotos ? "border-red-500" : "border-gray-300"} `}>
            <Input
              id="galleryPhotos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              ref={galleryInputRef}
              className="hidden"
            />
            <Button
              type="button"
              className="bg-[#e5e7eb] text-black hover:bg-[#e5e7eb]"
              onClick={() => galleryInputRef.current?.click()}
            >
              Choose Files
            </Button>
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {totalGalleryCount > 0
                ? `${totalGalleryCount} file(s) selected`
                : "No files chosen"}
            </span>
          </div>

          {(existingGallery.length > 0 || newGalleryPreviews.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {/* Existing from backend */}
              {existingGallery.map((src, index) => (
                <div key={`existing-${index}`} className="relative w-20 h-20">
                  <img
                    src={src}
                    alt={`Existing ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeExisting(index)}
                    className="absolute top-1 right-1 p-1 h-5 w-5"
                    title="Remove"
                  >
                    <RxCross2 size={12} />
                  </Button>
                </div>
              ))}

              {/* Newly added in this session */}
              {newGalleryPreviews.map((src, index) => (
                <div key={`new-${index}`} className="w-20">
                  <div className="relative w-20 h-20">
                    <img
                      src={src}
                      alt={`New ${index}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeNew(index)}
                      className="absolute top-1 right-1 p-1 h-5 w-5"
                    >
                      <RxCross2 size={12} />
                    </Button>
                  </div>

                  {/* FILE NAME BELOW IMAGE */}
                  <p className="text-[10px] text-center mt-1 truncate">
                    {newGalleryFiles[index]?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
          {errors.galleryPhotos && (
            <p className="text-red-500 text-xs mt-2">
              {errors.galleryPhotos}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadsSection;
