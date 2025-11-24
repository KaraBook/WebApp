import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Mail, MapPin, Phone, Calendar, Home, LogOut } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  /* ---------------- FETCH USER DATA ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, bookingsRes, wishlistRes] = await Promise.all([
          Axios.get(SummaryApi.me.url, { headers: { Authorization: `Bearer ${accessToken}` } }),
          Axios.get(SummaryApi.getUserBookings.url, { headers: { Authorization: `Bearer ${accessToken}` } }),
          Axios.get(SummaryApi.getWishlist.url, { headers: { Authorization: `Bearer ${accessToken}` } })
        ]);

        const user = userRes.data.user;
        setProfile(user);
        setAvatarPreview(user.avatarUrl);
        setBookingCount(bookingsRes.data.data?.length || 0);
        setWishlistCount(wishlistRes.data.data?.length || 0);
      } catch {
        toast.error("Failed to load profile");
      }
    };
    fetchAll();
  }, []);

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await Axios.post(SummaryApi.uploadTravellerAvatar.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`
        }
      });

      setAvatarPreview(res.data.avatarUrl);
      toast.success("Profile photo updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!profile)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] animate-spin"></div>
      </div>
    );

  const memberSince = new Date(profile.createdAt).getFullYear();
  const dob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
    : "—";

  return (
    <div className="max-w-5xl mx-auto px-2 py-10 space-y-8">

      <h1 className="text-2xl font-[500] uppercase tracking-[1px] text-[#233b19] mb-6">My Profile</h1>

      {/* --------- PROFILE HEADER (SLIM, PROFESSIONAL) --------- */}
      <div className="border shadow-sm bg-white p-6 flex items-center gap-6">

        {/* Avatar */}
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-[180px] h-[150px] object-cover border shadow-sm"
            />
          ) : (
            <div className="w-[180px] h-[150px] border shadow-sm bg-gray-100 
                    flex items-center justify-center text-5xl font-semibold text-[#233b19]">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          <button
            onClick={() => fileRef.current.click()}
            className="absolute bottom-0 right-0 bg-white p-1 shadow border hover:bg-gray-100"
          >
            <Camera size={16} />
          </button>

          <input
            hidden
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>


        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile.email}</p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <Stat value={bookingCount} label="Bookings" />
            <Stat value={wishlistCount} label="Wishlist" />
            <Stat value={memberSince} label="Since" />
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={logout}
          variant="outline"
          className="rounded-none border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>

      {/* --------- USER INFO GRID --------- */}
      <div className="border shadow-sm bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

        <InfoRow icon={<Phone />} label="Mobile" value={profile.mobile} />
        <InfoRow icon={<Mail />} label="Email" value={profile.email} />
        <InfoRow icon={<Calendar />} label="Date of Birth" value={dob} />
        <InfoRow icon={<Home />} label="Address" value={profile.address || "—"} />
        <InfoRow icon={<MapPin />} label="City" value={profile.city || "—"} />
        <InfoRow icon={<MapPin />} label="State" value={profile.state || "—"} />
        <InfoRow icon={<MapPin />} label="Pin Code" value={profile.pinCode || "—"} />

      </div>
    </div>
  );
}

/* --------- CLEAN INFO ROW --------- */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b pb-3">
      <div className="text-[#233b19]">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* --------- CLEAN STAT BOX --------- */
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
