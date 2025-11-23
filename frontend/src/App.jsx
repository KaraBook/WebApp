import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";   
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";

export default function App() {
  const { init, loginModalOpen, showAuthModal, hideAuthModal } = useAuthStore();

  useEffect(() => {
    const run = () => {
      init().finally(() => {
        if (!useAuthStore.getState().user) {
          showAuthModal();
        }
      });
    };

    const unsub =
      useAuthStore.persist?.onFinishHydration?.(() => run()) || null;

    run();

    return () => unsub?.();
  }, [init, showAuthModal]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header onLoginClick={showAuthModal} />

      <main className="flex-1">
        <AppRoutes />
      </main>

      <Footer />

      <PhoneLoginModal 
        open={loginModalOpen}
        onOpenChange={(o) => (o ? showAuthModal() : hideAuthModal())}
      />

      <Toaster richColors position="top-center" />
    </div>
  );
}
