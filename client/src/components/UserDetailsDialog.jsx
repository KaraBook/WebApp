import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

/* ---------- UTILS ---------- */
const formatDate = (d) =>
  d ? format(new Date(d), "dd MMM, yyyy") : "—";

/* ---------- MAIN ---------- */
export default function UserDetailsDialog({ open, user, onClose }) {
  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="
          fixed inset-y-0 right-0 z-50
          h-full w-[420px] max-w-[90vw]
          p-0 pb-4 rounded-none
          border-l bg-white shadow-xl

          !translate-x-0 !translate-y-0 !left-auto !top-0

          data-[state=open]:animate-in
          data-[state=open]:slide-in-from-right
          data-[state=closed]:animate-out
          data-[state=closed]:slide-out-to-right
          duration-300
        "
      >
        {/* ---------- HEADER ---------- */}
        <div className="sticky top-0 z-10 border-b bg-white px-5 py-4 flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-base">{fullName}</h2>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <RolePill role={user.role} />

            <button
              onClick={onClose}
              className="p-1 rounded-md text-red-500 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-72px)]">

          {/* BASIC INFO */}

          <div className="mb-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={fullName}
                className="w-28 h-28 rounded-lg object-cover object-top"
              />
            ) : (
              <div className="
      w-28 h-28 rounded-lg
      bg-neutral-300
      flex items-center justify-center
      text-white
      text-3xl font-semibold
      uppercase
    ">
                {fullName?.[0] || "U"}
              </div>
            )}
          </div>
          <InfoCard icon={User} label="Full Name" value={fullName} />

          {/* CONTACT */}
          <Section title="Contact Information">
            <InfoRow icon={Mail} value={user.email} />
            <InfoRow icon={Phone} value={user.mobile} />
          </Section>

          {/* LOCATION */}
          <Section title="Location">
            <InfoRow icon={MapPin} value={`${user.city || "—"}, ${user.state || "—"}`} />
          </Section>

          {/* ACCOUNT */}
          <Section title="Account Information">
            <InfoRow icon={Shield} value={user.role} />
            <InfoRow
              icon={Calendar}
              value={`Joined on ${formatDate(user.createdAt)}`}
            />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Icon className="h-4 w-4 text-neutral-600" />
        {label}
      </div>
      <div className="mt-1 font-medium text-neutral-900">
        {value || "—"}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-neutral-500 mb-2">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-sm py-1 px-2">
      <Icon className="h-4 w-4 text-neutral-400" />
      <span>{value || "—"}</span>
    </div>
  );
}

function RolePill({ role }) {
  const map = {
    admin: "border-purple-400 text-purple-600 bg-purple-50",
    traveller: "border-neutral-400 text-neutral-600 bg-neutral-100",
    resortOwner: "border-blue-400 text-blue-600 bg-blue-50",
    manager: "border-amber-400 text-amber-600 bg-amber-50",
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-[2px]
        text-xs font-medium
        rounded-full border capitalize
        ${map[role] || "border-neutral-300 text-neutral-600"}
      `}
    >
      {role === "traveller" ? "Guest" : role}
    </span>
  );
}
