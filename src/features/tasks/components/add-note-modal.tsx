"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { addTaskSubmissionNote } from "@/services/task.service";
import { toast } from "sonner";
import { uploadFile, deleteFile } from "@/services/file.service";
import { X, FileIcon, Paperclip } from "lucide-react";

interface AddNoteModalProps {
    submissionId: string;
}

export function AddNoteModal({ submissionId }: AddNoteModalProps) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();

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
                toast.error("Failed to remove file");
            }
        } catch (error) {
            toast.error("An error occurred while removing the file");
        }
    };

    const handleSubmit = async () => {
        if (!note.trim()) return;

        setIsLoading(true);
        try {
            const fileIds = uploadedFiles.map(f => f.id);
            const response = await addTaskSubmissionNote(submissionId, note, fileIds);

            if (response.success) {
                toast.success(response.message);
                setOpen(false);
                setNote("");
                setUploadedFiles([]);
                router.refresh();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Add Note
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                        Add a note to this submission.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Warning</h5>
                        <div className="text-sm opacity-90">
                            This note isn't editable. Please recheck this before submitting.
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Type your note here..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px]"
                    />

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => document.getElementById("note-file-upload")?.click()}
                                disabled={fileUploading || isLoading}
                            >
                                <Paperclip className="h-3.5 w-3.5" />
                                <span>Attach File</span>
                            </Button>
                            <input
                                id="note-file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={fileUploading || isLoading}
                            />
                            {fileUploading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                {uploadedFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md border text-sm"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveFile(file.id)}
                                            disabled={isLoading}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !note.trim()}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
