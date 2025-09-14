import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const nameRegex = /^[a-zA-Z][a-zA-Z\s'.-]{1,49}$/;

const schema = z.object({
  firstName: z.string().min(2, "First name is too short").max(50).regex(nameRegex, "Only letters allowed"),
  lastName: z.string().min(2, "Last name is too short").max(50).regex(nameRegex, "Only letters allowed"),
  email: z.string().email("Enter a valid email"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  image: z.any().optional(),
});

export default function Signup() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (!state?.idToken) navigate("/");
    setStates(getIndianStates());
  }, [state, navigate]);

  const handleStateChange = (stateCode, onChange) => {
    const selectedState = states.find((s) => s.isoCode === stateCode);
    if (selectedState) {
      setCities(getCitiesByState(stateCode));
      onChange(selectedState.name);
    }
  };

  const onSubmit = async (values) => {
    try {
      const fd = new FormData();
      fd.append("firstName", values.firstName);
      fd.append("lastName", values.lastName);
      fd.append("email", values.email);
      fd.append("state", values.state);
      fd.append("city", values.city);
      if (values.image?.length) fd.append("image", values.image[0]);

      const resp = await axios.post(
        baseURL + SummaryApi.travellerSignup.url,
        fd,
        { headers: { Authorization: `Bearer ${state.idToken}` } }
      );

      setAuth({
        user: resp.data.user,
        accessToken: resp.data.accessToken,
        refreshToken: resp.data.refreshToken,
      });
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Complete your signup</CardTitle>
          <CardDescription>
            We’ll create your account and log you in automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" className="mt-1" placeholder="John" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="w-1/2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Doe" className="mt-1" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-1" placeholder="john@example.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

        <div className="flex gap-4">
          {/* State Dropdown */}
          <div className="w-1/2">
            <Label htmlFor="state">State</Label>
            <Controller
              name="state"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  onValueChange={(val) => handleStateChange(val, onChange)}
                  value={states.find((s) => s.name === value)?.isoCode || ""}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((st) => (
                      <SelectItem key={st.isoCode} value={st.isoCode}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          {/* City Dropdown */}
          <div className="w-1/2">
            <Label htmlFor="city">City</Label>
            <Controller
              name="city"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} value={value || ""}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
        </div>

          <div className="grid gap-1">
            <Label htmlFor="image">Profile image (optional)</Label>
            <Input id="image" type="file" className="mt-1" accept="image/*" {...register("image")} />
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
