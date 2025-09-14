import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/Header";
import PhoneLoginModal from "@/components/PhoneLoginModal";
import AppRoutes from "@/routes";

export default function App() {
  const { init } = useAuthStore();
  const [showLogin, setShowLogin] = useState(null); 

  useEffect(() => {
    const run = () => {
      init().finally(() => {
        const u = useAuthStore.getState().user;
        setShowLogin(!u); 
      });
    };

    const unsub =
      useAuthStore.persist?.onFinishHydration?.(() => run()) || null;

    run();

    return () => unsub?.();
  }, [init]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setShowLogin(true)} />
      <main className="flex-1">
        <AppRoutes />
      </main>
      {showLogin !== null && (
        <PhoneLoginModal open={showLogin} onOpenChange={setShowLogin} />
      )}
    </div>
  );
}
