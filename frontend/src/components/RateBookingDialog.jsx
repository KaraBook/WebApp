import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X, MapPin, Calendar } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { format } from "date-fns";

export default function RateBookingDialog({ open, booking, onClose }) {
  const { accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (booking) {
      setRating(0);
      setComment("");
    }
  }, [booking]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

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
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 px-3"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-white/80 rounded-full px-2 py-1 hover:bg-white"
        >
          <span>X</span>
        </button>

        {/* IMAGE HEADER */}
        <div className="relative h-40">
          <img
            src={booking.property?.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-3 left-4 text-white">
            <h3 className="text-lg font-semibold">
              {booking.property?.propertyName}
            </h3>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              {booking.property?.city}, {booking.property?.state}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">How was your stay?</h2>
          <p className="text-sm text-gray-500">
            Share your experience to help other travelers
          </p>

          {/* STARS */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition ${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400">Select a rating</p>

          {/* COMMENT */}
          <textarea
            className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            rows={4}
            placeholder="Tell us about your experience... What did you enjoy? Any suggestions?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* BUTTON */}
          <button
            disabled={!rating}
            onClick={submitReview}
            className="
              w-full
              bg-primary
              text-white
              py-3
              rounded-xl
              font-semibold
              text-sm
              disabled:opacity-50
              hover:opacity-90
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
