import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Heart, MapPin, Home, Calendar, ChevronDown, Share2, Star } from "lucide-react";
import { amenitiesOptions } from "@/constants/dropdownOptions";
import AmenitiesList from "../components/AmenitiesList";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import PropertyGallery from "../components/PropertyGallery";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/auth";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wishlist, setWishlist, user, showAuthModal, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  const calendarRef = useRef(null);
  const guestRef = useRef(null);

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



  const normalizeRanges = (ranges) =>
    ranges.map((r) => {
      const start = new Date(r.start);
      const end = new Date(r.end);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return { start, end };
    });


  useEffect(() => {
    if (!property?._id) return;

    const fetchReviews = async () => {
      try {
        const res = await Axios.get(SummaryApi.getPropertyReviews.url(property._id));
        setReviews(res.data.data || []);
      } catch (err) {
        console.log("Failed to load reviews");
      }
    };
    const fetchDates = async () => {
      try {
        const bookedRes = await Axios.get(SummaryApi.getBookedDates.url(property._id));
        const blockedRes = await Axios.get(SummaryApi.getPropertyBlockedDates.url(property._id));

        setBookedDates(normalizeRanges(bookedRes.data.dates || []));
        setBlockedDates(normalizeRanges(blockedRes.data.dates || []));
      } catch (err) {
        console.error("Failed to fetch property dates", err);
      }
    };

    fetchReviews();
    fetchDates();
  }, [property]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const submitReview = async () => {
    if (!newReview.rating) return toast.error("Please select a rating");

    try {
      const res = await Axios.post(
        SummaryApi.addReview.url,
        {
          propertyId: property._id,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success("Review submitted!");
      setNewReview({ rating: 0, comment: "" });
      const updated = await Axios.get(SummaryApi.getPropertyReviews.url(property._id));
      setReviews(updated.data.data);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };


  const isDateDisabled = (date) => {
    const all = [...bookedDates, ...blockedDates];
    return all.some((range) => date >= range.start && date <= range.end);
  };

  const toggleWishlist = async () => {
    if (!user) return showAuthModal();
    try {
      const res = await Axios.post(
        SummaryApi.toggleWishlist.url,
        { propertyId: property._id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const updated = res.data.data.properties.map((id) => id.toString());
      const isAdded = !wishlist.includes(property._id);
      setWishlist(updated);
      if (isAdded) {
        toast.success("Added to wishlist!");
      } else {
        toast.error("Removed from wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };



  const handleReserve = () => {
    if (!user) return showAuthModal();

    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) return toast.error("Please select your stay dates");

    navigate(`/checkout/${property._id}`, {
      state: { from: startDate, to: endDate, guests },
    });
  };

  const images = [property?.coverImage, ...(property?.galleryPhotos || [])].filter(Boolean);

  const renderGallery = () => {
    if (images.length === 1) {
      return (
        <div className="rounded-3xl overflow-hidden">
          <img src={images[0]} className="w-full h-[500px] object-cover" />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 rounded-3xl overflow-hidden">
          {images.map((img, i) => (
            <img key={i} src={img} className="w-full h-[500px] object-cover" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
        <img src={images[0]} className="col-span-1 row-span-2 w-full h-[400px] object-cover" />
        {images.slice(1, 3).map((img, i) => (
          <img key={i} src={img} className="w-full h-[195px] object-cover" />
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
      </div>
    );

  if (!property) return <div className="text-center py-20">Property not found.</div>;

  return (
    <div className="w-full bg-[#fff5f529]">
      <motion.div
        className="max-w-7xl mx-auto px-4 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#233b19] font-sans">
              {property.propertyName}
            </h1>

            <div className="flex items-center gap-2 text-[15px] text-gray-800 mt-1">

              <span className="flex items-center gap-1 font-medium">
                <Star className="w-4 h-4 text-black fill-black" />
                {property.averageRating ? property.averageRating.toFixed(1) : "0.0"}
              </span>

              <span className="text-gray-500">·</span>

              <span className="cursor-pointer">
                {reviews.length} reviews
              </span>


              <span className="text-gray-500">·</span>

              {property.city && property.state && (
                <a
                  href={property.locationLink || "#"}
                  className="underline text-gray-800 hover:text-black"
                >
                  {property.city}, {property.state}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 pr-2">

            <button
              onClick={toggleWishlist}
              className="flex items-center gap-1 text-gray-700 hover:text-black"
            >
              <Heart
                className={`w-4 h-4 ${wishlist.includes(property._id)
                  ? "fill-black text-black"
                  : "fill-none"
                  }`}
              />
              <span className="text-sm font-bold">
                {wishlist.includes(property._id) ? "Saved" : "Save"}
              </span>
            </button>

            <button
              className="flex items-center gap-1 text-gray-700 hover:text-black"
              onClick={() => {
                navigator.share
                  ? navigator.share({
                    title: property.propertyName,
                    text: "Check out this property",
                    url: window.location.href,
                  })
                  : window.open(window.location.href, "_blank");
              }}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-bold">Share</span>
            </button>

          </div>
        </div>


        {images.length > 0 && <PropertyGallery images={images} />}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2">
            <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>

            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Home className="w-5 h-5" /> Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {property.amenities.map((a) => {
                  const findAmenity = amenitiesOptions.find((x) => x.value === a);
                  if (!findAmenity) return null;

                  const Icon = findAmenity.icon;

                  return (
                    <div key={a} className="flex items-center gap-2 text-gray-800">
                      <Icon className="w-5 h-5" />
                      <span>{findAmenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5" /> Location
              </h2>
              <p className="text-gray-700 mb-2">
                {property.city}, {property.state}
              </p>
              <div className="w-full h-64 mt-3 overflow-hidden">
                <div className="w-full h-full" style={{ filter: "grayscale(100%)" }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      property.addressLine1 +
                      " " +
                      property.city +
                      " " +
                      property.state
                    )}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>


            {/* REVIEWS SECTION */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-black fill-black" /> Reviews
              </h2>

              {/* Submit Review Section FIRST */}
              {user ? (
                <div className="mt-5 p-4 border bg-white shadow-sm">
                  <p className="font-semibold mb-2">Write a Review</p>

                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 cursor-pointer ${star <= newReview.rating
                          ? "text-black fill-black"
                          : "text-gray-400"
                          }`}
                        onClick={() =>
                          setNewReview((prev) => ({ ...prev, rating: star }))
                        }
                      />
                    ))}
                  </div>

                  <textarea
                    className="w-full border p-3"
                    rows="3"
                    placeholder="Write your experience..."
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                    }
                  />

                  <Button
                    className="mt-3 bg-primary rounded-[0] text-white hover:bg-primary/80"
                    onClick={submitReview}
                  >
                    Submit Review
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-3">
                  <button className="underline font-semibold" onClick={showAuthModal}>
                    Login
                  </button>{" "}
                  to write a review.
                </p>
              )}

              {/* Carousel AFTER review form */}
              <div className="mt-8">
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                ) : (
                  <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={20}
                    slidesPerView={1}
                    className="mySwiper z-0"
                  >
                    {reviews.map((r) => (
                      <SwiperSlide key={r._id}>
                        <div className="p-5 border bg-gray-50 shadow-sm">
                          <div className="flex items-center gap-2">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-black fill-black"
                              />
                            ))}
                          </div>

                          <p className="text-gray-800 mt-2">{r.comment}</p>

                          <p className="text-xs text-gray-500 mt-1">
                            — {r.userId?.name || "Traveller"}
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>


          </div>

          {/* RIGHT BOOKING BOX */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border shadow-xl p-6 bg-white">

              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-semibold text-[#233b19]">
                  ₹{property.pricingPerNightWeekdays?.toLocaleString()}
                  <span className="text-sm text-gray-600 font-normal"> / night</span>
                </h3>

                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <Star className="w-4 h-4 text-black fill-black" />
                  <span>{property.averageRating?.toFixed(1) || "0.0"}</span>
                  <span className="underline cursor-pointer text-gray-500">
                    {reviews.length} reviews
                  </span>
                </div>
              </div>

              <div className="mt-5 relative" ref={calendarRef}>

                <div
                  onClick={() => {
                    setShowCalendar(true);
                    setShowGuestDropdown(false);
                  }}
                  className="grid grid-cols-2 border border-gray-300 overflow-hidden cursor-pointer"
                >
                  <div className="border-r p-3 bg-white hover:bg-gray-50">
                    <label className="text-[10px] uppercase text-gray-500">Check-in</label>
                    <p className="text-sm font-medium text-gray-900">
                      {format(dateRange[0].startDate, "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="p-3 bg-white hover:bg-gray-50">
                    <label className="text-[10px] uppercase text-gray-500">Check-out</label>
                    <p className="text-sm font-medium text-gray-900">
                      {format(dateRange[0].endDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {showCalendar && (
                  <div
                    className="
      absolute mt-3 bg-white border shadow-2xl
      z-[999] p-4 w-[650px] max-w-[90vw] right-0
    "
                  >
                    <DateRange
                      ranges={dateRange}
                      months={2}
                      direction="horizontal"
                      showDateDisplay={false}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#04929f"]}
                      minDate={new Date()}

                      dayContentRenderer={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const isPast = date < today;
                        const isBlocked = isDateDisabled(date);

                        const disabled = isPast || isBlocked;

                        const isSelected =
                          date >= dateRange[0].startDate && date <= dateRange[0].endDate;

                        return (
                          <div
                            onClick={(e) => {
                              if (disabled) {
                                e.stopPropagation();
                                toast.error("This date is unavailable");
                              }
                            }}
                            className={`
        flex items-center justify-center w-full h-full rounded-full
        ${disabled ? "bg-[#1297a317] text-gray-400 cursor-not-allowed" : ""}
        ${!disabled && !isSelected ? "hover:bg-primary border-primary hover:text-white cursor-pointer" : ""}
        ${isSelected ? "bg-primary text-white font-semibold" : ""}
      `}
                          >
                            {date.getDate()}
                          </div>
                        );
                      }}


                      onChange={(item) => {
                        const start = item.selection.startDate;
                        const end = item.selection.endDate;

                        let invalid = false;
                        let curr = new Date(start);

                        while (curr <= end) {
                          if (isDateDisabled(curr)) invalid = true;
                          curr.setDate(curr.getDate() + 1);
                        }

                        if (invalid) {
                          toast.error("These dates include unavailable days!");
                          return;
                        }

                        setDateRange([item.selection]);

                        if (item.selection.startDate !== item.selection.endDate) {
                          setShowCalendar(false);
                        }
                      }}
                    />
                  </div>
                )}

              </div>


              <div className="mt-4 border border-gray-300 p-3 relative" ref={guestRef}>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Guests</label>

                <div
                  onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  className="flex justify-between items-center cursor-pointer mt-1"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {guests.adults + guests.children} guests
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </div>

                {showGuestDropdown && (
                  <div className="absolute left-0 w-full bg-white border shadow-xl p-4 mt-2 z-[999]">

                    {/* Adults */}
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Adults</p>
                        <p className="text-xs text-gray-500">Age 13+</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))
                          }
                        >
                          −
                        </button>

                        <span>{guests.adults}</span>

                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, adults: g.adults + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Children</p>
                        <p className="text-xs text-gray-500">Age 2–12</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, children: Math.max(0, g.children - 1) }))
                          }
                        >
                          −
                        </button>

                        <span>{guests.children}</span>

                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, children: g.children + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Infants</p>
                        <p className="text-xs text-gray-500">Under 2</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, infants: Math.max(0, g.infants - 1) }))
                          }
                        >
                          −
                        </button>

                        <span>{guests.infants}</span>

                        <button
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg"
                          onClick={() =>
                            setGuests((g) => ({ ...g, infants: g.infants + 1 }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>


              <div className="mt-6 text-sm text-gray-700">
                <div className="flex justify-between mb-1">
                  <span>
                    ₹{property.pricingPerNightWeekdays} ×{" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        (dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)
                      )
                    )}{" "}
                    nights
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹
                    {property.pricingPerNightWeekdays *
                      Math.max(
                        1,
                        Math.ceil(
                          (dateRange[0].endDate - dateRange[0].startDate) /
                          (1000 * 60 * 60 * 24)
                        )
                      )}
                  </span>
                </div>


                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total</span>
                  <span>
                    ₹
                    {property.pricingPerNightWeekdays *
                      Math.max(
                        1,
                        Math.ceil(
                          (dateRange[0].endDate - dateRange[0].startDate) /
                          (1000 * 60 * 60 * 24)
                        )
                      )}
                  </span>
                </div>
              </div>


              <Button
                onClick={handleReserve}
                className="w-full mt-4 bg-primary text-white rounded-[0px] py-5 text-lg hover:bg-primary/90"
              >
                Reserve →
              </Button>

              <p className="text-center text-xs text-gray-500 mt-2">
                You won’t be charged yet
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
