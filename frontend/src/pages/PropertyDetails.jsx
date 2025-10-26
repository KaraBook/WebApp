import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Heart, MapPin, Users, Home, Calendar } from "lucide-react";
import AmenitiesList from "../components/AmenitiesList";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/auth";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react"

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wishlist, setWishlist, user, showAuthModal, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [bookedDates, setBookedDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [guestCount, setGuestCount] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (!property?._id) return;
    const fetchDates = async () => {
      try {
        const res = await Axios.get(SummaryApi.getBookedDates.url(property._id));
        setBookedDates(res.data.dates || []);
      } catch {
        console.error("Failed to fetch booked dates");
      }
    };
    fetchDates();
  }, [property]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await Axios.get(SummaryApi.getSingleProperty.url(id));
        setProperty(res.data.data);
      } catch (err) {
        console.error("Failed to load property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
      </div>
    );

  if (!property)
    return <div className="text-center py-20 text-gray-500">Property not found.</div>;

  const allImages = [property.coverImage, ...(property.galleryPhotos || [])].filter(Boolean);

  const toggleWishlist = async () => {
    if (!user) return showAuthModal();
    try {
      const res = await Axios.post(
        SummaryApi.toggleWishlist.url,
        { propertyId: property._id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setWishlist(res.data.data.properties.map((id) => id.toString()));
    } catch (err) {
      console.error("Failed to toggle wishlist");
    }
  };

  const inWishlist = wishlist.includes(property._id);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please give a rating");

    try {
      const res = await Axios.post(
        SummaryApi.addReview.url,
        { propertyId: property._id, rating, comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Review added!");
      setReviews((prev) => [res.data.data, ...prev]);
      setRating(0);
      setComment("");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const handleReserve = () => {
    if (!user) {
      showAuthModal();
      return;
    }

    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) {
      toast.error("Please select your stay dates");
      return;
    }

    navigate(`/checkout/${property._id}`, {
      state: {
        from: startDate,
        to: endDate,
        guests: guestCount,
      },
    });
  };

  const renderGallery = () => {
    const count = allImages.length;
    if (count === 1) {
      return (
        <div className="rounded-3xl overflow-hidden">
          <img src={allImages[0]} alt="Property" className="w-full h-[500px] object-cover" />
        </div>
      );
    } else if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-3xl overflow-hidden">
          {allImages.map((img, i) => (
            <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-[500px] object-cover" />
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-3xl overflow-hidden relative">
          <img src={allImages[0]} alt="Main" className="col-span-1 row-span-2 w-full h-[400px] object-cover" />

          {allImages.slice(1, 3).map((img, i) => (
            <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-[195px] object-cover" />
          ))}

          {count > 3 && (
            <button
              className="absolute bottom-4 right-4 bg-white text-gray-800 font-medium px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition"
              onClick={() => window.open(allImages[0], "_blank")}
            >
              Show all photos
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2 pr-6">
        <h1 className="text-3xl font-bold text-[#233b19]">{property.propertyName}</h1>
        <button
          onClick={toggleWishlist}
          className={`p-2 rounded-full border -mb-6 ${inWishlist
            ? "bg-red-500 text-white border-red-500"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
        >
          <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="text-gray-600 text-sm mb-6">
        {property.maxGuests} guests · {property.totalRooms} rooms ·{" "}
        {property.roomTypes?.join(", ")}
      </div>

      {renderGallery()}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>

          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold text-[#233b19] flex items-center gap-2 mb-3">
              <Home className="w-5 h-5" /> Amenities
            </h2>
            <AmenitiesList
              amenities={property.amenities || ["WiFi", "Pool", "Parking"]}
            />
          </div>

          {/* Location */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold text-[#233b19] flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" /> Location
            </h2>
            <p className="text-gray-700 mb-2">
              {property.city}, {property.state}
            </p>
            <a
              href={property.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#233b19] underline text-sm"
            >
              View on Google Maps
            </a>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold text-[#233b19] mb-3">Reviews</h2>

            {/* Display existing reviews */}
            {reviews.length ? (
              reviews.map((r) => (
                <div key={r._id} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={r.userId?.avatarUrl || "/placeholder-avatar.png"}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="text-sm font-medium">{r.userId?.name}</p>
                  </div>
                  <div className="flex text-yellow-400 text-xs mb-1">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                  <p className="text-gray-700 text-sm">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            )}

            {/* Add new review */}
            {user && (
              <form
                onSubmit={handleReviewSubmit}
                className="mt-4 bg-gray-50 p-4 rounded-xl"
              >
                <label className="text-sm text-gray-600 mb-1 block">Your Rating</label>
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows="3"
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                  type="submit"
                  className="mt-3 bg-[#233b19] text-white px-4 py-2 rounded-full text-sm"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Sticky Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-2xl shadow-md p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-2xl font-semibold text-[#233b19]">
                ₹{property.pricingPerNightWeekdays?.toLocaleString()}
                <span className="text-gray-500 text-sm font-normal"> / night</span>
              </h3>
            </div>

            {/* Date Range Picker */}
            <div className="relative mb-4" ref={calendarRef}>
              <label className="text-xs text-gray-500 uppercase ml-1">
                Check-in / Check-out
              </label>
              <div
                className="flex items-center justify-between border border-gray-300 hover:border-black rounded-full px-4 py-2 mt-1 cursor-pointer transition-all duration-200"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <span className="text-gray-700 text-sm font-medium">
                  {`${format(dateRange[0].startDate, "MMM d")} - ${format(
                    dateRange[0].endDate,
                    "MMM d"
                  )}`}
                </span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>

              {showCalendar && (
                <div className="absolute top-[70px] left-0 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 z-50">
                  <DateRange
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    minDate={new Date()}
                    rangeColors={["#efcc61"]}
                    moveRangeOnFirstSelection={false}
                    showSelectionPreview={false}
                    showDateDisplay={false}
                    months={1}
                    direction="horizontal"
                    disabledDay={(date) => {
                      return bookedDates.some((range) => {
                        const start = new Date(range.start);
                        const end = new Date(range.end);
                        return date >= start && date <= end;
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Guests */}
            <div className="mt-3">
              <label className="text-sm text-gray-600">Guests</label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-1 w-full justify-between rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-normal"
                  >
                    {guestCount} {guestCount === 1 ? "guest" : "guests"}
                    <ChevronDown className="w-4 h-4 opacity-70 ml-1" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-[180px] rounded-xl border border-gray-200 shadow-lg"
                  align="start"
                >
                  {[...Array(property.maxGuests || 10)].map((_, i) => {
                    const count = i + 1;
                    return (
                      <DropdownMenuItem
                        key={count}
                        onSelect={() => setGuestCount(count)}
                        className={`text-sm ${guestCount === count
                            ? "bg-[#efcc61]/30 text-gray-900 font-medium"
                            : "text-gray-700"
                          }`}
                      >
                        {count} {count === 1 ? "guest" : "guests"}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              onClick={handleReserve}
              className="w-full mt-5 bg-[#efcc61] text-black hover:bg-[#efcc61] rounded-full py-3 text-lg"
            >
              Reserve
            </Button>

            <p className="text-center text-xs text-gray-500 mt-2">
              You won’t be charged yet
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
