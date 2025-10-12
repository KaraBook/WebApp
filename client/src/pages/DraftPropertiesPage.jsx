import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

export default function DraftPropertiesPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

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
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "2-digit" });

  return (
    <>
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Draft Properties</h1>
        <div className="flex gap-2">
          <Button  onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
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
              {drafts.map((p, idx) => (
                <TableRow key={p._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{p.propertyName}</TableCell>
                  <TableCell>{p.resortOwner?.firstName || "N/A"}</TableCell>
                  <TableCell>{p.state}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell>{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button className="bg-transparent" size="sm" variant="outline" onClick={() => navigate(`/admin/properties/${p._id}/media`)}>
                      Continue
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {drafts.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No drafts</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
