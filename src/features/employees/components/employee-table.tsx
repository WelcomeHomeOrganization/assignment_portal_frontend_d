"use client";

import {Employee} from "@/features/employees/types";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Pagination} from "@/components/ui/pagination";
import {useRouter, useSearchParams} from "next/navigation";
import {Eye, Pencil} from "lucide-react";
import Link from "next/link";

interface EmployeeTableProps {
    employees: Employee[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function EmployeeTable({employees, meta}: EmployeeTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getSerialNumber = (index: number) => {
        return (meta.page - 1) * meta.limit + index + 1;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    if (employees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                    <span className="text-4xl text-muted-foreground">👤</span>
                </div>
                <h3 className="text-xl font-bold">No employees found</h3>
                <p className="text-muted-foreground">The employee list is currently empty.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-15">S/N</TableHead>
                            <TableHead>Staff ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Employment Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">
                                    {getSerialNumber(index)}
                                </TableCell>
                                <TableCell className="font-mono text-primary">
                                    {employee.staffId}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {employee.firstName} {employee.lastName}
                                </TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>
                                    {employee.mobileNumber || <span className="text-muted-foreground">—</span>}
                                </TableCell>
                                <TableCell className="capitalize">{employee.gender}</TableCell>
                                <TableCell className="capitalize">{employee.employmentType}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "uppercase text-[10px] font-bold tracking-wider",
                                            employee.status === "active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}
                                    >
                                        {employee.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(employee.joinDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                            asChild
                                        >
                                            <Link href={`/dashboard/employees/${employee.id}`}>
                                                <Eye className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                                            asChild
                                        >
                                            <Link href={`/dashboard/employees/${employee.id}/edit`}>
                                                <Pencil className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} employees
                </p>
                {meta.totalPages > 1 && (
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
