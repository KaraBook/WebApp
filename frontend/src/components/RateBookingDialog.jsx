import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, X } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useState, useEffect } from "react";

export default function RateBookingDialog({ open, booking, onClose }) {
  const { accessToken } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (booking) {
      setRating(booking.rating || 0);
      setComment("");
    }
  }, [booking]);

  if (!booking) return null;

  const submitReview = async () => {
    try {
      await Axios.post(
        SummaryApi.addReview.url,
        {
          propertyId: booking.property?._id,
          bookingId: booking._id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success("Review submitted!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-[14px] relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Rate this Resort
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* STARS */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-7 h-7 cursor-pointer transition
                  ${star <= rating
                    ? "text-black fill-black"
                    : "text-gray-300 hover:text-gray-500"
                  }
                `}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          {/* COMMENT */}
          <textarea
            className="w-full border rounded-[10px] p-3 text-sm"
            rows={3}
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* SUBMIT */}
          <button
            disabled={!rating}
            onClick={submitReview}
            className="
              w-full
              bg-primary
              text-white
              py-3
              rounded-[12px]
              font-semibold
              disabled:opacity-50
            "
          >
            Submit Review
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
