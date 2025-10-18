import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";
import { Toaster } from "sonner";

export default function App() {
  const { init, loginModalOpen, showAuthModal, hideAuthModal, user } = useAuthStore();

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
      <Header onLoginClick={showAuthModal} />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <PhoneLoginModal open={loginModalOpen} onOpenChange={(o) => (o ? showAuthModal() : hideAuthModal())} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "white",
            color: "#1f2937",
            border: "1px solid #f3f3f3",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: "14px 18px",
            fontFamily: "Inter, sans-serif",
          },
          className: "custom-toast",
          duration: 2500,
        }}
        richColors
      />
    </div>
  );
}
