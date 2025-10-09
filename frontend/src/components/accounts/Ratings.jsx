import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Star } from "lucide-react";

export default function Ratings() {
  const { accessToken } = useAuthStore();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
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
    fetchReviews();
  }, []);

  if (!reviews.length)
    return (
      <div className="text-center py-20 text-gray-500">
        You haven’t rated any properties yet.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-2 py-0">
      <h1 className="text-2xl font-semibold mb-6 text-[#233b19]">
        My Ratings & Reviews
      </h1>

      <div className=" flex justify-between">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="flex w-[48%] gap-4 border border-gray-100 bg-white rounded-2xl shadow-sm p-4"
          >
            <img
              src={r.propertyId?.coverImage}
              alt={r.propertyId?.propertyName}
              className="w-28 h-26 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {r.propertyId?.propertyName}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {r.propertyId?.city}, {r.propertyId?.state}
              </p>

              <div className="flex items-center text-yellow-400 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < r.rating ? "fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {r.comment && (
                <p className="text-gray-700 text-sm leading-snug">{r.comment}</p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Reviewed on {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
