import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyGalleryModal({ images = [], onClose }) {
  const [current, setCurrent] = useState(0);
  const [zoom, setZoom] = useState(1);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const toggleZoom = (type) => {
    setZoom((z) => (type === "in" ? z + 0.2 : Math.max(1, z - 0.2)));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="p-0 bg-black border-0 max-w-[95vw] max-h-[95vh] overflow-hidden rounded-2xl flex items-center justify-center relative"
      >
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggleZoom("in")}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => toggleZoom("out")}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full"
          >
            <ZoomOut size={18} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full"
          >
            <X size={18} />
          </Button>
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={prevSlide}
              className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full z-10"
            >
              <ChevronLeft size={22} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={nextSlide}
              className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full z-10"
            >
              <ChevronRight size={22} />
            </Button>
          </>
        )}

        <motion.img
          key={current}
          src={images[current]}
          alt={`Image ${current + 1}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: zoom }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-full max-h-[90vh] object-contain mx-auto select-none"
        />
      </DialogContent>
    </Dialog>
  );
}
