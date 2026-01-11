import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/accounts/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";

export default function AccountLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex flex-1">
        <Sidebar className="sticky top-0 h-screen" />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
