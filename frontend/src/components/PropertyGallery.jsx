import { useState } from "react";
import PropertyGalleryModal from "./PropertyGalleryModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function PropertyGallery({ images = [] }) {
  const [showModal, setShowModal] = useState(false);

  const main = images[0];
  const second = images[1];
  const third = images[2];
  const three = images[3];
  const four = images[4];

  if (!images.length) return null;

  return (
    <>
      {/* ================= MOBILE (EXACT AIRBNB STYLE) ================= */}
      <div className="md:hidden relative rounded-[16px] overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="mobile-property-gallery"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                onClick={() => setShowModal(true)}
                className="w-full h-[260px] object-cover cursor-pointer"
                alt=""
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= DESKTOP (UNCHANGED) ================= */}
      <div className="hidden md:flex relative gap-2 overflow-hidden">
        <img
          src={main}
          className="w-[48%] rounded-l-[14px] h-[400px] object-cover"
        />

        <div className="flex flex-col w-[25%] gap-2 relative">
          <img src={second} className="w-full h-[195px] object-cover" />
          <img src={third} className="w-full h-[195px] object-cover" />
        </div>

        <div className="flex flex-col w-[25%] gap-2 relative">
          <img
            src={three}
            className="w-full h-[195px] object-cover rounded-r-[14px] rounded-b-none"
          />
          <img
            src={four}
            className="w-full h-[195px] object-cover rounded-b-[14px] rounded-l-none"
          />

          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-4 right-4 bg-white text-gray-800 font-medium 
                       px-4 py-2 shadow hover:bg-gray-100 transition rounded-[10px]"
          >
            Show all photos
          </button>
        </div>
      </div>

      {/* MODAL */}
      <PropertyGalleryModal
        images={images}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
