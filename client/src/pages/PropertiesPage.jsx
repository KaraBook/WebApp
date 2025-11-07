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
import { IoIosArrowDropdown } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { Switch } from "@/components/ui/switch";
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

const filterOptions = [
  { label: "All Properties", value: "all" },
  { label: "Blocked Properties", value: "blocked" },
  { label: "Published Properties", value: "published" },
  { label: "Featured Properties", value: "featured" },
];

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [properties, setProperties] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: null, property: null });
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const openConfirm = (type, property) => {
    setOpenDropdownId(null);
    setConfirm({ open: true, type, property });
  };

  const closeConfirm = () => setConfirm({ open: false, type: null, property: null });

  const fetchProperties = async () => {
    try {
      const response = await Axios({
        method: SummaryApi.getProperties.method,
        url: SummaryApi.getProperties.url,
      });
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
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
    setProperties((prev) => prev.map((p) => (String(p._id) === String(id) ? updated : p)));
  };

  const toggleBlock = async (property) => {
    const id = property._id;
    const current = properties.find((p) => String(p._id) === String(id));
    const isCurrentlyBlocked = current?.isBlocked;

    try {
      const res = await Axios({
        method: "put",
        url: isCurrentlyBlocked
          ? SummaryApi.toggleUnblock(id).url
          : SummaryApi.toggleBlock(id).url,
        data: { reason: isCurrentlyBlocked ? "" : "Admin blocked property" },
      });
      if (res.data?.data) updatePropertyInState(id, res.data.data);
    } catch (err) {
      console.error("Toggle block error:", err);
    }
  };

  const toggleFeatured = async (property) => {
    const id = property._id;
    try {
      const res = await Axios.put(SummaryApi.toggleFeatured(id).url);
      if (res.data?.data) updatePropertyInState(id, res.data.data);
    } catch (err) {
      console.error("Toggle feature error:", err);
    }
  };

  const togglePublish = async (property) => {
    const id = property._id;
    try {
      const res = await Axios.put(SummaryApi.togglePublish(id).url);
      if (res.data?.data) updatePropertyInState(id, res.data.data);
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  const confirmTitle = useMemo(() => {
    if (!confirm.property) return "";
    const current = properties.find((p) => String(p._id) === String(confirm.property?._id));
    if (!current) return "";
    if (confirm.type === "block")
      return current.isBlocked ? "Unblock Property" : "Block Property";
    if (confirm.type === "feature")
      return current.featured ? "Unfeature Property" : "Feature Property";
    if (confirm.type === "publish")
      return current.publishNow ? "Unpublish Property" : "Publish Property";
    return "";
  }, [confirm, properties]);

  const confirmDescription = useMemo(() => {
    if (!confirm.property) return "";
    const current = properties.find((p) => String(p._id) === String(confirm.property?._id));
    if (!current) return "";
    if (confirm.type === "block")
      return current.isBlocked
        ? "This will make the property available to edit and publish again."
        : "This will block the property. It will not be visible or editable by the owner.";
    if (confirm.type === "feature")
      return current.featured
        ? "This will remove the property from featured listings."
        : "This will add the property to featured listings.";
    if (confirm.type === "publish")
      return current.publishNow
        ? "This will unpublish the property. It will be hidden from public listings."
        : "This will publish the property and make it visible publicly.";
    return "";
  }, [confirm, properties]);

  const onConfirmAction = async () => {
    if (!confirm.property) return;
    const p = properties.find((x) => x._id === confirm.property._id);
    closeConfirm();
    try {
      if (confirm.type === "block") await toggleBlock(p);
      if (confirm.type === "feature") await toggleFeatured(p);
      if (confirm.type === "publish") await togglePublish(p);
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatusDot = (property) => {
    let color = "bg-gray-400";
    if (property.isBlocked) color = "bg-red-300";
    else if (property.publishNow) color = "bg-green-300";
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-block w-4 h-4 rounded-full ${color}`}></span>
      </div>
    );
  };

  const filteredProperties = useMemo(() => {
    switch (selectedFilter) {
      case "blocked":
        return properties.filter((p) => p.isBlocked);
      case "published":
        return properties.filter((p) => p.publishNow && !p.isBlocked);
      case "featured":
        return properties.filter((p) => p.featured && !p.isBlocked);
      default:
        return properties;
    }
  }, [properties, selectedFilter]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage]);

  return (
    <>
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Properties</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/properties/drafts")}>View Drafts</Button>
          <Button onClick={() => navigate("/add-property")}>Add Property</Button>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <h2>
          {filterOptions.find((o) => o.value === selectedFilter)?.label ||
            "All Properties"}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-64 justify-between bg-white text-primary"
            >
              {filterOptions.find((o) => o.value === selectedFilter)?.label || "Select"}
              <IoIosArrowDropdown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setSelectedFilter(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6">
        <div className="overflow-x-auto">
          <Table className="w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedProperties.map((property, index) => (
                <TableRow key={property._id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>{property.propertyName}</TableCell>
                  <TableCell>{property.resortOwner?.firstName || "N/A"}</TableCell>
                  <TableCell>{property.state}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>₹{property.pricingPerNightWeekdays}</TableCell>
                  <TableCell>{renderStatusDot(property)}</TableCell>
                  <TableCell>{property.featured ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={property.publishNow}
                      disabled={property.isBlocked}
                      onCheckedChange={() => openConfirm("publish", property)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(property.createdAt)}</TableCell>
                  <TableCell>{formatDate(property.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu
                      open={openDropdownId === property._id}
                      onOpenChange={(o) => setOpenDropdownId(o ? property._id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HiDotsVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => navigate(`/view-property/${property._id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={property.isBlocked}
                          onSelect={() => navigate(`/edit-property/${property._id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={property.isBlocked ? "text-green-600" : "text-red-600"}
                          onSelect={(e) => {
                            e.preventDefault();
                            openConfirm("block", property);
                          }}
                        >
                          {property.isBlocked ? "Unblock" : "Block"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={property.isBlocked}
                          className={
                            property.featured ? "text-yellow-600" : "text-gray-700"
                          }
                          onSelect={(e) => {
                            e.preventDefault();
                            openConfirm("feature", property);
                          }}
                        >
                          {property.featured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    No properties found
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

      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent" onClick={closeConfirm}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmAction}>
              {confirm.type === "block" &&
                (properties.find(
                  (p) => String(p._id) === String(confirm.property?._id)
                )?.isBlocked
                  ? "Unblock"
                  : "Block")}
              {confirm.type === "feature" &&
                (properties.find(
                  (p) => String(p._id) === String(confirm.property?._id)
                )?.featured
                  ? "Unfeature"
                  : "Feature")}
              {confirm.type === "publish" &&
                (properties.find(
                  (p) => String(p._id) === String(confirm.property?._id)
                )?.publishNow
                  ? "Unpublish"
                  : "Publish")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PropertiesPage;
