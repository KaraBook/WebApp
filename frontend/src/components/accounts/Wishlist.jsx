import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
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
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] animate-spin" />
      </div>
    );

  if (!wishlist.length)
    return (
      <div className="text-center py-20 text-gray-500">Your wishlist is empty.</div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-0">
      <h1 className="text-2xl font-semibold text-[#233b19] mb-6">My Wishlist</h1>

      <div className="space-y-4">
        {wishlist.map((property) => (
          <div
            key={property._id}
            className="border border-gray-200 bg-white hover:bg-gray-50 transition flex w-full"
          >
            {/* IMAGE */}
            <Link
              to={`/properties/${property._id}`}
              className="w-40 h-32 flex-shrink-0 border-r border-gray-200"
            >
              <img
                src={property.coverImage}
                alt={property.propertyName}
                className="w-full h-full object-cover"
              />
            </Link>

            {/* DETAILS */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  {/* CLICKABLE TITLE */}
                  <Link to={`/properties/${property._id}`}>
                    <h2 className="text-[17px] font-semibold text-gray-900 hover:underline">
                      {property.propertyName}
                    </h2>
                  </Link>

                  {/* REMOVE BUTTON (modern minimal) */}
                  <button
                    onClick={() => removeFromWishlist(property._id)}
                    className="text-gray-500 hover:text-black p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* LOCATION */}
                <div className="flex items-center text-gray-500 mt-1 text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {property.city}, {property.state}
                </div>

                {/* RATING */}
                <div className="flex items-center text-yellow-500 text-sm mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.round(property.averageRating || 0) ? "★" : "☆"}
                    </span>
                  ))}
                  <span className="text-gray-500 text-xs ml-1">
                    {property.averageRating
                      ? property.averageRating.toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>

              {/* PRICE + BUTTON */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-3">
                <p className="text-lg font-semibold">
                  ₹{property.pricingPerNightWeekdays.toLocaleString()}
                  <span className="text-sm text-gray-500 ml-1">/ night</span>
                </p>

                <Link to={`/properties/${property._id}`}>
                  <Button className="bg-[#efcc61] hover:bg-[#efcc61] text-black rounded-none text-xs px-4 py-2">
                    View Property
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
