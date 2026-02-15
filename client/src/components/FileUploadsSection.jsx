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
  setExistingGallery = () => {},
  newGalleryFiles = [],
  setNewGalleryFiles = () => {},
  newGalleryPreviews = [],
  setNewGalleryPreviews = () => {},

  showFields = { coverImage: true, shopAct: true, galleryPhotos: true },

  minGallery = 3,
  maxGallery = 10,
}) => {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const shopActInputRef = useRef(null);

  // -------- Cover Image ----------
  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);

    setCoverImageFile && setCoverImageFile(file);
    setCoverImagePreview && setCoverImagePreview(URL.createObjectURL(file));
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

    const totalCount = existingGallery.length + newGalleryFiles.length + files.length;
    if (totalCount > maxGallery) {
      alert(`Max ${maxGallery} images allowed`);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    const previews = files.map((f) => URL.createObjectURL(f));

    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...previews]);

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

          <div className="mt-2 border flex items-center gap-2 bg-white p-4 rounded-[10px] ">
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

          <div className="mt-2 flex items-center gap-2 bg-white p-4 rounded-[10px] border">
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
                <div key={`new-${index}`} className="relative w-20 h-20">
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
                    title="Remove"
                  >
                    <RxCross2 size={12} />
                  </Button>
                  {newGalleryFiles[index]?.name && (
                    <div className="absolute -bottom-5 left-0 right-0 text-[10px] text-center truncate">
                      {newGalleryFiles[index].name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadsSection;
