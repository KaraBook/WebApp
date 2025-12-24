import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import FullPageLoader from "@/components/FullPageLoader";
import { errorToast } from "../utils/toastHelper";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { amenitiesCategories } from "../constants/dropdownOptions";
import {
  MapPin, Clock, Users, BedDouble, IndianRupee, CheckCircle2, XCircle, ShieldCheck, Image as ImageIcon,
  FileText, ArrowLeft, Edit3, Link2, Check, Star,
} from "lucide-react";

const isImageUrl = (url = "") =>
  /\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i.test(url.split("?")[0] || "");

const Field = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-sm text-muted-foreground min-w-[160px]">{label}</span>
    <div className="text-sm font-medium flex-1">{children || "-"}</div>
  </div>
);

const SectionTitle = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2">
    {Icon ? <Icon className="h-4 w-4" /> : null}
    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
      {children}
    </h3>
  </div>
);

const amenityLabelMap = amenitiesCategories
  .flatMap(cat => cat.items)
  .reduce((acc, item) => {
    acc[item.value] = item.label;
    return acc;
  }, {});

const ViewProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await Axios.get(SummaryApi.getSingleProperty(id).url);
        setProperty(res.data?.data || null);
      } catch (err) {
        console.error(err);
        errorToast(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="p-3 w-full mx-auto">
        <FullPageLoader />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Property not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    propertyName,
    propertyType,
    description,
    resortOwner,
    addressLine1,
    addressLine2,
    city,
    state,
    area,
    pinCode,
    locationLink,
    roomBreakdown = { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, total: 0 },
    totalRooms,
    maxGuests,
    petFriendly,
    isRefundable,
    refundNotes,
    pricingPerNightWeekdays,
    pricingPerNightWeekend,
    extraAdultCharge,
    extraChildCharge,
    checkInTime,
    checkOutTime,
    minStayNights,
    foodAvailability = [],
    amenities = [],
    pan,
    kycVerified,
    publishNow,
    featured,
    approvalStatus,
    internalNotes,
    coverImage,
    shopAct,
    galleryPhotos = [],
    createdAt,
    updatedAt,
  } = property;

  const statusBadge = (() => {
    switch (approvalStatus) {
      case "approved":
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  })();

  return (
    <div className="p-3 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {propertyName}
            {featured ? (
              <Badge className="bg-yellow-500 text-black hover:bg-yellow-500 flex items-center gap-1">
                <Star className="h-3 w-3" /> Featured
              </Badge>
            ) : null}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <Badge variant="outline" className="capitalize">{propertyType}</Badge>
            {statusBadge}
            <Badge variant={publishNow ? "default" : "secondary"} className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              {publishNow ? "Published" : "Not Published"}
            </Badge>
            <Badge className={kycVerified ? "bg-emerald-600" : "bg-amber-600"}>
              {kycVerified ? "KYC Verified" : "KYC Pending"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[#f4f4f4]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => navigate(`/edit-property/${id}`)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="xl:col-span-1 space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Cover Image
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {coverImage ? (
                <a href={coverImage} target="_blank" rel="noreferrer">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full aspect-video object-cover rounded-xl border"
                  />
                </a>
              ) : (
                <div className="w-full aspect-video rounded-xl bg-muted grid place-items-center text-muted-foreground">
                  No cover image
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shop Act */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Shop Act
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {shopAct ? (
                isImageUrl(shopAct) ? (
                  <a href={shopAct} target="_blank" rel="noreferrer">
                    <img
                      src={shopAct}
                      alt="Shop Act"
                      className="w-full rounded-xl border object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={shopAct}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline inline-flex items-center gap-1"
                  >
                    <Link2 className="h-4 w-4" />
                    Open document
                  </a>
                )
              ) : (
                <div className="text-sm text-muted-foreground">No file uploaded</div>
              )}
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Gallery ({galleryPhotos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {galleryPhotos.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {galleryPhotos.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="h-24 w-full object-cover rounded-md border hover:opacity-90 transition"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No gallery images</div>
              )}
            </CardContent>
          </Card>

           <Card>
              <CardHeader className="pb-2">
                <SectionTitle icon={IndianRupee}>Pricing</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Weekday Price (₹ / night)">
                  ₹{pricingPerNightWeekdays?.toLocaleString("en-IN")}
                </Field>

                <Field label="Weekend Price (₹ / night)">
                  ₹{pricingPerNightWeekend?.toLocaleString("en-IN")}
                </Field>

                <Field label="Extra Guest Charge (₹ / guest / night)">
                  {extraAdultCharge !== undefined && extraAdultCharge !== null
                    ? `₹${extraAdultCharge.toLocaleString("en-IN")}`
                    : "-"}
                </Field>
                <Field label="Extra Child Charge (₹ / child / night)">
                  {extraChildCharge !== undefined && extraChildCharge !== null
                    ? `₹${extraChildCharge.toLocaleString("en-IN")}`
                    : "-"}
                </Field>
              </CardContent>
            </Card>
        </div>

        {/* Right: Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{description || "-"}</p>
            </CardContent>
          </Card>

          {/* Owner & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionTitle icon={ShieldCheck}>Owner</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Name">
                  {resortOwner?.firstName} {resortOwner?.lastName}
                </Field>
                <Separator />
                <Field label="Email">{resortOwner?.email}</Field>
                <Field label="Resort Email">{resortOwner?.resortEmail}</Field>
                <Separator />
                <Field label="Mobile">{resortOwner?.mobile}</Field>
                <Field label="Resort Mobile">{resortOwner?.resortMobile}</Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <SectionTitle icon={MapPin}>Address</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Address Line 1">{addressLine1}</Field>
                <Field label="Address Line 2">{addressLine2 || "-"}</Field>
                <Field label="City / State">
                  {city}, {state} {pinCode ? `- ${pinCode}` : ""}
                </Field>
                <Field label="Area">{area || "-"}</Field>
                <Separator />
                <Field label="Location Link">
                  {locationLink ? (
                    <a
                      href={locationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline break-all"
                    >
                      <Link2 className="h-4 w-4" />
                      Open in Maps
                    </a>
                  ) : (
                    "-"
                  )}
                </Field>
              </CardContent>
            </Card>
          </div>

          {/* Capacity & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionTitle icon={BedDouble}>Capacity</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Max Guests Allowed">
                  <div className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {maxGuests}
                  </div>
                </Field>
                <Separator />

                <Field label="Base Guests (included in price)">
                  {property.baseGuests ?? "-"}
                </Field>

                <Separator />
                <Field label="Room Breakdown">
                  {roomBreakdown ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["ac", "nonAc", "deluxe", "luxury"].map((key) => (
                        <Badge key={key} variant="secondary" className="capitalize flex justify-between w-24">
                          <span>{key === "nonAc" ? "Non AC" : key}</span>
                          <span className="font-semibold ml-2">{roomBreakdown[key] ?? 0}</span>
                        </Badge>
                      ))}
                      <Badge className="bg-black text-white flex justify-between w-full">
                        <span>Total</span>
                        <span className="font-semibold ml-2">{roomBreakdown.total ?? 0}</span>
                      </Badge>
                    </div>
                  ) : (
                    "-"
                  )}
                </Field>
                <Separator />
                <Field label="Minimum Stay (Nights)">{minStayNights}</Field>
              </CardContent>
            </Card>

          </div>

          {/* Times & Options */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionTitle icon={Clock}>Check-in / Check-out</SectionTitle>
              </CardHeader>

              <CardContent>
                <Field label="Check-in">{checkInTime}</Field>
                <Field label="Check-out">{checkOutTime}</Field>

                <Separator />

                {/* Pet Friendly */}
                <Field label="Pet Friendly">
                  {typeof petFriendly === "boolean"
                    ? petFriendly
                      ? "Yes"
                      : "No"
                    : "-"}
                </Field>

                <Separator />

                {/* Refundable */}
                <Field label="Refundable">
                  {typeof isRefundable === "boolean"
                    ? isRefundable
                      ? "Yes"
                      : "No"
                    : "-"}
                </Field>

                {/* Refund Notes (ONLY if refundable) */}
                {isRefundable === true && refundNotes && (
                  <>
                    <Separator />
                    <Field label="Refund Policy / Notes">
                      <div className="whitespace-pre-wrap">
                        {refundNotes}
                      </div>
                    </Field>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <SectionTitle>Food & Amenities</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Food Availability">
                  {foodAvailability?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {foodAvailability.map((f, i) => (
                        <Badge key={i} variant="secondary" className="capitalize">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </Field>
                <Separator />
                <Field label="Amenities">
                  {amenities?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((a, i) => {
                        const label = amenityLabelMap[a] || a;
                        return (
                          <Badge key={i} variant="secondary">
                            {label}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    "-"
                  )}
                </Field>
              </CardContent>
            </Card>
          </div>

          {/* Compliance & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <SectionTitle>Compliance & Status</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="PAN">{pan}</Field>
                <Separator />
                <Field label="KYC">
                  <div className="inline-flex items-center gap-2">
                    {kycVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-amber-600" />
                        Pending
                      </>
                    )}
                  </div>
                </Field>
                <Field label="Approval Status" >
                  <span className="capitalize">{approvalStatus}</span>
                </Field>
                <Field label="Published">{publishNow ? "Yes" : "No"}</Field>
                <Field label="Featured">{featured ? "Yes" : "No"}</Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <SectionTitle>Notes & Timestamps</SectionTitle>
              </CardHeader>
              <CardContent>
                <Field label="Internal Notes">
                  <div className="whitespace-pre-wrap">{internalNotes || "-"}</div>
                </Field>
                <Separator />
                <Field label="Created At">
                  {createdAt ? new Date(createdAt).toLocaleString() : "-"}
                </Field>
                <Field label="Updated At">
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
                </Field>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProperty;
