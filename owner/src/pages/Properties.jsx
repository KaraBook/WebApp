import { useEffect, useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Home, Users } from "lucide-react";
import { Link } from "react-router-dom";

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
  const cover = property.coverImage || "https://via.placeholder.com/400x250?text=No+Image";
  const statusColor = property.isBlocked
    ? "bg-red-100 text-red-600"
    : property.isDraft
      ? "bg-yellow-100 text-yellow-600"
      : "bg-green-100 text-green-700";

       const handleEditClick = () => {
    alert(`Edit button clicked for: ${property.propertyName}`);
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <div className="relative h-48 bg-gray-100">
        <img
          src={cover}
          alt={property.propertyName}
          className="h-full w-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${statusColor}`}>
          {property.isBlocked ? "Blocked" : property.isDraft ? "Draft" : "Published"}
        </Badge>
      </div>

      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {property.propertyName}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-gray-600 space-y-1">
        <p className="flex items-center gap-2">
          <Home className="w-4 h-4 text-emerald-600" />
          {property.propertyType || "Villa"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          {property.city}, {property.state}
        </p>
        <p className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          {property.totalRooms} rooms, {property.maxGuests} guests
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-3">
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link to={`/view-property/${property._id}`}>
            View
          </Link>
        </Button>
        <div className="flex gap-2">
           <Button
            variant="secondary"
            size="sm"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
