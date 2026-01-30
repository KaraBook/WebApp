import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        url: SummaryApi.adminLogin.url,
        method: SummaryApi.adminLogin.method,
        data: { email, password },
      });

      const { accessToken, refreshToken, role } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);


      toast.success("Logged in successfully!");
      if (role === "property_admin") {
        navigate("/properties");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex md:flex-row flex-col">

      {/* LEFT IMAGE (Desktop only) */}
      <div
        className="flex w-full h-[45vh] md:h-auto md:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('/admin/loginhero.png')" }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 text-white p-4 md:p-10 flex flex-col justify-end">
          <p className="text-xs tracking-widest uppercase opacity-80">WELCOME BACK</p>
          <h1 className="text-[34px] md:text-[48px] font-sans font-[700]">KaraBook</h1>
          <p className="mt-0 max-w-md text-[15px] md:text-[18px] opacity-90">
            Manage your properties, bookings, guests and earnings with ease.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 bg-[#078d9a] flex items-center justify-center p-4 md:p-6">

        {/* CARD */}
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 md:p-8">

          {/* LOGO */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img
                src="/admin/KarabookLogo.png"
                alt="KaraBook"
                className="h-7"
              />

            </div>
            <span className="text-sm font-semibold text-[#078d9a]">
              Admin Portal
            </span>
          </div>

          <h2 className="text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Use your admin credentials to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="admin@karabook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full border rounded-lg h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#078d9a]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg h-11 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#078d9a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full h-11 bg-[#00919d] hover:bg-[#00919d]/10 text-white font-semibold rounded-lg transition"
            >
              Continue
            </button>
          </form>

          <div className="mt-4 md:mt-8 border-t pt-2 md:pt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Karabook · Secure Admin Access
          </div>
        </div>
      </div>
    </div>
  );
}