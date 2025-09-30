import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchProperties = async () => {
    try {
      const res = await Axios.get(SummaryApi.getPublishedProperties.url);
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch published properties");
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Loading properties...</p>
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">No published properties found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Available Properties</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.map((prop) => (
          <PropertyCard key={prop._id} property={prop} />
        ))}
      </div>
    </div>
  );
}
