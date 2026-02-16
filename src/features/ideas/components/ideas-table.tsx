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
import { EditIdeaModal } from "./edit-idea-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import Link from "next/link";

interface IdeasTableProps {
    ideas: Idea[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    showActions?: boolean;
    showEdit?: boolean;
}

export function IdeasTable({ ideas, meta, showActions = false, showEdit = false }: IdeasTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

    const getSerialNumber = (index: number) => {
        return (meta.page - 1) * meta.limit + index + 1;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    const toggleDescription = (ideaId: string) => {
        const newExpanded = new Set(expandedDescriptions);
        if (newExpanded.has(ideaId)) {
            newExpanded.delete(ideaId);
        } else {
            newExpanded.add(ideaId);
        }
        setExpandedDescriptions(newExpanded);
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
                            <TableHead>Author</TableHead>
                            {showActions && <TableHead className="text-center">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TooltipProvider>
                            {ideas.map((idea, index) => (
                                <TableRow key={idea.id}>
                                    <TableCell className="font-medium">
                                        {getSerialNumber(index)}
                                    </TableCell>
                                    <TableCell className="font-medium min-w-[200px] max-w-[300px]">
                                        <div className="break-words whitespace-normal">
                                            {idea.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "cursor-pointer select-text",
                                                        !expandedDescriptions.has(idea.id) && "line-clamp-2"
                                                    )}
                                                    onClick={() => toggleDescription(idea.id)}
                                                >
                                                    {idea.description}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm hidden md:block">
                                                <p className="whitespace-pre-wrap">{idea.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-mono text-primary cursor-help underline decoration-dotted">
                                                    {idea.creator.firstName} {idea.creator.lastName}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">
                                                    {idea.creator.staffId}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    {showActions && (
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/dashboard/tasks/add?ideaId=${idea.id}`}>
                                                                <ListPlus className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Create Task from Idea</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {showEdit && <EditIdeaModal idea={idea} />}
                                            </div>
                                        </TableCell>
                                    )}
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
