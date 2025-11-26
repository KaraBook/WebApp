import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import InvoicePreview from "@/components/InvoicePreview";
import { Loader2 } from "lucide-react";

export default function ViewInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(SummaryApi.ownerGetInvoice.url(id));
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load invoice", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  if (!invoice)
    return <div className="p-6 text-center">Invoice not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6">
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
