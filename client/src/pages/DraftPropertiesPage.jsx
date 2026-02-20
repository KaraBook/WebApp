import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


const getPaginationPages = (current, total) => {
  const pages = [];
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  pages.push(1);
  if (current > 3) {
    pages.push("ellipsis-start");
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push("ellipsis-end");
  }
  pages.push(total);
  return pages;
};



export default function DraftPropertiesPage() {
  const [drafts, setDrafts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  const fetchDrafts = async () => {
    try {
      const res = await Axios({
        method: SummaryApi.getDraftProperties.method,
        url: SummaryApi.getDraftProperties.url,
      });
      setDrafts(res.data.data || []);
    } catch (e) {
      console.error("Failed to fetch drafts", e);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "2-digit",
    });

  const totalPages = Math.ceil(drafts.length / itemsPerPage);

  const paginatedDrafts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return drafts.slice(startIndex, endIndex);
  }, [drafts, currentPage]);

  const handleDeleteDraft = async () => {
    if (!deleteId) return;

    try {
      await Axios({
        method: SummaryApi.deleteProperty(deleteId).method,
        url: SummaryApi.deleteProperty(deleteId).url,
      });

      setDrafts((prev) => prev.filter((d) => d._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete draft");
    }
  };


  return (
    <>
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Draft Properties</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/properties")}>Back to All Properties</Button>
        </div>
      </div>

      <div className="mt-6 mt-6 min-h-[65vh]">
        <div className="overflow-x-auto">
          <Table className="w-[900px] overflow-x-auto md:w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDrafts.map((p, idx) => (
                <TableRow key={p._id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                  <TableCell>{p.propertyName}</TableCell>
                  <TableCell>{p.resortOwner?.firstName || "N/A"}</TableCell>
                  <TableCell>{p.state}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell>{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gray-100 text-black hover:bg-gray-100 text-black"
                      onClick={() => navigate(`/edit-property/${p._id}?step=6`)}
                    >
                      Continue
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(p._id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Draft Property?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The draft property will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100" onClick={() => setDeleteId(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteDraft}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </TableCell>
                </TableRow>
              ))}
              {paginatedDrafts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No drafts
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 mt-6 md:justify-end justify-center">
            {/* Previous */}
            <Button
              size="sm"
              className="bg-gray-200 text-black hover:bg-gray-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {getPaginationPages(currentPage, totalPages).map((page, i) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                  <span
                    key={i}
                    className="px-2 text-muted-foreground select-none"
                  >
                    …
                  </span>
                );
              }

              return (
                <Button
                  key={i}
                  size="sm"
                  variant={page === currentPage ? "" : "ghost"}
                  onClick={() => setCurrentPage(page)}
                  className="min-w-8"
                >
                  {page}
                </Button>
              );
            })}

            {/* Next */}
            <Button
              size="sm"
              className="bg-gray-200 text-black hover:bg-gray-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
