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
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
        >
          <Menu />
        </Button>
      </div>
    </header>
  );
}
