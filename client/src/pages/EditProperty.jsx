import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { successToast, errorToast } from '../utils/toastHelper';
import PropertyForm from '../components/EditPropertyForm';

const EditProperty = () => {
    const { id } = useParams();
    const [originalData, setOriginalData] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [existingCoverImageUrl, setExistingCoverImageUrl] = useState("");
    const [existingGalleryImages, setExistingGalleryImages] = useState([]);


    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const { data } = await Axios.get(SummaryApi.getSingleProperty(id).url);
                setFormData(data.data);
                setOriginalData(data.data);
            } catch (err) {
                errorToast("Failed to load property data");
            }
        };
        fetchProperty();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();

            const requiredFields = ['resortOwner', 'propertyName', 'propertyType', 'description', 'addressLine1', 'city', 'state', 'pinCode'
                , 'locationLink', 'totalRooms', 'maxGuests', 'extraGuestCharge', 'pricingPerNight', 'checkInTime', 'checkOutTime', 'confirmationType'
                , 'minStayNights', 'kycVerified', 'publishNow'];

            Object.entries(formData).forEach(([key, value]) => {
                const originalValue = originalData?.[key];
                const isChanged = JSON.stringify(value) !== JSON.stringify(originalValue);
                const isRequired = requiredFields.includes(key);

                if (!isChanged && !isRequired) return;

                if (key === "resortOwner") {
                    data.append(key, JSON.stringify(value));
                } else if (Array.isArray(value)) {
                    value.forEach((v) => data.append(key, v));
                } else {
                    data.append(key, value);
                }
            });

            if (coverImageFile) {
                data.append("coverImage", coverImageFile);
            }

            galleryImageFiles.forEach((file) => {
                data.append("galleryPhotos", file);
            });

            const response = await Axios.put(
                SummaryApi.editProperty(id).url,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            successToast("Property updated successfully");
            navigate("/admin/properties");

        } catch (err) {
            console.error("Error updating property:", err);
            errorToast(err.response?.data?.message || "Something went wrong");
        }
    };


    if (!formData) return <p>Loading...</p>;

    return (
        <>
            <div className='pb-4'>
                <h1 className='text-xl font-bold'>Edit Property</h1>
            </div>
            <PropertyForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                coverImageFile={coverImageFile}
                setCoverImageFile={setCoverImageFile}
                galleryImageFiles={galleryImageFiles}
                setGalleryImageFiles={setGalleryImageFiles}
                existingCoverImageUrl={existingCoverImageUrl}
                setExistingCoverImageUrl={setExistingCoverImageUrl}
                existingGalleryImages={existingGalleryImages}
                setExistingGalleryImages={setExistingGalleryImages}
                isEditMode={true}
            />

        </>
    );
};

export default EditProperty;
