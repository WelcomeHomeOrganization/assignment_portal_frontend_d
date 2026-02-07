"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

interface FileMetadata {
    id: string;
    uniqueName: string;
    originalName: string;
    path: string;
    mimeType: string;
    sizeKb: string;
    storage: string;
    usedAt: string;
    createdAt: string;
    updatedAt: string;
}

interface TaskDoc {
    id: string;
    file: FileMetadata;
    createdAt: string;
    updatedAt: string;
}

interface TaskFilesProps {
    taskDocs: TaskDoc[];
}

export function TaskFiles({ taskDocs }: TaskFilesProps) {
    if (!taskDocs || taskDocs.length === 0) return null;

    const handleDownload = (filePath: string, fileName: string) => {
        // Use Next.js API route to proxy download and avoid CORS
        const downloadUrl = `/api/download?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Attached Files ({taskDocs.length})</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {taskDocs.map((doc) => {
                    if (!doc.file) return null;

                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3001';
                    const filePath = doc.file.path?.replace(/\\/g, '/') || '';
                    const fileUrl = `${backendUrl}/${filePath}`;
                    const isImage = doc.file.mimeType?.startsWith('image/') || false;

                    return (
                        <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                        >
                            {isImage ? (
                                <img
                                    src={fileUrl}
                                    alt={doc.file.originalName || 'File'}
                                    className="w-12 h-12 object-cover rounded border"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {doc.file.originalName || 'Unknown file'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {doc.file.sizeKb ? `${doc.file.sizeKb} KB` : 'Unknown size'}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                {isImage ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            asChild
                                        >
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="View image"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            onClick={() => handleDownload(filePath, doc.file.originalName)}
                                            title="Download image"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 flex-shrink-0"
                                        onClick={() => handleDownload(filePath, doc.file.originalName)}
                                        title="Download file"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
