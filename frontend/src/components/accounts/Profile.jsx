import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Mail, MapPin, Phone, LogOut } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function Profile() {
  const { accessToken, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Fetch profile, bookings, and wishlist together
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, bookingsRes, wishlistRes] = await Promise.all([
          Axios.get(SummaryApi.me.url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          Axios.get(SummaryApi.getUserBookings.url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          Axios.get(SummaryApi.getWishlist.url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        setProfile(userRes.data.user);
        setAvatarPreview(userRes.data.user.avatarUrl);
        setBookingCount(bookingsRes.data.data?.length || 0);
        setWishlistCount(wishlistRes.data.data?.length || 0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchAll();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await Axios.post(SummaryApi.uploadTravellerAvatar.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setAvatarPreview(res.data.avatarUrl);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
      </div>
    );

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : "—";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-10 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-[#233b19]/10"></div>

        <div className="relative mt-8 mb-4">
          <img
            src={avatarPreview || "/placeholder-avatar.png"}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
          <button
            onClick={() => fileRef.current.click()}
            className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-sm hover:bg-gray-100"
          >
            <Camera className="w-4 h-4 text-gray-700" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
        <p className="text-sm text-gray-500 mt-1 capitalize">{profile.role}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <InfoBox icon={<Phone />} label="Mobile" value={profile.mobile} />
          <InfoBox icon={<Mail />} label="Email" value={profile.email} />
          <InfoBox
            icon={<MapPin />}
            label="Location"
            value={`${profile.city}, ${profile.state}`}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <StatBox color="#233b19" label="Bookings" value={bookingCount} />
          <StatBox color="#efcc61" label="Wishlist" value={wishlistCount} textDark />
          <StatBox color="#111827" label="Member Since" value={memberSince} />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="rounded-full bg-[#233b19] hover:bg-[#1b2d15] text-white"
          >
            {uploading ? "Uploading..." : "Change Avatar"}
          </Button>

          <Button
            onClick={logout}
            variant="outline"
            className="rounded-full border-gray-300 text-gray-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl py-4 px-5 text-center">
      <div className="flex justify-center text-[#233b19] mb-1">{icon}</div>
      <p className="text-gray-700 font-medium">{value || "—"}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function StatBox({ color, label, value, textDark = false }) {
  return (
    <div
      className="rounded-2xl py-5 text-center"
      style={{ backgroundColor: color }}
    >
      <h3
        className={`text-xl font-semibold ${
          textDark ? "text-gray-900" : "text-white"
        }`}
      >
        {value}
      </h3>
      <p
        className={`text-sm ${
          textDark ? "text-gray-700" : "text-gray-300"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
