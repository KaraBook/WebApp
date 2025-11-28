import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Home, Users, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">My Properties</h1>

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

function PropertyCard({ property }) {
  const cover =
    property.coverImage ||
    "https://via.placeholder.com/400x250?text=No+Image";

  const statusColor = property.isBlocked
    ? "bg-red-100 text-red-600"
    : property.isDraft
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white">
      
      {/* Image (clickable) */}
      <Link to={`/view-property/${property._id}`}>
        <div className="relative h-48 overflow-hidden group cursor-pointer">
          <img
            src={cover}
            alt={property.propertyName}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <Badge
            className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-md ${statusColor}`}
          >
            {property.isBlocked
              ? "Blocked"
              : property.isDraft
              ? "Draft"
              : "Published"}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">

        {/* Title (clickable) */}
        <Link to={`/view-property/${property._id}`}>
          <h2 className="text-lg font-semibold text-gray-800 hover:text-black transition-colors duration-200 line-clamp-1 cursor-pointer">
            {property.propertyName}
          </h2>
        </Link>

        {/* Info rows */}
        <div className="text-sm text-gray-600 space-y-1">

          <p className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#444]" />
            {property.propertyType || "Villa"}
          </p>

          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#444]" />
            {property.city}, {property.state}
          </p>

          <p className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#444]" />
            {property.totalRooms} rooms · {property.maxGuests} guests
          </p>

        </div>
      </div>

      {/* Footer buttons */}
      <div className="border-t p-4 flex justify-between">

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-md px-8"
        >
          <Link to={`/view-property/${property._id}`}>View</Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="rounded-md bg-black text-white px-8 hover:bg-black/90"
        >
          <Link
            to={
              property.isDraft || property.isBlocked
                ? "#"
                : `/edit-property/${property._id}`
            }
          >
            Edit
          </Link>
        </Button>

      </div>
    </Card>
  );
}
