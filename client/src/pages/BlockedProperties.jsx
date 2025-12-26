import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";


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


const BlockedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    property: null,
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(properties.length / itemsPerPage) || 1;

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return properties.slice(start, start + itemsPerPage);
  }, [properties, currentPage]);


  const openConfirm = (type, property) => {
    setOpenDropdownId(null);
    setConfirm({ open: true, type, property });
  };
  const closeConfirm = () =>
    setConfirm({ open: false, type: null, property: null });

  const fetchProperties = async () => {
    try {
      const response = await Axios.get(
        "/api/properties?isDraft=false&blocked=true"
      );
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Error fetching blocked properties:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const updatePropertyInState = (id, updated) => {
    setProperties((prev) =>
      prev.map((p) => (String(p._id) === String(id) ? updated : p))
    );
  };

  // Unblock property
  const toggleBlock = async (property) => {
    const id = property._id;
    try {
      const res = await Axios.put(SummaryApi.toggleUnblock(id).url, {
        reason: "",
      });
      if (res.data?.data) {
        setProperties((prev) =>
          prev.filter((p) => String(p._id) !== String(id))
        );
      }
    } catch (err) {
      console.error("Unblock error:", err);
    }
  };

  const confirmTitle = useMemo(() => {
    if (!confirm.property) return "";
    return confirm.type === "block" && confirm.property.isBlocked
      ? "Unblock Property"
      : "";
  }, [confirm]);

  const confirmDescription = useMemo(() => {
    if (!confirm.property) return "";
    if (confirm.type === "block") {
      return "This will make the property available to edit and publish again.";
    }
    return "";
  }, [confirm]);

  const onConfirmAction = async () => {
    if (!confirm.property) return;
    closeConfirm();

    try {
      if (confirm.type === "block") await toggleBlock(confirm.property);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Blocked Properties</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/properties")}>
            Back to All Properties
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 min-h-[65vh]">
        <div className="overflow-x-auto">
          <Table className="w-[900px] overflow-x-auto md:w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProperties.map((property, index) => (
                <TableRow key={property._id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{property.propertyName}</TableCell>
                  <TableCell>
                    {property.resortOwner?.firstName || "N/A"}
                  </TableCell>
                  <TableCell>{property.state}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>₹{property.pricingPerNightWeekdays}</TableCell>
                  <TableCell>{formatDate(property.createdAt)}</TableCell>
                  <TableCell>{formatDate(property.updatedAt)}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu
                      open={openDropdownId === property._id}
                      onOpenChange={(o) =>
                        setOpenDropdownId(o ? property._id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HiDotsVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() =>
                            navigate(`/view-property/${property._id}`)
                          }
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-green-600"
                          onSelect={(e) => {
                            e.preventDefault();
                            openConfirm("block", property);
                          }}
                        >
                          Unblock
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {properties.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No blocked property
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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
      </div>

      {/* Global Confirmation Modal */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent" onClick={closeConfirm}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmAction}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockedProperties;
