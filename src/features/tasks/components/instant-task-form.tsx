"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createInstantTask } from "@/services/task.service";
import { uploadFile, deleteFile } from "@/services/file.service";
import { Loader2, X, FileIcon, Zap } from "lucide-react";

interface InstantTaskFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function InstantTaskForm({ onSuccess, onCancel }: InstantTaskFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string }>>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setFileUploading(true);
        const file = files[0];

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const result = await uploadFile(formDataUpload);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.title.trim()) {
            toast.error("Title is required");
            setLoading(false);
            return;
        }

        const taskData: any = {
            title: formData.title.trim(),
        };

        if (formData.description.trim()) {
            taskData.description = formData.description.trim();
        }

        if (uploadedFiles.length > 0) {
            taskData.fileIds = uploadedFiles.map(f => f.id);
        }

        const result = await createInstantTask(taskData);

        if (result.success) {
            toast.success(result.message || "Instant task created successfully");
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh(); // Refresh current page
            }
        } else {
            toast.error(result.message || "Failed to create instant task");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="file">Attachments (Optional)</Label>
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

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {uploadedFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 border rounded-md"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
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
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Zap className="h-4 w-4" />
                    )}
                    Create Instant Task
                </Button>
            </div>
        </form>
    );
}
