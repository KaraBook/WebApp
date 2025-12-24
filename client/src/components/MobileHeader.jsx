import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileHeader({ onMenuClick }) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="text-lg font-semibold text-primary">
          Logo
        </span>

        <Button
          onClick={onMenuClick}
          className="px-2 py-1 text-[18px] bg-gray-200 text-black hover:bg-gray-300 h-8"
        >
          <Menu />
        </Button>
      </div>
    </header>
  );
}
