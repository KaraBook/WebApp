import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import "leaflet/dist/leaflet.css";
import Footer from "@/components/Footer";
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";
import MobileAccountBottomNav from "./components/accounts/MobileAccountBottomNav";


export default function App() {
  const { init, loginModalOpen, showAuthModal, hideAuthModal } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const hideFooterRoutes = [
    "/checkout",
    "/account/dashboard",
    "/account/bookings",
    "/account/wishlist",
    "/account/profile",
    "/account/ratings",
    "/account/support",
    "/account/invoice/:id",
  ];

  const isAccountRoute = location.pathname.startsWith("/account");
  const isCheckoutRoute = location.pathname.startsWith("/checkout");

  const shouldHideFooter =
    isAccountRoute || (isMobile && isCheckoutRoute);


  useEffect(() => {
    const run = () => {
      init().finally(() => {
        const { user } = useAuthStore.getState();
        const alreadyShown = localStorage.getItem("loginPromptShown");
        if (!user && !alreadyShown) {
          showAuthModal();
          localStorage.setItem("loginPromptShown", "true");
        }
      });
    };
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => run()) || null;
    run();
    return () => unsub?.();
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header onLoginClick={showAuthModal} />

      <main className="flex-1">
        <AppRoutes />
      </main>

      {!shouldHideFooter && <Footer />}

      <MobileAccountBottomNav />

      <PhoneLoginModal
        open={loginModalOpen}
        onOpenChange={(o) => (o ? showAuthModal() : hideAuthModal())}
      />

      <Toaster richColors position="top-center" />
      <div
        id="recaptcha-container"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </div>
  );
}
