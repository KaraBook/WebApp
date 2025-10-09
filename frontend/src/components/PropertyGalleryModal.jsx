import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function PropertyGalleryModal({ images, onClose }) {
  useEffect(() => {
    // prevent scroll behind modal
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <Swiper
        navigation
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        className="w-full max-w-5xl h-[80vh]"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt={`photo-${i}`}
              className="w-full h-full object-contain rounded-2xl"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
