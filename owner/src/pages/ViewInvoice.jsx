import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import InvoicePreview from "@/components/InvoicePreview";
import { Loader2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export default function ViewInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const invoiceRef = useRef(null);

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

 
  const downloadPDF = async () => {
    try {
      toast.info("Generating invoice…");

      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${id}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  if (!invoice)
    return <div className="p-6 text-center">Invoice not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6 bg-white shadow-md rounded-xl">
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          <Download size={18} />
          Download Invoice
        </button>
      </div>

      <div ref={invoiceRef}>
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
