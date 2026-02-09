"use client";

import React, {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {toast} from "sonner";
import {updateTask} from "@/services/task.service";
import {searchTasks} from "@/services/task.service";
import {searchEmployees} from "@/services/employee.service";
import {searchIdeas} from "@/services/idea.service";
import {uploadFile, deleteFile} from "@/services/file.service";
import {PriorityLevels, Task, TaskStatus} from "@/features/tasks/types";
import {Loader2, Edit, Upload, X, FileIcon, Check} from "lucide-react";
import {AsyncSearchableSelect, SearchFunction} from "@/components/ui/async-searchable-select";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

// Types for searchable items
interface EmployeeItem {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
}

interface IdeaItem {
    id: string;
    title: string;
    description?: string;
}

interface TaskItem {
    id: string;
    title: string;
}

interface EditTaskModalProps {
    task: Task;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function EditTaskModal({task, open, onOpenChange}: EditTaskModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
    });

    // Selected items for async selects
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeItem[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
    const [selectedParentTask, setSelectedParentTask] = useState<TaskItem | null>(null);

    // File handling
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles] = useState(task.taskDocs || []);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Reset form when task changes or modal opens
    useEffect(() => {
        if (task && open) {
            setFormData({
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                status: task.status,
            });

            // Set initial selected employees from task.assigns
            const initialEmployees: EmployeeItem[] = task.assigns.map(a => ({
                id: a.assignee.id,
                staffId: a.assignee.staffId,
                firstName: a.assignee.firstName,
                lastName: a.assignee.lastName,
            }));
            setSelectedEmployees(initialEmployees);

            // Set initial idea if exists
            if (task.idea) {
                setSelectedIdea({
                    id: task.idea.id,
                    title: task.idea.title,
                    description: task.idea.description,
                });
            } else {
                setSelectedIdea(null);
            }

            // Set initial parent task if exists
            if (task.parent) {
                setSelectedParentTask({
                    id: task.parent.id,
                    title: task.parent.title,
                });
            } else {
                setSelectedParentTask(null);
            }

            setFiles([]);
            setFilesToRemove([]);
        }
    }, [task, open]);

    // Search functions wrapped for the component
    const searchEmployeesFn: SearchFunction<EmployeeItem> = useCallback(async (query, page, limit) => {
        const result = await searchEmployees(query, page, limit);
        return {
            items: result.items.map(emp => ({
                id: emp.id,
                staffId: emp.staffId,
                firstName: emp.firstName,
                lastName: emp.lastName,
            })),
            hasMore: result.hasMore,
        };
    }, []);

    const searchIdeasFn: SearchFunction<IdeaItem> = useCallback(async (query, page, limit) => {
        const result = await searchIdeas(query, page, limit);
        return {
            items: result.items.map(idea => ({
                id: idea.id,
                title: idea.title,
                description: idea.description,
            })),
            hasMore: result.hasMore,
        };
    }, []);

    const searchTasksFn: SearchFunction<TaskItem> = useCallback(async (query, page, limit) => {
        const result = await searchTasks(query, page, limit);
        return {
            items: result.items.map(t => ({
                id: t.id,
                title: t.title,
            })),
            hasMore: result.hasMore,
        };
    }, []);

    // Memoized display and secondary value functions to avoid changing prop identity
    const employeeDisplay = useCallback((emp: EmployeeItem) => `${emp.firstName} ${emp.lastName}`, []);
    const employeeSecondary = useCallback((emp: EmployeeItem) => emp.staffId, []);
    const ideaDisplay = useCallback((idea: IdeaItem) => idea.title, []);
    const ideaSecondary = useCallback((idea: IdeaItem) => idea.description || "", []);
    const taskDisplay = useCallback((t: TaskItem) => t.title, []);
    // Memoize excludeIds arrays
    const parentExcludeIds = React.useMemo(() => [task.id], [task.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleRemoveExistingFile = (fileId: string) => {
        setFilesToRemove([...filesToRemove, fileId]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        setLoading(true);

        try {
            // Upload new files if any
            const newFileIds: string[] = [];
            if (files.length > 0) {
                setUploading(true);
                for (const file of files) {
                    const formData = new FormData();
                    formData.append("file", file);
                    const result = await uploadFile(formData);
                    if (result.success && result.file) {
                        newFileIds.push(result.file.id);
                    }
                }
                setUploading(false);
            }

            // Delete files marked for removal
            for (const fileId of filesToRemove) {
                await deleteFile(fileId);
            }

            // Combine existing files (not removed) with new files
            const remainingFileIds = existingFiles
                .filter(doc => !filesToRemove.includes(doc.file.id))
                .map(doc => doc.file.id);
            const allFileIds = [...remainingFileIds, ...newFileIds];

            // Prepare update data
            const updateData: Record<string, unknown> = {
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                status: formData.status,
                assignedTo: selectedEmployees.length > 0 ? selectedEmployees.map(e => e.id) : [],
                fileIds: allFileIds.length > 0 ? allFileIds : [],
                parentId: selectedParentTask ? selectedParentTask.id : null,
                ideaId: selectedIdea ? selectedIdea.id : null,
            };

            // console.log(updateData)
            const result = await updateTask(task.id, updateData);

            if (result.success) {
                toast.success(result.message || "Task updated successfully");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to update task");
            }
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("An error occurred while updating the task");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (newOpen: boolean) => {
        // Forward Radix dialog open state to parent, but prevent changes while loading
        if (!loading) {
            onOpenChange(newOpen);
        }
    };

    // Renderers
    const renderEmployeeOption = (emp: EmployeeItem, isSelected: boolean) => (
        <div className="flex items-center gap-3 w-full">
            <div className="relative">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(emp.firstName, emp.lastName)}</AvatarFallback>
                </Avatar>
                {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-[2px]">
                        <Check className="h-2 w-2"/>
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{emp.firstName} {emp.lastName}</span>
                <span className="text-xs text-muted-foreground">{emp.staffId}</span>
            </div>
        </div>
    );

    const renderEmployeeSelected = (emp: EmployeeItem, onRemove?: (e: React.MouseEvent) => void) => (
        <div className="inline-flex items-center gap-2 px-2 py-1 bg-secondary rounded-full border">
            <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">{getInitials(emp.firstName, emp.lastName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{emp.firstName} {emp.lastName}</span>
            {onRemove && (
                <div
                    role="button"
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3"/>
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary"/>
                        Edit Task
                    </DialogTitle>
                    <DialogDescription>
                        Update task information. Note: Deadline has a separate extension feature.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                                disabled={loading}
                            />
                        </div>

                        {/* Priority and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: PriorityLevels) =>
                                        setFormData({...formData, priority: value})
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(PriorityLevels).map((priority) => (
                                            <SelectItem key={priority} value={priority}>
                                                {priority}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: TaskStatus) =>
                                        setFormData({...formData, status: value})
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(TaskStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Parent Task - Searchable */}
                        <div className="grid gap-2">
                            <Label>Parent Task</Label>
                            <AsyncSearchableSelect<TaskItem>
                                mode="single"
                                placeholder="Search parent task..."
                                searchFn={searchTasksFn}
                                displayValue={taskDisplay}
                                value={selectedParentTask}
                                onChange={(val) => {
                                    const next = val as TaskItem | null;
                                    setSelectedParentTask(prev => (prev?.id === next?.id ? prev : next));
                                }}
                                disabled={loading}
                                excludeIds={parentExcludeIds}
                            />
                        </div>

                        {/* Link to Idea - Searchable */}
                        <div className="grid gap-2">
                            <Label>Link to Idea</Label>
                            <AsyncSearchableSelect<IdeaItem>
                                mode="single"
                                placeholder="Search ideas..."
                                searchFn={searchIdeasFn}
                                displayValue={ideaDisplay}
                                secondaryValue={ideaSecondary}
                                value={selectedIdea}
                                onChange={(val) => {
                                    const next = val as IdeaItem | null;
                                    setSelectedIdea(prev => (prev?.id === next?.id ? prev : next));
                                }}
                                disabled={loading}
                            />
                        </div>

                        {/* Assigned Employees - Searchable Multi-select */}
                        <div className="grid gap-2">
                            <Label>Assigned Employees</Label>
                            <AsyncSearchableSelect<EmployeeItem>
                                mode="multi"
                                placeholder="Search employees..."
                                searchFn={searchEmployeesFn}
                                displayValue={employeeDisplay}
                                secondaryValue={employeeSecondary}
                                value={selectedEmployees}
                                onChange={(val) => {
                                    const next = (val as EmployeeItem[]) || [];
                                    setSelectedEmployees(prev => {
                                        if (prev.length === next.length && prev.every((p, i) => p.id === next[i].id)) {
                                            return prev;
                                        }
                                        return next;
                                    });
                                }}
                                disabled={loading}
                                renderOption={renderEmployeeOption}
                                renderSelected={renderEmployeeSelected}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="files">Attach Files</Label>

                            {/* Existing Files */}
                            {existingFiles.length > 0 && (
                                <div className="space-y-2 mb-2">
                                    <p className="text-xs text-muted-foreground">Existing files:</p>
                                    {existingFiles.map((doc) => {
                                        const isRemoved = filesToRemove.includes(doc.file.id);
                                        return (
                                            <div
                                                key={doc.file.id}
                                                className={`flex items-center justify-between p-2 border rounded ${isRemoved ? "opacity-50 line-through" : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileIcon className="h-4 w-4"/>
                                                    <span className="text-sm">{doc.file.originalName}</span>
                                                </div>
                                                {!isRemoved && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveExistingFile(doc.file.id)}
                                                        disabled={loading}
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New Files */}
                            <div className="flex items-center gap-2">
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={loading}
                                    className="flex-1"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground"/>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <p className="text-xs text-muted-foreground">New files to upload:</p>
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 border rounded"
                                        >
                                            <span className="text-sm">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    {uploading ? "Uploading..." : "Updating..."}
                                </>
                            ) : (
                                "Update Task"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
