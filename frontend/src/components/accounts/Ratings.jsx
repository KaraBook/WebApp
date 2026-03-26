import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import EditReviewDialog from "@/components/EditReviewDialog";
import { getPropertyPath } from "@/utils/propertySeo";

export default function Ratings() {
  const { accessToken } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

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
  }, [accessToken]);

  if (!reviews.length) {
    return <div className="text-center py-20 text-gray-500">You haven&apos;t rated any properties yet.</div>;
  }

  return (
    <div className="max-w-6xl px-0 md:px-4 py-0">
      <h1 className="text-2xl uppercase tracking-[1px] font-[600] mb-6 text-[#233b19]">
        My Ratings & Reviews
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((review) => {
          const propertyUrl = getPropertyPath(review.propertyId);

          return (
            <div
              key={review._id}
              className="relative rounded-[10px] border border-gray-200 bg-white shadow-sm p-4 flex gap-4 hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => setEditingReview(review)}
                className="absolute right-2 top-2 p-2 bg-[#8080802e] hover:bg-gray-100 rounded-[10px]"
              >
                Edit
              </button>

              <Link to={propertyUrl}>
                <img
                  src={review.propertyId?.coverImage}
                  alt={review.propertyId?.propertyName}
                  className="w-28 h-[120px] rounded-[10px] object-cover border"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={propertyUrl}>
                    <h3 className="font-semibold text-gray-900 hover:text-[#233b19] transition">
                      {review.propertyId?.propertyName}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500 mb-2">
                    {review.propertyId?.city}, {review.propertyId?.state}
                  </p>

                  <div className="flex items-center mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 text-sm leading-snug mt-1">{review.comment}</p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Reviewed on{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <EditReviewDialog
        open={!!editingReview}
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onUpdated={fetchReviews}
      />
    </div>
  );
}
