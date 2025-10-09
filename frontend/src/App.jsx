import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";

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
    </div>
  );
}
