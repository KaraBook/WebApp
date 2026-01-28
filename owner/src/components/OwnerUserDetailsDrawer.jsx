import { useEffect, useRef, useState } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

const formatDate = (d) =>
    d ? format(new Date(d), "dd MMM, yyyy") : "—";

export default function OwnerUserDetailsDrawer({ open, user, onClose }) {
    if (!user) return null;

    const startY = useRef(0);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest";

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`
          fixed inset-0 z-[9998]
          bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
            />

            {/* Drawer */}
            <div
                onTouchStart={(e) => {
                    startY.current = e.touches[0].clientY;
                    setDragging(true);
                }}
                onTouchMove={(e) => {
                    if (!dragging) return;
                    const delta = e.touches[0].clientY - startY.current;
                    if (delta > 0) setDragY(delta);
                }}
                onTouchEnd={() => {
                    setDragging(false);
                    if (dragY > 120) {
                        onClose(); 
                    }
                    setDragY(0);
                }}
                className={`
    fixed z-[9999] bg-white shadow-2xl
    transition-transform duration-300 ease-in-out

    /* Mobile */
    bottom-0 left-0 right-0
    rounded-t-2xl

    /* Desktop */
    md:top-0 md:bottom-0 md:right-0 md:left-auto
    md:h-full md:w-[420px]
    md:rounded-none

    ${open
                        ? "translate-y-0 md:translate-x-0 md:translate-y-0"
                        : "translate-y-full md:translate-x-full md:translate-y-0"}
    `}
                style={{
                    transform:
                        open && dragY
                            ? `translateY(${dragY}px)`
                            : undefined,
                }}
            >
                {/* HEADER */}
                <div className="px-4 py-4 border-b relative">
                    <h2 className="text-[17px] font-semibold">{fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                        {user.email || "—"}
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-4 py-4 space-y-5 text-sm overflow-y-auto h-[calc(100%-70px)]">

                    {/* Avatar */}
                    <div>
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={fullName}
                                className="w-28 h-28 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-xl bg-black text-white flex items-center justify-center text-3xl font-semibold">
                                {fullName[0]}
                            </div>
                        )}
                    </div>

                    <InfoCard icon={<User size={16} />} label="Full Name" value={fullName} />

                    <Section title="Contact">
                        <Row
                            icon={<Mail size={14} />}
                            text={
                                user.email ? (
                                    <a
                                        href={`mailto:${user.email}`}
                                        className="text-black hover:underline"
                                    >
                                        {user.email}
                                    </a>
                                ) : "—"
                            }
                        />

                        <Row
                            icon={<Phone size={14} />}
                            text={
                                user.mobile ? (
                                    <a
                                        href={`tel:${user.mobile}`}
                                        className="text-black hover:underline"
                                    >
                                        {user.mobile}
                                    </a>
                                ) : "—"
                            }
                        />
                    </Section>

                    <Section title="Location">
                        <Row
                            icon={<MapPin size={14} />}
                            text={`${user.city || "—"}, ${user.state || "—"}`}
                        />
                    </Section>

                    <Section title="Account">
                        <Row icon={<Shield size={14} />} text={user.role || "Traveller"} />
                        <Row
                            icon={<Calendar size={14} />}
                            text={`Joined on ${formatDate(user.createdAt)}`}
                        />
                    </Section>
                </div>
            </div>
        </>
    );
}

/* ---------- UI ---------- */

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon} {label}
            </div>
            <div className="mt-1 font-medium text-gray-900">
                {value || "—"}
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                {title}
            </h4>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Row({ icon, text }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm">{text || "—"}</span>
        </div>
    );
}