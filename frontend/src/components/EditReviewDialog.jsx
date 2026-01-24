import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, MapPin } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function EditReviewDialog({ open, review, onClose, onUpdated }) {
  const { accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment || "");
    }
  }, [review]);

  if (!mounted || !open || !review) return null;

  const updateReview = async () => {
    try {
      await Axios.put(
        SummaryApi.updateReview.url.replace(":id", review._id),
        { rating, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Review updated");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 px-3">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="relative h-40">
          <img
            src={review.propertyId?.coverImage}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-3 left-4 text-white">
            <h3 className="text-lg font-semibold">
              {review.propertyId?.propertyName}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              {review.propertyId?.city}, {review.propertyId?.state}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Edit your review</h2>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer ${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <textarea
            className="w-full border rounded-xl p-3 text-sm"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={updateReview}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
          >
            Update Review
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}