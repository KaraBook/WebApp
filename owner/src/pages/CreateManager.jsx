import React, { useMemo, useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";

const nameRegex = /^[a-zA-Z][a-zA-Z\s'.-]{1,49}$/;
const mobileRegex = /^[6-9]\d{9}$/; // India-style; change if needed

const schema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name is too long")
        .regex(nameRegex, "Enter a valid first name"),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name is too long")
        .regex(nameRegex, "Enter a valid last name"),
    mobile: z
        .string()
        .regex(mobileRegex, "Enter a valid 10-digit mobile number"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password is too long")
        .regex(/[A-Z]/, "Include at least 1 uppercase letter")
        .regex(/[a-z]/, "Include at least 1 lowercase letter")
        .regex(/[0-9]/, "Include at least 1 number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function CreateManager() {
    const [showPass, setShowPass] = useState(false);
    const [showCpass, setShowCpass] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mobile: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onTouched",
    });

    const passwordValue = watch("password") || "";
    const passStrength = useMemo(() => {
        let score = 0;
        if (passwordValue.length >= 8) score++;
        if (/[A-Z]/.test(passwordValue)) score++;
        if (/[a-z]/.test(passwordValue)) score++;
        if (/[0-9]/.test(passwordValue)) score++;
        if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
        return score; // 0..5
    }, [passwordValue]);

    const onSubmit = async (values) => {
        try {
            const payload = {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
                email: values.email.trim().toLowerCase(),
                mobile: values.mobile.trim(),
                password: values.password,
            };

            await api.post(SummaryApi.createManager.url, payload);

            toast.success("Manager created successfully");
            reset();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.email ||
                err?.response?.data?.errors?.mobile ||
                "Error creating manager";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create Manager
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Add a manager who can log in using email & password.
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-xl">
                        {/* Form Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-lg">Manager details</CardTitle>
                                <CardDescription>
                                    Enter basic details. Password will be stored securely (hashed).
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {/* First/Last name */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="First Name"
                                            icon={<User className="h-4 w-4 text-slate-500" />}
                                            error={errors.firstName?.message}
                                        >
                                            <Input placeholder="e.g., Savnee" {...register("firstName")} />
                                        </Field>

                                        <Field
                                            label="Last Name"
                                            icon={<User className="h-4 w-4 text-slate-500" />}
                                            error={errors.lastName?.message}
                                        >
                                            <Input placeholder="e.g., Botre" {...register("lastName")} />
                                        </Field>
                                    </div>

                                    {/* Mobile */}
                                    <Field
                                        label="Mobile Number"
                                        icon={<Phone className="h-4 w-4 text-slate-500" />}
                                        helper="10-digit number (no +91)."
                                        error={errors.mobile?.message}
                                    >
                                        <Input
                                            inputMode="numeric"
                                            placeholder="9876543210"
                                            maxLength={10}
                                            {...register("mobile")}
                                            onInput={(e) => {
                                                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
                                            }}
                                        />
                                    </Field>

                                    {/* Email */}
                                    <Field
                                        label="Email"
                                        icon={<Mail className="h-4 w-4 text-slate-500" />}
                                        helper="This will be the login email."
                                        error={errors.email?.message}
                                    >
                                        <Input placeholder="manager@email.com" {...register("email")} />
                                    </Field>

                                    {/* Password */}
                                    <Field
                                        label="Password"
                                        icon={<Lock className="h-4 w-4 text-slate-400" />}
                                        error={errors.password?.message}
                                        hasRightIcon
                                    >
                                        <Input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Create a strong password"
                                            {...register("password")}
                                            className="h-11"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPass((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        >
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </Field>

                                    {/* Strength Section OUTSIDE Field */}
                                    <div className="mt-3">
                                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${passStrength <= 1
                                                        ? "bg-red-500"
                                                        : passStrength <= 3
                                                            ? "bg-yellow-500"
                                                            : "bg-green-500"
                                                    }`}
                                                style={{ width: `${(passStrength / 5) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between mt-1">
                                            <p className="text-xs text-slate-500">
                                                {passStrength <= 1
                                                    ? "Weak password"
                                                    : passStrength <= 3
                                                        ? "Medium strength"
                                                        : "Strong password"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Min 8 chars, upper + lower + number
                                            </p>
                                        </div>
                                    </div>


                                    {/* Confirm Password */}
                                    <Field
                                        label="Confirm Password"
                                        icon={<Lock className="h-4 w-4" />}
                                        error={errors.confirmPassword?.message}
                                        hasRightIcon
                                    >
                                        <Input
                                            type={showCpass ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            {...register("confirmPassword")}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowCpass((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        >
                                            {showCpass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </Field>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Create Manager"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, icon, helper, error, children, hasRightIcon = false }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{label}</Label>
                {error ? <span className="text-xs text-red-600">{error}</span> : null}
            </div>

            <div className="relative">
                {icon && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}

                <div
                    className={
                        icon
                            ? hasRightIcon
                                ? "[&>input]:pl-10 [&>input]:pr-11"
                                : "[&>input]:pl-10"
                            : hasRightIcon
                                ? "[&>input]:pr-11"
                                : ""
                    }
                >
                    {children}
                </div>
            </div>

            {helper && <p className="text-xs text-slate-500">{helper}</p>}
        </div>
    );
}