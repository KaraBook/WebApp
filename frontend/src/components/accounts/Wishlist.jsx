import { useEffect, useState } from "react";
import { MapPin, Star, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { accessToken } = useAuthStore();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await Axios.get(SummaryApi.getWishlist.url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setWishlist(res.data.data || []);
      } catch {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (propertyId) => {
    try {
      await Axios.post(
        SummaryApi.toggleWishlist.url,
        { propertyId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Removed from wishlist");
      setWishlist((prev) => prev.filter((p) => p._id !== propertyId));
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 rounded-full border-gray-300 border-t-[#efcc61] animate-spin"></div>
      </div>
    );

  if (!wishlist.length)
    return (
      <div className="text-center py-20 text-gray-500">
        Your wishlist is empty.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-0">
      <h1 className="text-2xl uppercase tracking-[1px] font-[500] text-gray-900 mb-6">My Wishlist</h1>

      {/* GRID: 3 CARDS PER ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map((property) => (
          <div
            key={property._id}
            className="border shadow-sm rounded-[12px] hover:shadow-md transition-all bg-white p-0"
          >
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden cursor-pointer">
              <Link to={`/properties/${property._id}`}>
                <img
                  src={property.coverImage}
                  alt={property.propertyName}
                  className="w-full h-full object-cover rounded-t-[12px] "
                />
              </Link>

              {/* Remove Icon */}
              <button
                onClick={() => removeFromWishlist(property._id)}
                className="absolute top-2 right-2 bg-white p-1 shadow hover:bg-gray-100"
              >
                <BookmarkX className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <Link to={`/properties/${property._id}`}>
                <h2 className="text-lg font-semibold text-gray-900 hover:underline">
                  {property.propertyName}
                </h2>
              </Link>

              <div className="flex items-center text-gray-600 mt-1 text-sm">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {property.city}, {property.state}
              </div>

              {/* Rating */}
              <div className="flex items-center text-primary-500 mt-1 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.round(property.averageRating || 0) ? "★" : "☆"}
                  </span>
                ))}
                <span className="text-gray-500 text-xs ml-1">
                  {property.averageRating ? property.averageRating.toFixed(1) : "—"}
                </span>
              </div>

              {/* Price + Button */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">
                  ₹{property.pricingPerNightWeekdays?.toLocaleString()}
                  <span className="text-sm text-gray-500"> / night</span>
                </p>

                <Link to={`/properties/${property._id}`}>
                  <Button
                    className="bg-primary text-[14px] text-white rounded-[8px] hover:bg-primary px-6"
                    size="sm"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
