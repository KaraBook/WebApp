import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const nameRegex = /^[a-zA-Z][a-zA-Z\s'.-]{1,49}$/;

const baseSchema = {
  firstName: z.string()
    .min(2, "First name is too short")
    .max(50)
    .regex(nameRegex, "Only letters allowed"),

  lastName: z.string()
    .min(2, "Last name is too short")
    .max(50)
    .regex(nameRegex, "Only letters allowed"),

  email: z.string().email("Enter a valid email"),

  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),

  dateOfBirth: z.string()
    .min(1, "Date of Birth is required")
    .refine((val) => {
      const dob = new Date(val);
      const today = new Date();
      if (dob > today) return false;

      const age =
        today.getFullYear() -
        dob.getFullYear() -
        (today <
          new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
          )
          ? 1
          : 0);

      return age >= 18 && age <= 100;
    }, "Age must be between 18 and 100"),

  address: z.string()
    .min(10, "Address is too short")
    .max(200),

  pinCode: z.string()
    .regex(/^[1-9][0-9]{5}$/, "Enter valid 6-digit pin code"),

  image: z.any().optional(),
};



export default function Signup() {

  const { state } = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isGoogle = state?.method === "google"
  const existingUser = state?.existingUser;
  const redirectTo = state?.redirectTo;
  const checkoutState = state?.checkoutState;

  const schema = z.object(
    isGoogle
      ? {
        ...baseSchema,
        mobile: z.string()
          .min(1, "Mobile number is required")
          .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
      }
      : baseSchema
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);


  useEffect(() => {
    if (isGoogle && state?.email) {
      setValue("email", state.email);
    }
  }, [isGoogle, state, setValue]);

  useEffect(() => {
    if (!state?.idToken) navigate("/");
    setStates(getIndianStates());
  }, [state, navigate]);

  useEffect(() => {
    if (existingUser) {
      setValue("firstName", existingUser.firstName);
      setValue("lastName", existingUser.lastName);
      setValue("email", existingUser.email);
    }
  }, [existingUser, setValue]);

  const handleStateChange = (stateCode, onChange) => {
    const selectedState = states.find((s) => s.isoCode === stateCode);
    if (selectedState) {
      setCities(getCitiesByState(stateCode));
      onChange(selectedState.name);
    }
  };

  const onSubmit = async (values) => {

    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        state: values.state,
        city: values.city,
        dateOfBirth: values.dateOfBirth,
        address: values.address,
        pinCode: values.pinCode,
      };

      if (isGoogle) {
        payload.mobile = values.mobile;
      }

      const signupResp = await axios.post(
        baseURL + SummaryApi.travellerSignup.url,
        payload,

        { headers: { Authorization: `Bearer ${state.idToken}` } }
      );

      let { user, accessToken, refreshToken } = signupResp.data;

      if (values.image?.length) {
        const fd = new FormData();
        fd.append("image", values.image[0]);

        const uploadResp = await axios.post(
          baseURL + SummaryApi.uploadTravellerAvatar.url,
          fd,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        user = { ...user, avatarUrl: uploadResp.data.avatarUrl };
      }

      setAuth({ user, accessToken, refreshToken });

      toast.success("Account created successfully 🎉", {
        description: "Welcome! You are now logged in.",
      });

      if (redirectTo) {
        navigate(redirectTo, { state: checkoutState });
      } else {
        navigate("/");
      }


    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6">
      <Card className="shadow-lg mt-2 border border-gray-200 rounded-[12px]">
        <CardHeader>
          <CardTitle>Complete your signup</CardTitle>
          <CardDescription>
            We’ll create your account and log you in automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">


          {existingUser && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
              We found your existing account. Please complete the remaining details to enable Traveller access.
            </div>
          )}
          {/* NAME ROW */}
          <div className="flex justify-between flex-wrap gap-2">

            <div className="md:w-[48%] w-full">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                className="mt-1 rounded-[10px]"
                placeholder="John"
                {...register("firstName")}
                disabled={!!existingUser}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="md:w-[48%] w-full">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                className="mt-1 rounded-[10px]"
                placeholder="Doe"
                {...register("lastName")}
                disabled={!!existingUser}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

          </div>


          {/* EMAIL */}
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-1 rounded-[10px]"
              placeholder="john@example.com"
              readOnly={isGoogle || !!existingUser}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {isGoogle && (
            <div className="grid gap-1">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                maxLength={10}
                placeholder="Enter mobile number"
                {...register("mobile")}
              />
              {errors.mobile && (
                <p className="text-sm text-destructive">
                  {errors.mobile.message}
                </p>
              )}
            </div>
          )}

          {/* STATE + CITY + DOB */}
          <div className="flex justify-between flex-wrap gap-2">

            {/* State */}
            <div className="md:w-[48%] w-full">
              <Label htmlFor="state">State</Label>
              <Controller
                name="state"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    onValueChange={(val) => handleStateChange(val, onChange)}
                    value={states.find((s) => s.name === value)?.isoCode || ""}
                  >
                    <SelectTrigger className="mt-1 rounded-[10px]">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="z-[999999999]">
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

            {/* City */}
            <div className="md:w-[48%] w-full">
              <Label htmlFor="city">City</Label>
              <Controller
                name="city"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} value={value || ""}>
                    <SelectTrigger className="mt-1 rounded-[10px]">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="z-[999999999]">
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

            {/* DOB */}
            <div className="grid gap-1 mt-1 w-full">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="mt-1 rounded-[10px]"
                max={new Date().toISOString().split("T")[0]}
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            {/* Address - 100% width + textarea */}
            <div className="grid gap-1 mt-1 w-full">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                placeholder="Full address"
                className="mt-1 w-full h-24 border px-3 py-2 text-sm rounded-[10px]"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* Pin Code */}
            <div className="grid gap-1 mt-1 w-full">
              <Label htmlFor="pinCode">Pin Code</Label>
              <Input
                id="pinCode"
                maxLength={6}
                placeholder="6-digit pin code"
                className="mt-1 rounded-[10px]"
                {...register("pinCode")}
              />
              {errors.pinCode && (
                <p className="text-sm text-destructive">{errors.pinCode.message}</p>
              )}
            </div>

          </div>

          {/* Image Upload */}
          <div className="grid gap-1">
            <Label htmlFor="image">Profile image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="mt-1 rounded-[10px]"
              {...register("image")}
            />
          </div>

        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button
            variant="ghost"
            className="rounded-[10px]"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>

          <Button
            className="rounded-[10px]"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>

        </CardFooter>
      </Card>
    </div>
  );
}
