"use client";

import { TaskSubmissionNote } from "@/features/tasks/types";
import { AddNoteModal } from "./add-note-modal";
import { User } from "lucide-react";
import { SubmissionFiles } from "./submission-files";

interface SubmissionNotesProps {
    submissionId: string;
    notes: TaskSubmissionNote[];
    isCompleted?: boolean;
}

export function SubmissionNotes({ submissionId, notes, isCompleted = false }: SubmissionNotesProps) {
    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">Notes ({notes.length})</h4>
                {!isCompleted && <AddNoteModal submissionId={submissionId} />}
            </div>

            {notes.length > 0 ? (
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                    {notes.map((note) => (
                        <div key={note.id} className="bg-background rounded-md p-3 text-sm border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="font-medium text-xs">
                                        {note.actor.firstName} {note.actor.lastName}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(note.createdAt).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: true
                                    })}
                                </span>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap pl-8">{note.note}</p>
                            {note.files && note.files.length > 0 && (
                                <div className="pl-8">
                                    <SubmissionFiles files={note.files} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground italic pl-4">No notes yet.</p>
            )}
        </div>
    );
}
