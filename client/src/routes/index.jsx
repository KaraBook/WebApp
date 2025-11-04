import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import PropertiesPage from "../pages/PropertiesPage";
import ProtectedAdminRoute from "../ProtectedAdminRoute";
import AddProperty from "../pages/AddProperty";
import EditProperty from "../pages/EditProperty";
import ViewProperty from "../pages/ViewProperty";
import DraftPropertiesPage from "@/pages/DraftPropertiesPage";
import FinalizeMedia from "@/pages/FinalizeMedia";
import BlockedProperties from "@/pages/BlockedProperties";
import BookingsPage from "@/pages/BookingsPage";
import UsersPage from "@/pages/UsersPage";
import InvoicePreview from "@/components/InvoicePreview";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Axios from "../utils/Axios";


const InvoicePreviewWrapper = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await Axios.get(`/api/admin/invoice/${bookingId}`);
        if (!res.data?.success || !res.data.data) {
          toast.error("Invoice not found.");
          return;
        }
        setInvoice(res.data.data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [bookingId]);

  const downloadPDF = async () => {
    try {
      if (!invoiceRef.current) return;
      toast.info("Generating PDF...");
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, width, height);
      pdf.save(`Invoice_${invoice?.invoiceNumber || bookingId}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading invoice…</p>;

  if (!invoice)
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 text-lg">Invoice not found</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen p-2 flex flex-col items-start">
      <div className="flex justify-between w-full max-w-3xl mb-6">
        <h1 className="text-2xl font-semibold">Invoice</h1>
        <div className="flex gap-2">
          <Button className="bg-transparent text-black hover:bg-transparent" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white rounded-xl p-2 w-full max-w-5xl"
      >
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
};


function AppRoutes() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/blocked" element={<BlockedProperties />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="edit-property/:id" element={<EditProperty />} />
            <Route path="view-property/:id" element={<ViewProperty />} />
            <Route path="properties/drafts" element={<DraftPropertiesPage />} />
            <Route path="properties/:id/media" element={<FinalizeMedia />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="users" element={<UsersPage />} />

            <Route path="invoice/:bookingId" element={<InvoicePreviewWrapper />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
