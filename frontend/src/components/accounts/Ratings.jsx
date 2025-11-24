import { useEffect, useState } from "react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

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
        You haven't rated any properties yet.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-0">
      <h1 className="text-2xl uppercase tracking-[1px] font-[500] mb-6 text-[#233b19]">
        My Ratings & Reviews
      </h1>

      {/* GRID WRAPPER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="border border-gray-200 bg-white shadow-sm p-4 flex gap-4 hover:shadow-md transition-all duration-200"
          >
            {/* IMAGE */}
            <Link to={`/properties/${r.propertyId?._id}`}>
              <img
                src={r.propertyId?.coverImage}
                alt={r.propertyId?.propertyName}
                className="w-28 h-24 object-cover border"
              />
            </Link>

            {/* DETAILS */}
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

                {/* STARS */}
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating
                          ? "text-[#efcc61] fill-[#efcc61]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* COMMENT */}
                {r.comment && (
                  <p className="text-gray-700 text-sm leading-snug mt-1">
                    {r.comment}
                  </p>
                )}
              </div>

              {/* DATE */}
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
