import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from "@/components/ui/dialog";

import { X , XIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PropertyGalleryModal({ images = [], open, onClose }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((i) => (i + 1) % images.length);
  const prevSlide = () =>
    setCurrent((i) => (i - 1 + images.length) % images.length);

  const handleKeys = useCallback(
    (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [open, handleKeys]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>

        {/* OVERLAY */}
        <DialogOverlay className="fixed inset-0 bg-black/80 z-[2147483646]" />

        {/* CONTENT */}
        <DialogContent
          className="
            fixed inset-0
            p-0 m-0
            max-w-full
            border-none shadow-none
            w-screen h-screen
            z-[2147483647]
            !transform-none !left-0 !top-0
            !flex-none
            bg-[#f7f6f2] md:bg-transparent
            [&_[aria-label='Close']]:hidden
          "
        >

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="
              absolute px-[15px] top-4 right-4 md:top-6 md:right-6
              z-[10000]
              bg-black/10 md:bg-white/20
              hover:bg-black/20 md:hover:bg-white/30
              text-black md:text-white
              p-2 rounded-full
            "
          > X
            <XIcon size={26} />
          </button>

          {/* IMAGE WRAPPER */}
          <div className="
            relative
            w-full h-full
            flex flex-col
            items-center justify-center
            pt-16 md:pt-0
          ">

            {/* IMAGE */}
            <div className="
              relative
              w-[92%] md:w-auto
              max-w-none md:max-w-[60vw]
              max-h-[45vh] md:max-h-[70vh]
            ">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={images[current]}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="
                    w-full h-auto
                    md:h-[70vh]
                    object-cover
                    rounded-[14px]
                  "
                />
              </AnimatePresence>

              {/* LEFT ARROW */}
              {images.length > 1 && (
                <button
                  onClick={prevSlide}
                  className="
                    absolute left-2 top-1/2 -translate-y-1/2
                    bg-white/90 md:bg-white/20
                    p-2 md:p-3
                    rounded-full
                    text-black md:text-white
                  "
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* RIGHT ARROW */}
              {images.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    bg-white/90 md:bg-white/20
                    p-2 md:p-3
                    rounded-full
                    text-black md:text-white
                  "
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* THUMBNAILS */}
            <div
              className="
                mt-6 md:mt-0
                md:absolute md:bottom-6
                md:left-1/2 md:-translate-x-1/2
                z-[10000]
                flex gap-3
                bg-transparent md:bg-black/40
                p-2 md:p-3
                md:backdrop-blur
                rounded-[14px]
                overflow-x-auto
                max-w-[95%]
              "
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setCurrent(i)}
                  className={`
                    w-16 h-16 md:w-20 md:h-20
                    object-cover cursor-pointer
                    border rounded-[12px]
                    ${
                      i === current
                        ? "border-black md:border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }
                  `}
                />
              ))}
            </div>

          </div>

        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
