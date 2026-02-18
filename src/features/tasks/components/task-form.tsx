"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { createTask, searchTasks } from "@/services/task.service";
import { PriorityLevels } from "@/features/tasks/types";
import { searchIdeas } from "@/services/idea.service";
import { searchEmployeesForSelect, EmployeeSelectItem } from "@/services/employee.service";
import { uploadFile, deleteFile } from "@/services/file.service";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { Loader2, Upload, X, FileIcon, User, Check } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";


interface Idea {
    id: string;
    title: string;
}

interface Task {
    id: string;
    title: string;
}

interface TaskFormProps {
    employees?: EmployeeSelectItem[]; // Made optional as we use async search now
    ideas?: Idea[]; // Made optional
    tasks?: Task[]; // Made optional
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TaskForm({ employees = [], ideas = [], tasks = [], onSuccess, onCancel }: TaskFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
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

    // State for AsyncSearchableSelect components
    const [selectedParent, setSelectedParent] = useState<{ id: string; title: string } | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<{ id: string; title: string } | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSelectItem[]>([]);

    // Pre-fill from URL params
    useEffect(() => {
        const ideaIdParam = searchParams.get("ideaId");
        if (ideaIdParam) {
            const foundIdea = ideas.find(i => i.id === ideaIdParam);
            if (foundIdea) {
                setSelectedIdea(foundIdea);
                setFormData(prev => ({
                    ...prev,
                    ideaId: foundIdea.id,
                    title: prev.title ? prev.title : foundIdea.title
                }));
            }
        }
    }, [searchParams, ideas]);

    // Helper functions for AsyncSearchableSelect
    const searchEmployeesFn = async (query: string): Promise<{ items: EmployeeSelectItem[]; hasMore: boolean }> => {
        return await searchEmployeesForSelect(query);
    };

    const employeeDisplay = (item: EmployeeSelectItem) => `${item.firstName} ${item.lastName}`;
    const employeeSecondary = (item: EmployeeSelectItem) => item.staffId;

    const renderEmployeeOption = (item: EmployeeSelectItem, isSelected: boolean) => (
        <div className="flex items-center gap-2 p-2 w-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={item.avatar} alt={`${item.firstName} ${item.lastName}`} />
                <AvatarFallback>
                    {item.firstName?.[0]}{item.lastName?.[0]}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-medium truncate">{item.firstName} {item.lastName}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.staffId}</span>
                    {item.designation && (
                        <>
                            <span>•</span>
                            <span className="truncate">{item.designation}</span>
                        </>
                    )}
                </div>
            </div>
            {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
        </div>
    );

    const renderEmployeeSelected = (item: EmployeeSelectItem, onRemove?: (e: React.MouseEvent) => void) => (
        <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs group">
            <Avatar className="h-4 w-4">
                <AvatarImage src={item.avatar} />
                <AvatarFallback className="text-[8px]">
                    {item.firstName?.[0]}{item.lastName?.[0]}
                </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{item.firstName} {item.lastName}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-1 text-muted-foreground hover:text-foreground rounded-full p-0.5"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );

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


    // handleEmployeeToggle is removed as we use AsyncSearchableSelect

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
        } else if (selectedEmployees.length > 0) {
            // Fallback if formData.assignedTo wasn't updated correctly, or just use selectedEmployees source of truth
            taskData.assignedTo = selectedEmployees.map(e => e.id);
        }

        if (uploadedFiles.length > 0) {
            taskData.fileIds = uploadedFiles.map(f => f.id);
        }

        const result = await createTask(taskData);

        if (result.success) {
            toast.success(result.message || "Task created successfully");
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard/tasks");
            }
        } else {
            toast.error(result.message || "Failed to create task");
        }

        setLoading(false);
    };

    return (
        <div className={onCancel ? "space-y-4" : "space-y-8 max-w-(--breakpoint-2xl) mx-auto"}>
            {/* Header */}
            {/* Header - Only show if not in modal (no onCancel) */}
            {!onCancel && (
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
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
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
                                    <AsyncSearchableSelect
                                        mode="single"
                                        placeholder="Search for a parent task..."
                                        searchFn={searchTasks}
                                        value={selectedParent}
                                        onChange={(val) => {
                                            const item = val as { id: string; title: string } | null;
                                            setSelectedParent(item);
                                            setFormData({ ...formData, parentId: item?.id || "" });
                                        }}
                                        displayValue={(item) => item.title}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ideaId">Link to Idea (Optional)</Label>
                                    <AsyncSearchableSelect
                                        mode="single"
                                        placeholder="Search for an idea..."
                                        searchFn={searchIdeas}
                                        value={selectedIdea}
                                        onChange={(val) => {
                                            const item = val as { id: string; title: string } | null;
                                            setSelectedIdea(item);
                                            setFormData(prev => ({
                                                ...prev,
                                                ideaId: item?.id || "",
                                                // Auto-fill title if empty
                                                title: (item && !prev.title) ? item.title : prev.title
                                            }));
                                        }}
                                        displayValue={(item) => item.title}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Assigned Employees</Label>
                                    <AsyncSearchableSelect<EmployeeSelectItem>
                                        mode="multi"
                                        placeholder="Search employees..."
                                        searchFn={searchEmployeesFn}
                                        displayValue={employeeDisplay}
                                        secondaryValue={employeeSecondary}
                                        value={selectedEmployees}
                                        onChange={(val) => {
                                            const next = (val as EmployeeSelectItem[]) || [];
                                            setSelectedEmployees(next);
                                            setFormData(prev => ({
                                                ...prev,
                                                assignedTo: next.map(e => e.id)
                                            }));
                                        }}
                                        disabled={loading}
                                        renderOption={renderEmployeeOption}
                                        renderSelected={renderEmployeeSelected}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
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
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (onCancel) {
                                onCancel();
                            } else {
                                router.push("/dashboard/tasks");
                            }
                        }}
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
