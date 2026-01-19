import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black p-6">
       <div className="text-center mb-8">
        <img
            src="\admin\KarabookLogo.png"
            alt="BookMyStay"
            className="h-6 w-auto md:h-14"
          />
        <p className="text-sm text-[#0c95a2] font-[600] mt-1">Admin Portal</p>
      </div>

      <Card className="w-full max-w-md border border-neutral-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center text-neutral-800">
            Sign in to your account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white h-10 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 mb-4 relative">
              <Label htmlFor="password" className="text-neutral-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white h-10 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-neutral-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 bg-[#0c95a2] text-white font-semibold hover:bg-[#0c95a2] transition"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-xs text-neutral-500 mt-8">
        © {new Date().getFullYear()} KaraBook Admin. All rights reserved.
      </p>
    </div>
  );
}
