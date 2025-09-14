import { useAuthStore } from "../store/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-4">
      {user ? (
        <h1 className="text-black text-2xl">Welcome, {user.name}</h1>
      ) : (
        <Button>Login / Sign Up</Button> 
      )}
    </div>
  );
}
