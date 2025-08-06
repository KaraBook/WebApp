// src/components/PropertyForm.jsx
import React, { useEffect, useState } from "react";
import { getIndianStates, getCitiesByState } from "../utils/locationUtils";
import SingleSelectDropdown from "./SingleSelectDropdown";
import { propertyTypeOptions } from "../constants/dropdownOptions";
import FileUploadsSection from "../components/FileUploadsSection";
import { successToast } from "../utils/toastHelper";
import Axios from "../utils/Axios";

const PropertyForm = ({ formData, setFormData, onSubmit, 
  submitLabel, 
  coverImageFile, 
  setCoverImageFile,
  galleryImageFiles,
  setGalleryImageFiles, }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState("");

  useEffect(() => {
    setStates(getIndianStates());
    if (formData.state) {
      setCities(getCitiesByState(formData.state));
    }
  }, []);

  useEffect(() => {
    if (formData.state) {
      const updatedCities = getCitiesByState(formData.state);
      setCities(updatedCities);
    }
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "state") {
      const selectedCities = getCitiesByState(value);
      setCities(selectedCities);
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

useEffect(() => {

  if (formData && formData.coverImage) {
    console.log("Setting existingCoverImageUrl to:", formData.coverImage);
    setExistingCoverImageUrl(formData.coverImage); 
  }
  
  if (formData && formData.galleryPhotos) {
    setExistingGalleryImages(formData.galleryPhotos);
  }
}, [formData]);




  return (
    <form onSubmit={onSubmit} className="flex w-full flex-wrap justify-between gap-1">
      {/* Property Name */}
      <div className="w-[48%]">
        <label className="block font-small">
          Property Name<span className="text-red-500"> *</span>
        </label>
        <input
          type="text"
          name="propertyName"
          className="w-full border p-2 rounded mt-2"
          value={formData.propertyName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Property Type */}
      <div className="w-[48%]">
        <SingleSelectDropdown
          label="Property Type"
          options={propertyTypeOptions}
          value={formData.propertyType}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, propertyType: val }))
          }
        />
      </div>

      {/* Resort Owner Name */}
      <div className="w-[48%]">
        <label className="block font-small">
          Resort Owner Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="resortOwnerName"
          className="w-full border p-2 rounded mt-2"
          value={formData.resortOwner.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              resortOwner: {
                ...prev.resortOwner,
                name: e.target.value,
              },
            }))
          }
          required
        />
      </div>

      {/* Resort Owner Contact Number */}
      <div className="w-[48%]">
        <label className="block font-small">
          Resort Owner Contact No<span className="text-red-500"> *</span>
        </label>
        <input
          type="tel"
          name="resortOwnerContact"
          className="w-full border p-2 rounded mt-2"
          value={formData.resortOwner.contact}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setFormData((prev) => ({
                ...prev,
                resortOwner: {
                  ...prev.resortOwner,
                  contact: value,
                },
              }));
            }
          }}
          maxLength={10}
          required
        />
      </div>

      {/* Address Line 1 */}
      <div className="w-[48%]">
        <label className="block font-small">
          Address Line 1<span className="text-red-500"> *</span>
        </label>
        <input
          type="text"
          name="addressLine1"
          className="w-full border p-2 rounded mt-2"
          value={formData.addressLine1}
          onChange={handleChange}
          required
        />
      </div>

      {/* Address Line 2 */}
      <div className="w-[48%]">
        <label className="block font-small">
          Address Line 2
        </label>
        <input
          type="text"
          name="addressLine2"
          className="w-full border p-2 rounded mt-2"
          value={formData.addressLine2}
          onChange={handleChange}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="w-full">
        <label className="block font-small">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          className="w-full border p-2 rounded mt-2"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          minLength={30}
          maxLength={500}
          required
        />
      </div>

      {/* State Dropdown */}
      <div className="w-[48%]">
        <label className="block font-small">State<span className="text-red-500">*</span></label>
        <select
          name="state"
          className="w-full border p-2 rounded mt-2"
          value={formData.state}
          onChange={handleChange}
          required
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div className="w-[48%]">
        <label className="block font-small">City<span className="text-red-500">*</span></label>
        <select
          name="city"
          className="w-full border p-2 rounded mt-2"
          value={formData.city}
          onChange={handleChange}
          required
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* PinCode */}
      <div className="w-[48%]">
        <label className="block font-small">
          Pin Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pinCode"
          maxLength="6"
          className="w-full border p-2 rounded mt-2"
          value={formData.pinCode}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,6}$/.test(value)) {
              setFormData((prev) => ({
                ...prev,
                pinCode: value,
              }));
            }
          }}
          required
        />
      </div>

      {/* MapLink */}
      <div className="w-[48%]">
        <label className="block font-small">
          Google Maps Location Link <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          name="locationLink"
          className="w-full border p-2 rounded mt-2"
          placeholder="https://maps.google.com/..."
          value={formData.locationLink}
          onChange={(e) => {
            const value = e.target.value;
            setFormData((prev) => ({
              ...prev,
              locationLink: value,
            }));
          }}
          pattern="https://.*"
          required
        />
      </div>


      {/* Total Units */}
      <div className="w-[48%]">
        <label className="block font-small">
          Total Rooms / Units <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="totalRooms"
          className="w-full border p-2 rounded mt-2"
          value={formData.totalRooms}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,3}$/.test(value)) {
              setFormData((prev) => ({
                ...prev,
                totalRooms: value,
              }));
            }
          }}
          required
          placeholder="Enter number of units"
        />
      </div>

      {/* Max Guests Allowed */}
      <div className="w-[48%]">
        <label className="block font-small">
          Max Guests Allowed <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="maxGuests"
          className="w-full border p-2 rounded mt-2"
          value={formData.maxGuests}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,3}$/.test(value)) {
              setFormData((prev) => ({
                ...prev,
                maxGuests: value,
              }));
            }
          }}
          required
          placeholder="Enter max guests allowed"
        />
      </div>

    <FileUploadsSection
  setCoverImageFile={setCoverImageFile}
  setGalleryImageFiles={setGalleryImageFiles}
  existingGalleryImages={existingGalleryImages}
  setExistingGalleryImages={setExistingGalleryImages}
  existingCoverImageUrl={existingCoverImageUrl}
  setExistingCoverImageUrl={setExistingCoverImageUrl}
/>




      {/* Submit Button */}
      <div className="w-full mt-6">
        <button
          type="submit"
          className="bg-[#f36820] text-white px-6 py-2 rounded hover:bg-[#d85615]"
        >
          {submitLabel || "Submit"}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
