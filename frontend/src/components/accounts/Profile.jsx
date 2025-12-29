import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Mail, MapPin, Phone, Calendar, Home, LogOut } from "lucide-react";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function Profile() {
  const { accessToken, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

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
        <div className="w-10 h-10 border-4 rounded-full border-gray-300 border-t-[#efcc61] animate-spin"></div>
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

  const handleRemoveAvatar = async () => {
    try {
      await Axios.delete(SummaryApi.removeTravellerAvatar.url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setAvatarPreview("");
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };


  return (
    <div className="max-w-5xl px-2 py-2 space-y-8">

      <h1 className="text-2xl font-[500] uppercase tracking-[1px] text-[#233b19] mb-6">My Profile</h1>

      <div className="border shadow-sm rounded-[12px] bg-white p-6 flex items-center gap-6">

        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-[180px] h-[150px] rounded-[12px] object-cover border shadow-sm"
            />
          ) : (
            <div className="w-[180px] h-[150px] rounded-[12px] border shadow-sm bg-gray-100 
      flex items-center justify-center text-5xl font-semibold text-[#233b19]">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {/* Upload */}
          <button
            onClick={() => fileRef.current.click()}
            className="absolute bottom-2 right-2 bg-white p-1 rounded-[8px] shadow border"
          >
            <Camera size={16} />
          </button>

          {/* Remove */}
          {avatarPreview && (
            <button
              onClick={handleRemoveAvatar}
              className="absolute top-2 right-2 bg-red-50 text-red-600 
        px-2 py-1 text-xs rounded-[6px] border hover:bg-red-100"
            >
              Remove
            </button>
          )}

          <input
            hidden
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>


        <div className="flex-1 rounded-[12px]">
          <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{profile.email}</p>

          <div className="flex gap-6 mt-4">
            <Stat value={bookingCount} label="Bookings" />
            <Stat value={wishlistCount} label="Wishlist" />
            <Stat value={memberSince} label="Since" />
          </div>
        </div>

        <Button
          onClick={clearAuth}
          variant="outline"
          className="rounded-[8px] border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <div className="border rounded-[8px] shadow-sm bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

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

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
