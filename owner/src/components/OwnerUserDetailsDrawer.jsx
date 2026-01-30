import { useEffect } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { X, User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

const formatDate = (d) =>
  d ? format(new Date(d), "dd MMM, yyyy") : "—";

export default function OwnerUserDetailsDrawer({ open, user, onClose }) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!booking) return null;

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest";


  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerOverlay className="bg-black/40" />

        <DrawerContent className="h-[75vh] rounded-t-2xl">
          <Header fullName={fullName} user={user} onClose={onClose} />
          <Body user={user} fullName={fullName} />
        </DrawerContent>
      </Drawer>
    );
  }


  return (
    <>
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-[9998]
          bg-black/40 backdrop-blur-sm
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <div
        className={`
          fixed z-[9999] top-0 right-0 h-full w-[420px]
          bg-white shadow-2xl
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <Header fullName={fullName} user={user} onClose={onClose} />
          <div className="flex-1 overflow-y-auto">
            <Body user={user} fullName={fullName} />
          </div>
        </div>
      </div>
    </>
  );
}


function Header({ fullName, user, onClose }) {
  return (
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
  );
}

function Body({ user, fullName }) {
  return (
    <div className="px-4 py-4 space-y-5 text-sm">
      {/* Avatar */}
      <div>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={fullName}
            className="w-28 h-28 rounded-xl object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-primary text-white flex items-center justify-center text-3xl font-semibold">
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
              <a href={`mailto:${user.email}`} >
                {user.email}
              </a>
            ) : "—"
          }
        />

        <Row
          icon={<Phone size={14} />}
          text={
            user.mobile ? (
              <a href={`tel:${user.mobile}`} >
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
  );
}


function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value || "—"}</div>
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