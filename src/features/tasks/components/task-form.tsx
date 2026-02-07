"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TaskIcon } from "@/components/ui/icons";
import { createTask } from "@/services/task.service";
import { PriorityLevels } from "@/features/tasks/types";
import { uploadFile, deleteFile } from "@/services/file.service";
import { Loader2, Upload, X, FileIcon } from "lucide-react";
import Link from "next/link";

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

interface Task {
    id: string;
    title: string;
}

interface TaskFormProps {
    employees: Employee[];
    ideas: Idea[];
    tasks: Task[];
}

export default function TaskForm({ employees, ideas, tasks }: TaskFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string }>>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        deadline: "",
        priority: PriorityLevels.MEDIUM,
        parentId: "",
        ideaId: "",
        assignedTo: [] as string[],
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setFileUploading(true);
        const file = files[0];

        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadFile(formData);

            if (result.success && result.file) {
                setUploadedFiles(prev => [
                    ...prev,
                    { id: result.file!.id, name: file.name }
                ]);
                toast.success("File uploaded successfully");
            } else {
                toast.error(result.message || "Failed to upload file");
            }
        } catch (error) {
            toast.error("An error occurred while uploading the file");
        } finally {
            setFileUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveFile = async (fileId: string) => {
        try {
            const result = await deleteFile(fileId);
            if (result.success) {
                setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
                toast.success("File removed");
            } else {
                toast.error(result.message || "Failed to remove file");
            }
        } catch (error) {
            toast.error("An error occurred while removing the file");
        }
    };

    const handleEmployeeToggle = (employeeId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedTo: prev.assignedTo.includes(employeeId)
                ? prev.assignedTo.filter(id => id !== employeeId)
                : [...prev.assignedTo, employeeId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate required fields
        if (!formData.title.trim()) {
            toast.error("Title is required");
            setLoading(false);
            return;
        }

        if (!formData.deadline) {
            toast.error("Deadline is required");
            setLoading(false);
            return;
        }

        // Create task data object
        const taskData: any = {
            title: formData.title.trim(),
            priority: formData.priority,
            deadline: formData.deadline,
        };

        // Add optional fields
        if (formData.description.trim()) {
            taskData.description = formData.description.trim();
        }

        if (formData.parentId) {
            taskData.parentId = formData.parentId;
        }

        if (formData.ideaId) {
            taskData.ideaId = formData.ideaId;
        }

        if (formData.assignedTo.length > 0) {
            taskData.assignedTo = formData.assignedTo;
        }

        if (uploadedFiles.length > 0) {
            taskData.fileIds = uploadedFiles.map(f => f.id);
        }

        const result = await createTask(taskData);

        if (result.success) {
            toast.success(result.message || "Task created successfully");
            router.push("/dashboard/tasks");
            router.refresh();
        } else {
            toast.error(result.message || "Failed to create task");
        }

        setLoading(false);
    };

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <TaskIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Create Task</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Fill in the details below to create a new task.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/tasks">
                        ← Back to Tasks
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">
                                        Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        placeholder="Enter task description (optional)"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority">
                                            Priority <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value: string) =>
                                                setFormData({ ...formData, priority: value as PriorityLevels })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={PriorityLevels.LOWEST}>Lowest</SelectItem>
                                                <SelectItem value={PriorityLevels.LOW}>Low</SelectItem>
                                                <SelectItem value={PriorityLevels.MEDIUM}>Medium</SelectItem>
                                                <SelectItem value={PriorityLevels.HIGH}>High</SelectItem>
                                                <SelectItem value={PriorityLevels.HIGHEST}>Highest</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="deadline">
                                            Deadline <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="deadline"
                                            type="datetime-local"
                                            value={formData.deadline}
                                            onChange={(e) =>
                                                setFormData({ ...formData, deadline: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="parentId">Parent Task (Optional - for Sub-tasks)</Label>
                                    <Select
                                        value={formData.parentId || "none"}
                                        onValueChange={(value: string) =>
                                            setFormData({ ...formData, parentId: value === "none" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a parent task (optional)..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (top-level task)</SelectItem>
                                            {tasks.map((task) => (
                                                <SelectItem key={task.id} value={task.id}>
                                                    {task.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ideaId">Link to Idea (Optional)</Label>
                                    <Select
                                        value={formData.ideaId || "none"}
                                        onValueChange={(value: string) =>
                                            setFormData({ ...formData, ideaId: value === "none" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an idea (optional)..." />
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
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Attachments</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="file">Upload Files (Optional)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={handleFileUpload}
                                            disabled={fileUploading}
                                            className="flex-1"
                                        />
                                        {fileUploading && (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Uploaded Files:</Label>
                                        {uploadedFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2 border rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{file.name}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRemoveFile(file.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Assign Employees */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assign to Employees (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {employees.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No employees available</p>
                                    ) : (
                                        employees.map((employee) => (
                                            <div key={employee.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={employee.id}
                                                    checked={formData.assignedTo.includes(employee.id)}
                                                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                                                />
                                                <label
                                                    htmlFor={employee.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                >
                                                    {employee.firstName} {employee.lastName}
                                                    <span className="text-muted-foreground ml-2">
                                                        ({employee.staffId})
                                                    </span>
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {formData.assignedTo.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            {formData.assignedTo.length} employee(s) selected
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/tasks")}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Task"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
