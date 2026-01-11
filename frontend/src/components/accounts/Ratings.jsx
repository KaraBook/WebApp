import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Ratings() {
  const { accessToken } = useAuthStore();
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await Axios.get(SummaryApi.getUserReviews.url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReviews(res.data.data || []);
    } catch {
      console.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await Axios.delete(SummaryApi.deleteReview.url(id), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setReviews((prev) => prev.filter((r) => r._id !== id));

      toast.success("Review removed successfully");
    } catch (err) {
      toast.error("Failed to remove review");
      console.error(err);
    }
  };

  if (!reviews.length)
    return (
      <div className="text-center py-20 text-gray-500">
        You haven't rated any properties yet.
      </div>
    );

  return (
    <div className="max-w-6xl px-0 md:px-4 py-0">
      <h1 className="text-2xl uppercase tracking-[1px] font-[600] mb-6 text-[#233b19]">
        My Ratings & Reviews
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="relative rounded-[10px] border border-gray-200 bg-white shadow-sm p-4 flex gap-4 hover:shadow-md transition-all duration-200"
          >
            <button
              onClick={() => handleDelete(r._id)}
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-red-600" />
            </button>

            <Link to={`/properties/${r.propertyId?._id}`}>
              <img
                src={r.propertyId?.coverImage}
                alt={r.propertyId?.propertyName}
                className="w-28 h-[120px] rounded-[10px] object-cover border"
              />
            </Link>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link to={`/properties/${r.propertyId?._id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-[#233b19] transition">
                    {r.propertyId?.propertyName}
                  </h3>
                </Link>

                <p className="text-sm text-gray-500 mb-2">
                  {r.propertyId?.city}, {r.propertyId?.state}
                </p>

                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating
                          ? "text-black fill-black"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {r.comment && (
                  <p className="text-gray-700 text-sm leading-snug mt-1">
                    {r.comment}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Reviewed on{" "}
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
