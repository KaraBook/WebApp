import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function EditReviewDialog({ open, review, onClose, onUpdated }) {
  const { accessToken } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment || "");
    }
  }, [review]);

  if (!open || !review) return null;

  const submitUpdate = async () => {
    try {
      await Axios.put(
        SummaryApi.updateReview.url(review._id),
        { rating, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Review updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update review");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold">Edit Review</h2>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                onClick={() => setRating(s)}
                className={`w-7 h-7 cursor-pointer ${
                  s <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={submitUpdate}
            className="w-full bg-primary text-white py-3 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
