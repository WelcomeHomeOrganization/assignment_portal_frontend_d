"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateTask } from "@/services/task.service";
import { uploadFile, deleteFile } from "@/services/file.service";
import { PriorityLevels, Task, TaskStatus } from "@/features/tasks/types";
import { Loader2, Edit, Upload, X, FileIcon } from "lucide-react";

interface Employee {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
}

interface Idea {
    id: string;
    title: string;
}

interface ParentTask {
    id: string;
    title: string;
}

interface EditTaskModalProps {
    task: Task;
    employees: Employee[];
    ideas: Idea[];
    tasks: ParentTask[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTaskModal({ task, employees, ideas, tasks, open, onOpenChange }: EditTaskModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        parentId: task.parent?.id || "",
        ideaId: task.idea?.id || "",
        assignedTo: task.assigns.map(a => a.assignee.id),
    });

    const [files, setFiles] = useState<File[]>([]);
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
    const [existingFiles] = useState(task.taskDocs || []);
    const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Reset form when task changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                status: task.status,
                parentId: task.parent?.id || "",
                ideaId: task.idea?.id || "",
                assignedTo: task.assigns.map(a => a.assignee.id),
            });
            setFiles([]);
            setUploadedFileIds([]);
            setFilesToRemove([]);
        }
    }, [task, open]);

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

    const handleAssigneeChange = (employeeId: string, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                assignedTo: [...prev.assignedTo, employeeId]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                assignedTo: prev.assignedTo.filter(id => id !== employeeId)
            }));
        }
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
            let newFileIds: string[] = [];
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
            const updateData: any = {
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                status: formData.status,
                assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : undefined,
                fileIds: allFileIds.length > 0 ? allFileIds : undefined,
            };

            if (formData.parentId) {
                updateData.parentId = formData.parentId;
            }

            if (formData.ideaId) {
                updateData.ideaId = formData.ideaId;
            }

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

    const handleClose = () => {
        if (!loading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
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
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                        setFormData({ ...formData, priority: value })
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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
                                        setFormData({ ...formData, status: value })
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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

                        {/* Parent Task */}
                        <div className="grid gap-2">
                            <Label htmlFor="parentTask">Parent Task</Label>
                            <Select
                                value={formData.parentId || "none"}
                                onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {tasks.filter(t => t.id !== task.id).map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Link to Idea */}
                        <div className="grid gap-2">
                            <Label htmlFor="idea">Link to Idea</Label>
                            <Select
                                value={formData.ideaId || "none"}
                                onValueChange={(value) => setFormData({ ...formData, ideaId: value === "none" ? "" : value })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {ideas.map((idea) => (
                                        <SelectItem key={idea.id} value={idea.id}>
                                            {idea.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assigned Employees */}
                        <div className="grid gap-2">
                            <Label>Assigned Employees</Label>
                            <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto">
                                {employees.map((employee) => (
                                    <div key={employee.id} className="flex items-center space-x-2 py-1">
                                        <Checkbox
                                            id={`employee-${employee.id}`}
                                            checked={formData.assignedTo.includes(employee.id)}
                                            onCheckedChange={(checked) =>
                                                handleAssigneeChange(employee.id, checked as boolean)
                                            }
                                            disabled={loading}
                                        />
                                        <Label
                                            htmlFor={`employee-${employee.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {employee.firstName} {employee.lastName} ({employee.staffId})
                                        </Label>
                                    </div>
                                ))}
                            </div>
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
                                                    <FileIcon className="h-4 w-4" />
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
                                                        <X className="h-4 w-4" />
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
                                <Upload className="h-4 w-4 text-muted-foreground" />
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
                                                <X className="h-4 w-4" />
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
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
