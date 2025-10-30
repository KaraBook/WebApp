import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IoIosArrowDropdown } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";

const filterOptions = [
    { label: "All Users", value: "all" },
    { label: "By State", value: "state" },
    { label: "By City", value: "city" },
];

const itemsPerPageDefault = 8;

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = itemsPerPageDefault;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await Axios({
                method: SummaryApi.getAllUsers.method,
                url: SummaryApi.getAllUsers.url,
            });
            setUsers(res?.data?.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;

        return users.filter((u) =>
            [u.firstName, u.lastName, u.email, u.mobile, u.city, u.state]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [users, search]);

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

    const avatarFallback = (firstName, lastName) => {
        if (!firstName && !lastName) return "U";
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    const handleCopy = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text || "");
            toast.success(`${label} copied successfully!`);
        } catch (err) {
            toast.error("Failed to copy.");
            console.error("Clipboard error:", err);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-xl font-bold">Users</h1>
                <Button className="bg-transparent text-black hover:bg-transparent" onClick={fetchUsers}>
                    Refresh
                </Button>
            </div>

            {/* Filters Row */}
            <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <h2>
                    {filterOptions.find((o) => o.value === selectedFilter)?.label ||
                        "All Users"}
                </h2>

                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search: name / email / mobile / city / state"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-48 justify-between bg-white text-primary"
                            >
                                {filterOptions.find((o) => o.value === selectedFilter)?.label ||
                                    "Select"}
                                <IoIosArrowDropdown className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
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

            {/* Table */}
            <div className="mt-6 w-full">
                <div className="overflow-x-auto border rounded-lg">
                    <div className="min-w-[1100px]">
                        <Table className="whitespace-nowrap text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Sr. No</TableHead>
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
                                        <TableRow key={u._id}>
                                            <TableCell className="text-center">
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
                                                        <span className="text-xs">Traveller</span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.mobile}</TableCell>
                                            <TableCell>{u.state || "—"}</TableCell>
                                            <TableCell>{u.city || "—"}</TableCell>
                                            <TableCell>{formatDate(u.createdAt)}</TableCell>

                                            <TableCell>
                                                <DropdownMenu
                                                    open={openDropdownId === u._id}
                                                    onOpenChange={(o) =>
                                                        setOpenDropdownId(o ? u._id : null)
                                                    }
                                                >
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <HiDotsVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-40">
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

                {/* Pagination */}
                {(!loading && totalPages > 1) && (
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
                                className={`${currentPage === i + 1 ? "bg-transparent border text-black" : "border"}`}
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
};

export default UsersPage;
