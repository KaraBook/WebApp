import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";   
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";

export default function App() {
  const { init, loginModalOpen, showAuthModal, hideAuthModal } = useAuthStore();
  const location = useLocation();

   const hideFooterRoutes = [
    "/account/bookings",
    "/account/wishlist",
    "/account/profile",
    "/account/ratings",
    "/account/support",
    "/account/invoice/:id",
  ];

  const shouldHideFooter =
  hideFooterRoutes.some((route) => {
    if (route.includes(":id")) {
      return location.pathname.startsWith(route.replace("/:id", ""));
    }
    return location.pathname === route;
  });


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

      <PhoneLoginModal 
        open={loginModalOpen}
        onOpenChange={(o) => (o ? showAuthModal() : hideAuthModal())}
      />

      <Toaster richColors position="top-center" />
    </div>
  );
}
