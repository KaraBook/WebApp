function CarouselCard({ img, title, subtitle }) {
  return (
    <div className="min-w-[220px] h-[300px] p-2 border border-gray-300 rounded-[12px]">
      <div className="relative w-full h-full rounded-[8px] overflow-hidden">
        <img
          src={img}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default CarouselCard;