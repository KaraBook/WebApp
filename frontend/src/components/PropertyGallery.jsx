import { useState } from "react";
import { motion } from "framer-motion";
import PropertyGalleryModal from "./PropertyGalleryModal";

export default function PropertyGallery({ images = [] }) {
  const [showModal, setShowModal] = useState(false);
  if (!images.length) return null;

  // Layout logic based on image count
  const count = images.length;
  const main = images[0];
  const second = images[1];
  const third = images[2];
  const rest = images.slice(3, 5);

  return (
    <>
      <div className="relative grid gap-2 rounded-3xl overflow-hidden">
        {count === 1 && (
          <img
            src={main}
            alt="Main"
            className="w-full h-[300px] object-cover rounded-3xl"
          />
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-2">
            <img src={main} className="h-[300px] w-full object-cover rounded-l-3xl" />
            <img src={second} className="h-[300px] w-full object-cover rounded-r-3xl" />
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-2 gap-2">
            <img src={main} className="h-[300px] w-full object-cover rounded-l-3xl" />
            <div className="grid gap-2">
              <img src={second} className="h-[145px] w-full object-cover" />
              <img src={third} className="h-[145px] w-full object-cover rounded-r-3xl" />
            </div>
          </div>
        )}

        {count > 3 && (
          <div className="grid grid-cols-2 gap-2">
            <img src={main} className="h-[300px] w-full object-cover rounded-l-3xl" />
            <div className="grid grid-cols-2 gap-2 relative">
              {images.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`object-cover h-[145px] w-full ${
                    i === 3 ? "rounded-r-3xl" : ""
                  }`}
                />
              ))}
              <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-4 right-4 bg-white text-gray-800 font-medium px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
              >
                Show all photos
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PropertyGalleryModal images={images} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
