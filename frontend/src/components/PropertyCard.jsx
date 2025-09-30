import { useAuthStore } from "../store/auth"; 
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function PropertyCard({ property }) {
  const { user, showAuthModal } = useAuthStore();
  const [inWishlist, setInWishlist] = useState(false);

  const toggleWishlist = async () => {
    if (!user) {
      showAuthModal(); // 🔑 show login popup
      return;
    }
    try {
      await Axios.post(SummaryApi.toggleWishlist.url, { propertyId: property._id });
      setInWishlist((prev) => !prev);
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm relative">
      <img
        src={property.coverImage}
        alt={property.propertyName}
        className="h-48 w-full object-cover"
      />
      <button
        onClick={toggleWishlist}
        className={`absolute top-2 right-2 p-2 rounded-full ${
          inWishlist ? "bg-red-500 text-white" : "bg-white text-gray-500"
        }`}
      >
        <Heart className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} />
      </button>
      <div className="p-3">
        <h3 className="font-semibold text-lg">{property.propertyName}</h3>
        <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
      </div>
    </div>
  );
}
