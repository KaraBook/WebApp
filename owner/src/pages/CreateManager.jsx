import React, { useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateManager() {
  const [manager, setManager] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: ""
  });

  const handleChange = (e) => {
    setManager({ ...manager, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
  try {
    if (!manager.firstName || !manager.lastName || !manager.email || !manager.mobile) {
      return toast.error("All fields are required");
    }

    if (manager.mobile.length !== 10)
      return toast.error("Enter valid 10-digit number");

    const payload = {
      name: manager.firstName + " " + manager.lastName,
      email: manager.email,
      mobile: manager.mobile,
    };

    const res = await api.post(SummaryApi.createManager.url, payload);

    toast.success("Manager created successfully");
  } catch (err) {
    toast.error(err.response?.data?.message || "Error creating manager");
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Create Manager</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
          />
          <Input
            name="mobile"
            placeholder="Mobile Number"
            maxLength={10}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <Button className="w-full" onClick={handleCreate}>
            Create Manager
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
