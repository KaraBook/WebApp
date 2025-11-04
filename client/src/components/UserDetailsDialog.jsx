import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const formatDate = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "—"}</p>
  </div>
);

const UserDetailsDialog = ({ open, onClose, user }) => {
  if (!user) return null;

  const roleColor =
    user.role === "resortOwner"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl bg-white rounded-xl shadow-lg border">
        <AlertDialogHeader className="flex justify-between items-start">
          <div>
            <AlertDialogTitle className="text-lg font-semibold">
              User Details —{" "}
              <span className="text-gray-600">
                {user.firstName} {user.lastName}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Detailed profile information
            </AlertDialogDescription>
          </div>
          <Badge className={`${roleColor} capitalize`}>{user.role}</Badge>
        </AlertDialogHeader>

        <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <Section title="Personal Information">
            <Field label="Full Name" value={`${user.firstName} ${user.lastName}`} />
            <Field label="Email" value={user.email} />
            <Field label="Mobile" value={user.mobile} />
            <Field label="Role" value={user.role} />
          </Section>

          <Section title="Location">
            <Field label="State" value={user.state} />
            <Field label="City" value={user.city} />
          </Section>

          <Section title="Account Info">
            <Field label="User ID" value={user.id || user._id} />
            <Field label="Joined On" value={formatDate(user.createdAt)} />
          </Section>

          {user.avatarUrl && (
            <div className="flex flex-col items-center mt-6">
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-28 h-28 rounded-full border object-cover"
              />
              <p className="text-sm text-gray-600 mt-2">Profile Picture</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserDetailsDialog;
