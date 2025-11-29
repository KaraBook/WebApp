import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";

import InvoicePreview from "@/components/InvoicePreview";

import { Loader2, Download, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export default function ViewInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const invoiceRef = useRef(null);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(SummaryApi.ownerGetInvoice.url(id));
      if (res.data.success) {
        setInvoice(res.data.data);
      } else {
        toast.error("Invoice not found");
      }
    } catch (err) {
      toast.error("Failed to load invoice");
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

      await new Promise((r) => setTimeout(r, 300)); 

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
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );

  if (!invoice)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <p className="text-lg">Invoice not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="inline w-4 h-4 mr-2" /> Go Back
        </button>
      </div>
    );


  return (
    <div className="bg-[#f5f5f7] min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary transition"
          >
            <Download size={18} />
            Download Invoice
          </button>
        </div>

        {/* INVOICE CARD */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div ref={invoiceRef}>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
}
