import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );
}
