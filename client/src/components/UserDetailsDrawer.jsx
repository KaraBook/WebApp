import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { X, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

const formatDate = (d) =>
  d ? format(new Date(d), "dd MMM, yyyy") : "—";

export default function UserDetailsDrawer({ open, user, onClose }) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open, isMobile]);

  if (!open) return null;


  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";


  const Content = (
    <>
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b bg-white px-5 py-4 flex justify-between">
        <div>
          <h2 className="font-semibold text-base">{fullName}</h2>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded-md text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-3 space-y-4 overflow-y-auto">

        <div className="mb-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={fullName}
              className="w-28 h-28 rounded-lg object-cover object-top"
            />
          ) : (
            <div className="w-28 h-28 rounded-lg bg-neutral-300 flex items-center justify-center text-white text-3xl font-semibold uppercase">
              {fullName?.[0] || "U"}
            </div>
          )}
        </div>

        <InfoCard icon={User} label="Full Name" value={fullName} />

        <Section title="Contact Information">
          <InfoRow
            icon={Mail}
            value={user.email}
            href={user.email ? `mailto:${user.email}` : null}
          />
          <InfoRow
            icon={Phone}
            value={user.mobile}
            href={user.mobile ? `tel:${user.mobile}` : null}
          />
        </Section>


        <Section title="Location">
          <InfoRow
            icon={MapPin}
            value={`${user.city || "—"}, ${user.state || "—"}`}
          />
        </Section>

        <Section title="Account Information">
          <InfoRow
            icon={Shield}
            value={
              user.roles?.length
                ? user.roles
                  .map((r) => {
                    if (r === "traveller") return "Traveller";
                    if (r === "resortOwner") return "Resort Owner";
                    if (r === "admin") return "Admin";
                    if (r === "manager") return "Manager";
                    return r.charAt(0).toUpperCase() + r.slice(1);
                  })
                  .join(", ")
                : "—"
            }
          />
          <InfoRow
            icon={Calendar}
            value={`Joined on ${formatDate(user.createdAt)}`}
          />
        </Section>
      </div>
    </>
  );

  /* ============ MOBILE ============ */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerOverlay className="bg-black/40" />
        <DrawerContent className="h-[65vh] rounded-t-2xl">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  /* ============ DESKTOP ============ */
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-black/40 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      />

      <div
        className={`fixed z-[9999] top-0 right-0 h-full w-[420px]
bg-white shadow-2xl transition-transform duration-300
${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {Content}
      </div>
    </>
  );
}


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

function InfoRow({ icon: Icon, value, href }) {
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all"
    >
      {value || "—"}
    </a>
  ) : (
    <span>{value || "—"}</span>
  );

  return (
    <div className="flex items-center gap-3 text-sm py-1 px-2">
      <Icon className="h-4 w-4 text-neutral-400" />
      {content}
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
        px-3 py-[2px]
        text-xs font-medium
        rounded-full border capitalize
        ${map[role] || "border-neutral-300 text-neutral-600"}
      `}
    >
      {role === "traveller"
        ? "Traveller"
        : role === "resortOwner"
          ? "Resort Owner"
          : role === "admin"
            ? "Admin"
            : role === "manager"
              ? "Manager"
              : role}
    </span>
  );
}
