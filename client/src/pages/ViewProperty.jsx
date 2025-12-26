import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import FullPageLoader from "@/components/FullPageLoader";
import { errorToast } from "../utils/toastHelper";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  IndianRupee,
  User,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Link2,
  ShieldCheckIcon,
  Calendar
} from "lucide-react";


import { amenitiesCategories, propertyTypeOptions } from "../constants/dropdownOptions";
import { prototype } from "postcss/lib/previous-map";

/* ---------------- helpers ---------------- */

const SectionCard = ({ icon: Icon, title, children }) => (
  <Card className="overflow-hidden">
    <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 border-b">
      <Icon className="h-4 w-4 text-slate-600" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </Card>
);

const amenityMap = amenitiesCategories
  .flatMap((cat) => cat.items)
  .reduce((acc, item) => {
    acc[item.value] = {
      label: item.label,
      icon: item.icon,
    };
    return acc;
  }, {});


const InfoRow = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || "-"}</p>
  </div>
);

const StatusRow = ({ label, value, status }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${status ? "text-emerald-600" : "text-slate-400"
        }`}
    >
      {status && <CheckCircle2 className="h-4 w-4" />}
      {value}
    </span>
  </div>
);


const isImageUrl = (url = "") =>
  /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);

const amenityLabelMap = amenitiesCategories
  .flatMap((c) => c.items)
  .reduce((a, i) => {
    a[i.value] = i.label;
    return a;
  }, {});

/* ---------------- component ---------------- */

export default function ViewProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios.get(SummaryApi.getSingleProperty(id).url);
        setProperty(res.data?.data);
      } catch {
        errorToast("Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <FullPageLoader />;
  if (!property) return null;

  const {
    propertyName,
    propertyType,
    description,
    pricingPerNightWeekdays,
    pricingPerNightWeekend,
    extraAdultCharge,
    extraChildCharge,
    resortOwner,
    addressLine1,
    addressLine2,
    city,
    state,
    area,
    locationLink,
    maxGuests,
    baseGuests,
    minStayNights,
    checkInTime,
    checkOutTime,
    petFriendly,
    isRefundable,
    roomBreakdown,
    refundNotes,
    foodAvailability,
    amenities,
    pan,
    gstin,
    kycVerified,
    approvalStatus,
    publishNow,
    internalNotes,
    coverImage,
    shopAct,
    galleryPhotos = [],
  } = property;

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
       <Button className="bg-gray-200 text-black hover:bg-gray-200" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold -mt-2">{propertyName}</h1>
          <div className="flex gap-2 mt-2">
            <Badge>{propertyType}</Badge>
            <Badge>{approvalStatus}</Badge>
            <Badge variant={publishNow ? "default" : "secondary"}>
              {publishNow ? "Published" : "Unpublished"}
            </Badge>
            <Badge className={kycVerified ? "bg-emerald-600" : "bg-amber-500"}>
              {kycVerified ? "KYC Verified" : "KYC Pending"}
            </Badge>
          </div>
        </div>

      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <SectionCard icon={ImageIcon} title="Cover Image">
            <img
              src={coverImage}
              className="w-full aspect-video object-cover rounded-lg border"
            />
          </SectionCard>

          <SectionCard icon={FileText} title="Shop Act Document">
            {shopAct ? (
              isImageUrl(shopAct) ? (
                <img src={shopAct} className="rounded-lg border" />
              ) : (
                <a
                  href={shopAct}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-primary underline"
                >
                  <Link2 className="h-4 w-4" />
                  View Document
                </a>
              )
            ) : (
              "-"
            )}
          </SectionCard>

          <SectionCard icon={ImageIcon} title="Gallery">
            {/* Desktop: grid | Mobile: horizontal scroll */}
            <div className="hidden sm:grid grid-cols-3 gap-2">
              {galleryPhotos.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-24 w-full object-cover rounded-md border"
                />
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {galleryPhotos.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-28 w-44 flex-shrink-0 object-cover rounded-md border"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={IndianRupee} title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Weekday Price" value={`₹${pricingPerNightWeekdays}/night`} />
              <InfoRow label="Weekend Price" value={`₹${pricingPerNightWeekend}/2 nights`} />
              <InfoRow label="Extra Guest" value={`₹${extraAdultCharge}`} />
              <InfoRow label="Extra Child" value={`₹${extraChildCharge}`} />
            </div>
          </SectionCard>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-2 space-y-6">
          <SectionCard icon={FileText} title="Overview">
            <p className="text-sm leading-relaxed">{description}</p>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard icon={User} title="Owner Information">
              <div className="space-y-4">
                <InfoRow label="Owner Name" value={resortOwner?.firstName + " " + resortOwner?.lastName} />
                <InfoRow label="Email" value={resortOwner?.email} />
                <InfoRow label="Resort Email" value={resortOwner?.resortEmail} />
                <div className="flex gap-8">
                  <InfoRow label="Mobile" value={resortOwner?.mobile} />
                  <InfoRow label="Resort Mobile" value={resortOwner?.resortMobile} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={MapPin} title="Address">
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {addressLine1}
                  <br />
                  {addressLine2}
                  <br />
                  {city}, {state}
                </p>
                <p className="text-xs text-muted-foreground">Area: {area}</p>
                {locationLink && (
                  <a
                    href={locationLink}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm border px-3 py-1.5 rounded-md"
                  >
                    <MapPin className="h-4 w-4" />
                    View on Maps
                  </a>
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard icon={Users} title="Capacity">
            {/* Top stats like screenshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoRow label="Max Guests" value={maxGuests} />
              <InfoRow label="Base Guests" value={baseGuests} />
              <InfoRow label="Min Stay" value={`${minStayNights} night`} />
              <InfoRow label="Total Rooms" value={roomBreakdown?.total} />
            </div>

            {/* Room Breakdown like screenshot (below stats) */}
            <div className="mt-5 border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <div>Type</div>
                <div>Category</div>
                <div className="text-right">Count</div>
              </div>

              {[
                { type: "AC", category: "Ac", count: property?.roomBreakdown?.ac ?? 0 },
                { type: "NonAC", category: "NonAc", count: property?.roomBreakdown?.nonAc ?? 0 },
                { type: "Luxury", category: "Luxury", count: property?.roomBreakdown?.luxury ?? 0 },
                { type: "Deluxe", category: "Deluxe", count: property?.roomBreakdown?.deluxe ?? 0 },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 px-3 py-2 text-sm border-t"
                >
                  <div>{row.type}</div>
                  <div className="text-slate-600">{row.category}</div>
                  <div className="text-right font-medium">{row.count}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Clock} title="Check-in / Check-out">
            {/* Top time boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="text-lg font-semibold mt-1">{checkInTime}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="text-lg font-semibold mt-1">{checkOutTime}</p>
              </div>
            </div>

            {/* Pet Friendly & Refundable */}
            <div className="mt-4 space-y-3">
              {/* Pet Friendly */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span>Pet Friendly</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {petFriendly ? "Yes" : "No"}
                </div>
              </div>

              {/* Refundable */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-slate-600" />
                  <span>Refundable</span>
                </div>

                <div
                  className={`flex items-center gap-1 text-sm font-medium ${isRefundable ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {isRefundable && <CheckCircle2 className="h-4 w-4" />}
                  {isRefundable ? "Yes" : "No"}
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            {isRefundable && refundNotes && (
              <div className="mt-4 bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Refund Policy</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {refundNotes}
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard icon={ShieldCheck} title="Food & Amenities">
            {/* Food Availability */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Food Availability</p>

              <div className="flex flex-wrap gap-4">
                {foodAvailability?.map((food) => (
                  <div
                    key={food}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="capitalize">{food}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <Separator className="my-4" />

            {/* Amenities */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Amenities</p>

              <div className="flex flex-wrap gap-3">
                {amenities?.map((a) => {
                  const amenity = amenityMap[a];
                  const Icon = amenity?.icon;

                  return (
                    <div
                      key={a}
                      className="flex items-center gap-2 px-2 py-[2px] rounded-full border bg-slate-50 text-sm"
                    >
                      {Icon && <Icon className="h-3 w-3 text-slate-600" />}
                      <span className="text-[12px]">{amenity?.label || a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance & Status */}
            <SectionCard icon={ShieldCheckIcon} title="Compliance & Status">
              <StatusRow label="GSTIN" value={gstin || "-"} />
              <StatusRow label="PAN" value={pan || "-"} />
              <StatusRow
                label="KYC Status"
                value={kycVerified ? "Verified" : "Pending"}
                status={kycVerified}
              />
              <StatusRow
                label="Approval"
                value={approvalStatus === "approved" ? "Approved" : approvalStatus}
                status={approvalStatus === "approved"}
              />
              <StatusRow
                label="Published"
                value={publishNow ? "Live" : "Not Live"}
                status={publishNow}
              />
            </SectionCard>

            {/* Notes & Timestamps */}
            <SectionCard icon={FileText} title="Notes & Timestamps">
              {/* Internal Notes */}
              <div className="bg-slate-50 rounded-lg p-3 text-sm leading-relaxed">
                {internalNotes || "-"}
              </div>

              <Separator className="my-4" />

              {/* Dates */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created:&nbsp;
                    <span className="text-slate-900">
                      {new Date(property.createdAt).toLocaleString()}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated:&nbsp;
                    <span className="text-slate-900">
                      {new Date(property.updatedAt).toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

        </div>
      </div>
    </div>
  );
}
