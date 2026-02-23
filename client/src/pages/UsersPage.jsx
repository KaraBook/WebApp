import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IoIosArrowDropdown } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import UserDetailsDrawer from "@/components/UserDetailsDrawer";
import MobileUserCard from "@/components/MobileUserCard";

const filterOptions = [
  { label: "All Users", value: "all" },
  { label: "Traveller", value: "traveller" },
  { label: "Resort Owner", value: "resortOwner" },
];

const itemsPerPageDefault = 8;

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


const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewUser, setViewUser] = useState({ open: false, data: null });

  const itemsPerPage = itemsPerPageDefault;

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        method: SummaryApi.getAllUsers.method,
        url: SummaryApi.getAllUsers.url,
      });
      const data = res?.data?.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FILTER + SEARCH ---
  const filtered = useMemo(() => {
    let base = users;

    // Normalize roles and apply filter
    if (selectedFilter !== "all") {
      base = base.filter(
        (u) =>
          (u.roles?.[0] || "").toLowerCase()
            .toLowerCase()
            .trim() === selectedFilter.toLowerCase()
      );
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (!q) return base;

    return base.filter((u) =>
      [u.firstName, u.lastName, u.email, u.mobile, u.city, u.state, u.roles?.join(", ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, search, selectedFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const options = { day: "numeric", month: "short", year: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const avatarFallback = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const openView = (user) => {
    setOpenDropdownId(null);
    setViewUser({ open: true, data: user });
  };
  const closeView = () => setViewUser({ open: false, data: null });

  const roleBadge = (role) => {
    if (!role) return <Badge className="bg-gray-100 text-gray-600 text-[10px]">—</Badge>;
    const r = role.toLowerCase();
    if (r === "traveller")
      return <Badge className="bg-green-100 text-green-700 text-[10px]">Traveller</Badge>;
    if (r === "resortowner" || r === "resort owner")
      return <Badge className="bg-blue-100 text-blue-700 text-[10px]">Resort Owner</Badge>;
    if (r === "admin")
      return <Badge className="bg-purple-100 text-purple-700 text-[10px]">Admin</Badge>;
    return <Badge className="bg-gray-100 text-gray-600 text-[10px]">{role}</Badge>;
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl font-bold">Users</h1>
        <Button
          className="bg-transparent text-black hover:bg-transparent"
          onClick={fetchUsers}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h2 className="font-medium">
          {filterOptions.find((o) => o.value === selectedFilter)?.label ||
            "All Users"}
        </h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Input
            placeholder="Search: name / email / mobile / city / state"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white md:min-w-[300px]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:min-w-[200px] justify-between bg-white text-primary">
                {filterOptions.find((o) => o.value === selectedFilter)?.label ||
                  "Select"}
                <IoIosArrowDropdown className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-48 py-2 flex flex-col gap-2">
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
      </div>


      {/* ---------- MOBILE LIST ---------- */}
      <div className="space-y-3 md:hidden mt-4">
        {loading && <p className="text-center py-6">Loading users…</p>}

        {!loading &&
          paginated.map((user) => (
            <MobileUserCard
              key={user._id}
              user={user}
              onView={openView}
            />
          ))}

        {!loading && paginated.length === 0 && (
          <p className="text-center py-6 text-neutral-500">
            No users found
          </p>
        )}
      </div>


      {/* Table */}
      <div className="mt-6 w-full">
        <div className="hidden md:block border rounded-lg">
          <div>
            <Table className="whitespace-nowrap  min-w-[750px] overflow-x-auto md:min-w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center hidden md:table-cell">Sr. No</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginated.map((u, index) => (
                    <TableRow
                      key={u._id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClickCapture={() => openView(u)}
                    >
                      <TableCell className="text-center hidden md:table-cell">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.firstName}
                              className="w-9 h-9 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-700">
                              {avatarFallback(u.firstName, u.lastName)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {u.firstName} {u.lastName}
                            </span>
                            <div className="mt-0.5 capitalize"><span>{u.roles?.join(", ")}</span></div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.mobile}</TableCell>
                      <TableCell>{u.state || "—"}</TableCell>
                      <TableCell>{u.city || "—"}</TableCell>
                      <TableCell>{formatDate(u.createdAt)}</TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          open={openDropdownId === u._id}
                          onOpenChange={(o) => setOpenDropdownId(o ? u._id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <HiDotsVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40">
                            <DropdownMenuItem onSelect={() => openView(u)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleCopy(u.email, "Email")}
                            >
                              Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleCopy(u.mobile, "Mobile")}
                            >
                              Copy Mobile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {!loading && totalPages > 1 && (
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

      {/* User Popup */}
      <UserDetailsDrawer
        open={viewUser.open}
        user={viewUser.data}
        onClose={closeView}
      />
    </>
  );
};

export default UsersPage;
