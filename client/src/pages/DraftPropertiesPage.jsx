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

export default function DraftPropertiesPage() {
  const [drafts, setDrafts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

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

  return (
    <>
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Draft Properties</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/properties")}>Back to Properties</Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="overflow-x-auto">
          <Table>
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
                      className="bg-transparent"
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/properties/${p._id}/media`)}
                    >
                      Continue
                    </Button>
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
          <div className="flex justify-end items-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="border bg-transparent text-black"
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "default bg-transparent" : "bg-transparent"}
                className={`${
                  currentPage === i + 1
                    ? "bg-transparent border text-black"
                    : "border"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="border bg-transparent text-black"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
