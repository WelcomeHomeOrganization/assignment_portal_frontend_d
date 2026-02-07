"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { extendTaskDeadline } from "@/services/task.service";
import { Loader2, Calendar } from "lucide-react";

interface ExtendDeadlineModalProps {
    taskId: string;
    currentDeadline: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExtendDeadlineModal({ taskId, currentDeadline, open, onOpenChange }: ExtendDeadlineModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [newDeadline, setNewDeadline] = useState("");

    // Format current deadline for display
    const formattedCurrentDeadline = new Date(currentDeadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDeadline) {
            toast.error("Please select a new deadline");
            return;
        }

        // Validate that new deadline is in the future
        const selectedDate = new Date(newDeadline);
        const currentDate = new Date(currentDeadline);

        if (selectedDate <= currentDate) {
            toast.error("New deadline must be after the current deadline");
            return;
        }

        setLoading(true);

        const result = await extendTaskDeadline(taskId, newDeadline);

        if (result.success) {
            toast.success(result.message || "Deadline extended successfully");
            onOpenChange(false);
            router.refresh();
        } else {
            toast.error(result.message || "Failed to extend deadline");
        }

        setLoading(false);
    };

    const handleClose = () => {
        if (!loading) {
            setNewDeadline("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Extend Deadline
                    </DialogTitle>
                    <DialogDescription>
                        Extend the deadline for this task. The current deadline is <strong>{formattedCurrentDeadline}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto px-1">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="newDeadline">
                                    New Deadline <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="newDeadline"
                                    type="datetime-local"
                                    value={newDeadline}
                                    onChange={(e) => setNewDeadline(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select a date and time that is after the current deadline
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Extending...
                                </>
                            ) : (
                                "Extend Deadline"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
