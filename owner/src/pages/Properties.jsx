import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Link } from "react-router-dom";
import { Loader2, Home, MapPin, Users } from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        setProperties(res.data.data || []);
      } catch (err) {
        console.error("Error loading properties:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-[26px] font-semibold text-gray-900">My Properties</h1>

      {properties.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No properties found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------
   PROPERTY CARD — Dashboard UI Matching
--------------------------------------------------- */
function PropertyCard({ property }) {
  const cover =
    property.coverImage ||
    "https://via.placeholder.com/400x250?text=No+Image";

  const statusMap = {
    blocked: { text: "Blocked", class: "bg-red-50 text-red-600 border-red-100" },
    draft: { text: "Draft", class: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    published: { text: "Published", class: "bg-emerald-50 text-emerald-700 border-emerald-100" }
  };

  const status = property.isBlocked
    ? statusMap.blocked
    : property.isDraft
    ? statusMap.draft
    : statusMap.published;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">

      {/* Image */}
      <Link to={`/view-property/${property._id}`}>
        <div className="h-48 overflow-hidden relative cursor-pointer">
          <img
            src={cover}
            alt={property.propertyName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* STATUS CHIP */}
          <span
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-medium border ${status.class}`}
          >
            {status.text}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">

        {/* Title */}
        <Link to={`/view-property/${property._id}`}>
          <h2 className="text-[18px] font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1 cursor-pointer">
            {property.propertyName}
          </h2>
        </Link>

        {/* Meta */}
        <div className="space-y-1 text-[14px] text-gray-600">

          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-gray-500" />
            {property.propertyType || "Villa"}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            {property.city}, {property.state}
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            {property.totalRooms} rooms · {property.maxGuests} guests
          </div>

        </div>
      </div>

      {/* Footer Buttons */}
      <div className="border-t bg-gray-50 px-5 py-4 flex justify-between">

        <Link
          to={`/view-property/${property._id}`}
          className="px-6 py-2 rounded-lg border text-[14px] font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          View
        </Link>

        <Link
          to={
            property.isDraft || property.isBlocked
              ? "#"
              : `/edit-property/${property._id}`
          }
          className={`px-6 py-2 rounded-lg text-[14px] font-medium text-white transition 
            ${property.isDraft || property.isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
            }`}
        >
          Edit
        </Link>

      </div>
    </div>
  );
}
