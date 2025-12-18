import { useNavigate } from "react-router-dom";
import {
  Waves,
  Droplets,
  Mountain,
  PawPrint,
  Leaf,
  Star
} from "lucide-react";

const EXPERIENCES = [
  {
    title: "Villas Near Beach",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    icon: Waves,
    query: "experience=beach",
  },
  {
    title: "Bungalows with Pool",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    icon: Droplets,
    query: "experience=pool",
  },
  {
    title: "Hill View Cottages",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    icon: Mountain,
    query: "experience=hill",
  },
  {
    title: "Pet-Friendly Stays",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    icon: PawPrint,
    query: "petFriendly=true",
  },
  {
    title: "Farmstays",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    icon: Leaf,
    query: "experience=farm",
  },
  {
    title: "Luxury Villas",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
    icon: Star,
    query: "experience=luxury",
  },
];

export default function FindByExperience() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#faf7f4] px-4 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Find by Experience
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {EXPERIENCES.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                onClick={() => navigate(`/properties?${item.query}`)}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
              >
                <div className="relative h-[120px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <p className="text-center font-medium py-3 text-sm">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
