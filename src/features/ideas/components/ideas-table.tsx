"use client";

import { Idea } from "@/features/ideas/types";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface IdeasTableProps {
    ideas: Idea[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function IdeasTable({ ideas, meta }: IdeasTableProps) {
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

    if (ideas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                    <span className="text-4xl text-muted-foreground">💡</span>
                </div>
                <h3 className="text-xl font-bold">No ideas found</h3>
                <p className="text-muted-foreground">The ideas list is currently empty.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[60px]">S/N</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Staff ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TooltipProvider>
                            {ideas.map((idea, index) => (
                                <TableRow key={idea.id}>
                                    <TableCell className="font-medium">
                                        {getSerialNumber(index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {idea.title}
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="line-clamp-2">
                                            {idea.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-mono text-primary cursor-help underline decoration-dotted">
                                                    {idea.creator.staffId}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">
                                                    {idea.creator.firstName} {idea.creator.lastName}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TooltipProvider>
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} ideas
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
