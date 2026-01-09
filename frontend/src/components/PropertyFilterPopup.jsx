import { X, Home, Tent, Hotel, Star, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const PROPERTY_TYPES = [
    { key: "all", label: "All Types", icon: Home },
    { key: "villa", label: "Villa", icon: Home },
    { key: "tent", label: "Tent", icon: Tent },
    { key: "cottage", label: "Cottage", icon: Home },
    { key: "hotel", label: "Hotel", icon: Hotel },
];

const RECOMMENDATIONS = [
    {
        key: "topRated",
        title: "Top Rated",
        subtitle: "4.5+ rating",
        icon: Star,
    },
    {
        key: "trending",
        title: "Trending",
        subtitle: "Popular now",
        icon: TrendingUp,
    },
    {
        key: "new",
        title: "New Arrivals",
        subtitle: "Recently added",
        icon: Sparkles,
    },
];

export default function PropertyFilterPopup({ open, onClose, onApply }) {
    const [propertyType, setPropertyType] = useState("all");
    const [price, setPrice] = useState([2000, 25000]);
    const [recommendation, setRecommendation] = useState(null);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999999] flex justify-start bg-black/40">
            {/* PANEL */}
            <div className="w-[360px] max-w-full h-full bg-white shadow-xl flex flex-col">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center">
                            ✦
                        </div>
                        <h2 className="font-semibold text-lg">Filters</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="
    w-9 h-9
    rounded-full
    flex items-center justify-center
    bg-gray-100
    hover:bg-gray-100
    transition
  "
                    >
                        <span>X</span>
                    </button>

                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-8">

                    {/* PROPERTY TYPE */}
                    <div>
                        <h3 className="font-semibold mb-3">Property Type</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {PROPERTY_TYPES.map((item) => {
                                const Icon = item.icon;
                                const active = propertyType === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setPropertyType(item.key)}
                                        className={`
                      flex items-center gap-2 px-3 py-3 rounded-xl border
                      ${active
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white border-gray-200 text-gray-700"}
                    `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PRICE RANGE */}
                    <div>
                        <h3 className="font-semibold mb-3">₹ Price Range (per night)</h3>

                        <input
                            type="range"
                            min={2000}
                            max={25000}
                            step={500}
                            value={price[1]}
                            onChange={(e) => setPrice([2000, Number(e.target.value)])}
                            className="w-full accent-primary"
                        />

                        <div className="flex justify-between mt-3">
                            <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
                                ₹{price[0].toLocaleString()}
                            </div>
                            <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
                                ₹{price[1].toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* RECOMMENDATIONS */}
                    <div>
                        <h3 className="font-semibold mb-3">Recommendations</h3>

                        <div className="space-y-3">
                            {RECOMMENDATIONS.map((item) => {
                                const Icon = item.icon;
                                const active = recommendation === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setRecommendation(item.key)}
                                        className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl border
                      ${active
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200"}
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-sm">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.subtitle}</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-5 h-5 rounded-full border ${active ? "bg-primary border-primary" : "border-gray-300"
                                                }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-[8px]"
                        onClick={() => {
                            setPropertyType("all");
                            setPrice([2000, 25000]);
                            setRecommendation(null);
                        }}
                    >
                        Reset All
                    </Button>

                    <Button
                        className="flex-1 rounded-[8px] bg-primary text-white"
                        onClick={() => {
                            onApply({
                                propertyType,
                                price,
                                recommendation,
                            });
                            onClose();
                        }}
                    >
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}
