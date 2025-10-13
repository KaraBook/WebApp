import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await Axios.get(SummaryApi.getPublishedProperties.url, {
        params: filters,
      });
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch published properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="max-w-full mx-auto">
      {/* Banner */}
      <div className="relative w-full">
        <img
          src="/propertiesBanner.jpg"
          alt="Properties Banner"
          className="w-full h-72 object-cover"
        />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 w-full max-w-5xl px-4 z-[99999]">
          <PropertyFilters onFilter={fetchProperties} />
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#efcc61] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 text-sm">Loading resorts...</p>
          </div>
        ) : !properties.length ? (
          <p className="text-center text-gray-500 py-20">No resorts found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-300">
            {properties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}

      </div>


    </div>
  );
}
