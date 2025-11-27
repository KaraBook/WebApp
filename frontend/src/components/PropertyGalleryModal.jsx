import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from "@/components/ui/dialog";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PropertyGalleryModal({ images = [], open, onClose }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((i) => (i + 1) % images.length);
  const prevSlide = () => setCurrent((i) => (i - 1 + images.length) % images.length);

  const handleKeys = useCallback((e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "Escape") onClose();
  }, []);

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>

        <DialogOverlay className="max-w-full fixed inset-0 bg-black/80 z-[999999]" />

        <DialogContent
          className="
            fixed inset-0 
            bg-transparent 
            p-0 m-0 
            max-w-full
            border-none shadow-none 
            w-screen h-screen 
            z-[9999]
            !transform-none !left-0 !top-0
            !flex-none !items-start !justify-start
          "
        >

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[10000] bg-white/20 hover:bg-white/30 
                       text-white p-2"
          >
            <X size={26} />
          </button>

          {/* LEFT ARROW */}
          {images.length > 1 && (
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-[10000] 
                         bg-white/20 hover:bg-white/30 p-3 text-white"
            >
              <ChevronLeft size={34} />
            </button>
          )}

          {/* RIGHT ARROW */}
          {images.length > 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-[10000] 
                         bg-white/20 hover:bg-white/30 p-3 text-white"
            >
              <ChevronRight size={34} />
            </button>
          )}

          {/* PERFECTLY CENTERED IMAGE */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={images[current]}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-h-[90vh] max-w-[60vw] w-[100%] object-cover mx-auto pointer-events-none"
              />
            </AnimatePresence>
          </div>

          {/* THUMBNAILS */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] 
                          flex gap-3 bg-black/40 p-3 backdrop-blur">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setCurrent(i)}
                className={`w-20 h-20 object-cover cursor-pointer border 
                  ${i === current ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}
                `}
              />
            ))}
          </div>

        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
