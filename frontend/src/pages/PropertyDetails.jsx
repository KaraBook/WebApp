import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Heart, MapPin, Home, Calendar, ChevronDown, Share2, Star } from "lucide-react";
import { amenitiesCategories } from "@/constants/dropdownOptions";
import AmenitiesList from "../components/AmenitiesList";
import { Swiper, SwiperSlide } from "swiper/react";
import { Map, BedDouble, Bath, Users, ArrowLeft } from "lucide-react";
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


const amenitiesMap = amenitiesCategories
  .flatMap(cat => cat.items)
  .reduce((acc, item) => {
    acc[item.value] = item;
    return acc;
  }, {});

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isDesktop;
}


const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);


export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wishlist, setWishlist, user, showAuthModal, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const isDesktop = useIsDesktop();
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
  });

  const maxGuests = property?.maxGuests || 1;
  const baseGuests = property?.baseGuests || 0;
  const extraAdultCharge = property?.extraAdultCharge || 0;
  const extraChildCharge = property?.extraChildCharge || 0;

  const totalMainGuests = guests.adults + guests.children;

  const extraAdults = Math.max(0, guests.adults - baseGuests);
  const remainingBaseAfterAdults = Math.max(0, baseGuests - guests.adults);
  const extraChildren = Math.max(0, guests.children - remainingBaseAfterAdults);

  const extraGuests = Math.max(0, totalMainGuests - baseGuests);


  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const hasFood =
    Array.isArray(property?.foodAvailability) &&
    property.foodAvailability.length > 0;

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  const calendarRef = useRef(null);
  const guestRef = useRef(null);


  const nights = Math.max(
    1,
    Math.ceil(
      (dateRange[0].endDate - dateRange[0].startDate) /
      (1000 * 60 * 60 * 24)
    )
  );

  const isWeekend = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  const getNightBreakdown = () => {
    let weekdayNights = 0;
    let weekendNights = 0;
    let d = new Date(dateRange[0].startDate);
    const end = new Date(dateRange[0].endDate);
    while (d < end) {
      if (isWeekend(d)) weekendNights++;
      else weekdayNights++;
      d.setDate(d.getDate() + 1);
    }
    return { weekdayNights, weekendNights };
  };


  const calculateBasePrice = () => {
    let total = 0;
    let d = new Date(dateRange[0].startDate);
    const end = new Date(dateRange[0].endDate);

    while (d < end) {
      total += isWeekend(d)
        ? Number(property?.pricingPerNightWeekend || property?.pricingPerNightWeekdays)
        : Number(property?.pricingPerNightWeekdays);
      d.setDate(d.getDate() + 1);
    }
    return total;
  };

  const baseNightPrice = property?.pricingPerNightWeekdays || 0;
  const { weekdayNights, weekendNights } = getNightBreakdown();
  const basePriceTotal = calculateBasePrice();


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


  const fetchDates = async () => {
    try {
      const bookedRes = await Axios.get(
        SummaryApi.getBookedDates.url(property._id)
      );
      const blockedRes = await Axios.get(
        SummaryApi.getPropertyBlockedDates.url(property._id)
      );

      setBookedDates(normalizeRanges(bookedRes.data.dates || []));
      setBlockedDates(normalizeRanges(blockedRes.data.dates || []));
    } catch (err) {
      console.error("Failed to fetch property dates", err);
    }
  };

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

    fetchReviews();
    fetchDates();
  }, [property]);


  useEffect(() => {
    const handler = (e) => {
      if (e.detail.propertyId === property?._id) {
        fetchDates();
      }
    };

    window.addEventListener("REFRESH_PROPERTY_CALENDAR", handler);
    return () =>
      window.removeEventListener("REFRESH_PROPERTY_CALENDAR", handler);
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

  const images = [
    property?.coverImage,
    ...(property?.galleryPhotos || []),
  ]
    .filter(Boolean)
    .filter((img) => {
      if (typeof img === "string") {
        return !img.toLowerCase().includes("aadhaar");
      }

      if (img?.fieldname === "shopAct") return false;
      if (img?.type === "shopAct") return false;

      const src = img?.url || img?.path || "";
      return !src.toLowerCase().includes("aadhaar");
    })
    .map((img) =>
      typeof img === "string" ? img : img.url || img.path
    );

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


  const extraAdultTotal = extraAdults * extraAdultCharge * nights;
  const extraChildTotal = extraChildren * extraChildCharge * nights;

  const finalTotal =
    basePriceTotal + extraAdultTotal + extraChildTotal;



  return (
    <div className="w-full bg-[#fff5f529]">
      <motion.div
        className="max-w-7xl mx-auto px-4 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 rounded-[8px] text-sm font-medium text-gray-600 bg-gray-200 px-3 py-3 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        {/* Header */}
        <div className="flex md:flex-row flex-col items-start gap-[1rem] md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-black font-sans">
              {property.propertyName}
            </h1>

            <div className="flex items-center gap-2 text-[15px] text-gray-800 mt-1">

              <span className="flex items-center gap-1 font-medium">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
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
                  className="flex items-center text-gray-800 hover:text-black"
                >
                  <Map className="w-4 h-4 mr-1" />{property.city}, {property.state}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 pr-2">

            <button
              onClick={toggleWishlist}
              className="flex items-center border rounded-[8px] px-3 py-2 hover:bg-[#038ba029] gap-1 text-gray-700 hover:text-black"
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
              className="flex items-center gap-1 text-gray-700 hover:text-black border rounded-[8px] px-3 py-2 hover:bg-[#038ba042]"
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

            {/* PROPERTY HIGHLIGHTS */}
            <div className="mb-5 border border-gray-200 rounded-2xl bg-white px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {/* BEDROOMS */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#038ba029] flex items-center justify-center">
                    <BedDouble className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {property?.bedrooms || 0} Bedrooms
                    </p>
                    <p className="text-sm text-gray-500">
                      Comfortable beds
                    </p>
                  </div>
                </div>

                {/* BATHROOMS */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#038ba029] flex items-center justify-center">
                    <Bath className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {property?.bathrooms ?? 0} Bathrooms
                    </p>
                    <p className="text-sm text-gray-500">
                      Modern fixtures
                    </p>
                  </div>
                </div>

                {/* GUESTS */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#038ba029] flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Up to {property?.maxGuests || 0} Guests
                    </p>
                    <p className="text-sm text-gray-500">
                      Perfect for groups
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
              About this property
            </h2>
            <p className="text-gray-700 leading-relaxed md:text-[16px] text-[14px] mb-6">{property.description}</p>

            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Home className="w-5 h-5" /> Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {property.amenities.map((value) => {
                  const amenity = amenitiesMap[value];

                  if (!amenity) {
                    return (
                      <div key={value} className="flex items-center gap-2 text-gray-700">
                        <span className="w-5 h-5"></span>
                        <span className="capitalize">{value}</span>
                      </div>
                    );
                  }

                  const Icon = amenity.icon;

                  return (
                    <div key={value} className="flex items-center gap-2 text-gray-800 bg-gray-100 px-3 py-3 rounded-lg">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      <span className="text-[14px] md:text-[16px]">{amenity.label}</span>
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
                <div className="w-full h-full">
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
                    className="rounded-[14px] "
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

              {/* Carousel AFTER review form */}
              <div className="mt-8">
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                ) : (
                  <><Swiper
                    modules={[Navigation]}
                    navigation={{
                      nextEl: ".review-next",
                      prevEl: ".review-prev",
                    }}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                      768: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                    }}
                    className="relative"
                  >
                    {reviews.map((r) => {
                      const name =
                        r.userId?.name ||
                        (r.userId?.firstName || r.userId?.lastName
                          ? `${r.userId.firstName || ""} ${r.userId.lastName || ""}`.trim()
                          : "Traveller");

                      const firstLetter = name.charAt(0).toUpperCase();

                      return (
                        <SwiperSlide key={r._id}>
                          <div className="bg-white rounded-2xl p-6 mb-[20px] shadow-lg h-full flex flex-col">

                            {/* Avatar */}
                            <div className="flex items-center gap-3 mb-3">
                              {r.userId?.avatarUrl ? (
                                <img
                                  src={r.userId.avatarUrl}
                                  alt={name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                                  {firstLetter}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-gray-900">{name}</p>
                                <p className="text-xs text-gray-500">Traveller</p>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= r.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>

                            {/* Comment */}
                            <p className="text-gray-700 text-sm leading-relaxed mt-2">
                              “{r.comment}”
                            </p>

                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                    <div className="flex justify-end gap-3 mt-4">
                      <button className="review-prev w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
                        ←
                      </button>
                      <button className="review-next w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
                        →
                      </button>
                    </div></>
                )}
              </div>
            </div>


          </div>

          {/* RIGHT BOOKING BOX */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border rounded-[12px] shadow-xl p-4 md:p-6 bg-white">

              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-semibold text-black">
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

              <p className="text-[12px] text-[#616161] leading-relaxed">
                Base includes <b>{property.baseGuests}</b> guests ·
                Max capacity <b>{property.maxGuests}</b> guests
                {hasFood && (
                  <>
                    <br />
                    🍽 Food: {property.foodAvailability.join(", ")}
                  </>
                )}
              </p>

              <div className="mt-5 relative" ref={calendarRef}>

                <div
                  onClick={() => {
                    setShowCalendar((prev) => !prev);
                    setShowGuestDropdown(false);
                  }}

                  className="grid grid-cols-2 rounded-[12px] border border-gray-300 overflow-hidden cursor-pointer"
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
                    className={`absolute mt-3 z-[999] bg-white border shadow-2xl rounded-[12px] p-4
                    ${isDesktop
                        ? "-left-[95%] w-[680px]"
                        : "left-1/2 -translate-x-1/2 w-[95vw]"}
                      `}>
                    <DateRange
                      ranges={dateRange}
                      months={isDesktop ? 2 : 1}
                      direction="horizontal"
                      showDateDisplay={false}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#04929f"]}
                      minDate={tomorrow}

                      dayContentRenderer={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const startDate = dateRange[0].startDate;
                        const endDate = dateRange[0].endDate;

                        const isPast = date < today;
                        const isBlocked = isDateDisabled(date);
                        const disabled = isPast || isBlocked;

                        const isStart =
                          startDate &&
                          date.toDateString() === startDate.toDateString();

                        const isEnd =
                          endDate &&
                          date.toDateString() === endDate.toDateString();

                        const isInRange =
                          startDate &&
                          endDate &&
                          date > startDate &&
                          date < endDate;

                        return (
                          <div
                            onClick={(e) => {
                              if (disabled) {
                                e.stopPropagation();
                                toast.error("This date is unavailable");
                              }
                            }}
                            className={`
        flex items-center justify-center
        w-full h-full
        transition-all duration-150

        ${disabled
                                ? "bg-[#1297a317] text-gray-400 cursor-not-allowed rounded-full"
                                : ""}

        ${isInRange
                                ? "bg-primary/20 text-black"
                                : ""}

        ${isStart || isEnd
                                ? "bg-primary text-white font-semibold rounded-full"
                                : ""}

        ${!disabled && !isStart && !isEnd && !isInRange
                                ? "hover:bg-primary/20 hover:text-black cursor-pointer rounded-full"
                                : ""}
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


              <div className="mt-4 rounded-[12px] border border-gray-300 p-3 relative" ref={guestRef}>
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
                  <div className="absolute left-0 w-full bg-white border shadow-xl p-4 mt-2 z-[999] rounded-[8px]">

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
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg
    disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={totalMainGuests >= maxGuests}
                          onClick={() =>
                            setGuests((g) => {
                              if (g.adults + g.children >= maxGuests) return g;
                              return { ...g, adults: g.adults + 1 };
                            })
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
                        <p className="text-xs text-gray-500">Age 4–12</p>
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
                          className="border rounded-full w-7 h-7 flex items-center justify-center text-lg
    disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={totalMainGuests >= maxGuests}
                          onClick={() =>
                            setGuests((g) => {
                              if (g.adults + g.children >= maxGuests) return g;
                              return { ...g, children: g.children + 1 };
                            })
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
                {weekdayNights > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>
                      Weekdays ({weekdayNights} × ₹{property.pricingPerNightWeekdays})
                    </span>
                    <span>
                      ₹{weekdayNights * property.pricingPerNightWeekdays}
                    </span>
                  </div>
                )}

                {weekendNights > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>
                      Weekend ({weekendNights} × ₹{property.pricingPerNightWeekend || property.pricingPerNightWeekdays})
                    </span>
                    <span>
                      ₹{weekendNights * (property.pricingPerNightWeekend || property.pricingPerNightWeekdays)}
                    </span>
                  </div>
                )}


                {extraAdults > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>
                      Extra adults ({extraAdults} × ₹{extraAdultCharge} × {nights}/night)
                    </span>
                    <span>₹{extraAdultTotal}</span>
                  </div>
                )}

                {extraChildren > 0 && (
                  <div className="flex justify-between mb-1">
                    <span>
                      Extra children ({extraChildren} × ₹{extraChildCharge} × {nights}/night)
                    </span>
                    <span>₹{extraChildTotal}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>



              <Button
                onClick={handleReserve}
                className="w-full mt-4 bg-primary text-white rounded-[10px] py-5 text-lg hover:bg-primary/90"
              >
                Reserve →
              </Button>

              <p className="text-left text-xs text-gray-500 mt-2">
                <b>Note:</b> Weekday and weekend prices may vary. Final price is calculated based on selected dates.<br></br>
                Weekdays: <b>₹{property.pricingPerNightWeekdays}</b> / night ·
                Weekends: <b>₹{property.pricingPerNightWeekend || property.pricingPerNightWeekdays}</b> / night
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
