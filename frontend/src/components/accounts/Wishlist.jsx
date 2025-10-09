import { useEffect, useState } from "react";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
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
      } catch (err) {
        console.error(err);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (propertyId) => {
    try {
      const res = await Axios.post(
        SummaryApi.toggleWishlist.url,
        { propertyId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Removed from wishlist");
      setWishlist((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
      </div>
    );

  if (!wishlist.length)
    return (
      <div className="text-center py-20 text-gray-500">
        Your wishlist is empty.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-0 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Wishlist</h1>

      {wishlist.map((property) => (
        <div
          key={property._id}
          className="bg-white p-2 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row overflow-hidden"
        >
          {/* Image */}
          <div className="relative w-full md:w-1/3">
            <img
              src={property.coverImage}
              alt={property.propertyName}
              className="w-full h-60 md:h-[152px] object-cover rounded-l-xl"
            />
            <button
              onClick={() => removeFromWishlist(property._id)}
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between p-5 md:py-2 md:px-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {property.propertyName}
                </h2>
                <div className="bg-[#233b19]/10 text-[#233b19] text-sm font-medium px-3 py-1 rounded-full">
                  {property.propertyType}
                </div>
              </div>

              <div className="flex items-center text-gray-500 mt-2 text-sm">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {property.city}, {property.state}
              </div>
              {/* Ratings */}
              <div className="flex items-center text-yellow-400 text-sm mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.round(property.averageRating || 0) ? "★" : "☆"}
                  </span>
                ))}
                <span className="text-gray-500 text-xs ml-1">
                  {property.averageRating ? property.averageRating.toFixed(1) : "—"}
                </span>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 border-t pt-2">
              <div className="text-lg font-semibold text-gray-900">
                ₹{property.pricingPerNightWeekdays?.toLocaleString()}
                <span className="text-sm text-gray-500 ml-1">/ night</span>
              </div>

              <Link to={`/properties/${property._id}`}>
                <Button className="bg-[#efcc61] hover:bg-[#efcc61] text-[12px] text-black rounded-full mt-3 sm:mt-0">
                  View Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
