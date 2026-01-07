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

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise((r) => setTimeout(r, 200));

      const element = invoiceRef.current;
      if (!element) return;

      const root = element;

      const prevMargin = root.style.margin;
      const prevPaddingTop = root.style.paddingTop;
      const prevBoxShadow = root.style.boxShadow;

      root.style.margin = "0";
      root.style.paddingTop = "0";
      root.style.boxShadow = "none";

      const prevWidth = root.style.width;
      const prevMaxWidth = root.style.maxWidth;

      root.style.width = "794px";
      root.style.maxWidth = "794px";

      const canvas = await html2canvas(root, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: 794,
      });

      root.style.margin = prevMargin;
      root.style.paddingTop = prevPaddingTop;
      root.style.boxShadow = prevBoxShadow;
      root.style.width = prevWidth;
      root.style.maxWidth = prevMaxWidth;

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, imgHeight);
      pdf.save(`Invoice_${id}.pdf`);

      toast.success("Invoice downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (!invoice) {
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
  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen px-4 md:px-6 py-10">
      <div className="max-w-3xl mx-auto">

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

        <div
          ref={invoiceRef}
          className="invoice-root bg-white max-w-4xl mx-auto border rounded-lg px-4 sm:px-8 py-6 sm:py-10 text-sm text-gray-800"
        >
          <InvoicePreview invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
