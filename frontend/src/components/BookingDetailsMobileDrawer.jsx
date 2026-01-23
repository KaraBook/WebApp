import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function BookingDetailsMobileDrawer({
    open,
    onClose,
    children,
}) {
    const [visible, setVisible] = useState(false);
    const startY = useRef(0);

    const onTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
        const diff = e.touches[0].clientY - startY.current;
        if (diff > 80) handleClose();
    };


    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 250);
    };

    return createPortal(
        <>
            {/* backdrop */}
            <div
                className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}`}
                onClick={handleClose}
            />

            {/* drawer */}
            <div className="fixed inset-0 z-[9999] flex items-end">
                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onClick={(e) => e.stopPropagation()}
                    className={`
            w-full bg-white rounded-t-2xl shadow-xl
            transform transition-transform duration-300
            ${visible ? "translate-y-0" : "translate-y-full"}
          `}
                >
                    <div className="mx-auto mt-2 mb-1 w-12 h-1.5 rounded-full bg-gray-300" />
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
