import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

// ✅ Custom portal modal (no Radix Dialog)
// ✅ Always centered on mobile + desktop
// ✅ Not affected by parent layout/overflow/transform
export default function RateBookingDialog({ open, booking, onClose }) {
  const { accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // avoid SSR / hydration issues (Vite usually fine, but safe)
  useEffect(() => setMounted(true), []);

  // reset values when booking changes
  useEffect(() => {
    if (booking) {
      setRating(booking.rating || 0);
      setComment("");
    }
  }, [booking]);

  // lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open || !booking) return null;

  const submitReview = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

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
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 px-3"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-md rounded-[14px] bg-white p-6 shadow-2xl relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold">Rate this Resort</h2>

        <div className="mt-4 space-y-4">
          {/* STARS */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-7 h-7 cursor-pointer transition ${
                  star <= rating
                    ? "text-black fill-black"
                    : "text-gray-300 hover:text-gray-500"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          {/* COMMENT */}
          <textarea
            className="w-full border rounded-[10px] p-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
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
      </div>
    </div>,
    document.body
  );
}
