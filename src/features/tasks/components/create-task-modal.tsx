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
    DialogTrigger,
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
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTask } from "@/services/task.service";
import { PriorityLevels } from "@/features/tasks/types";

export function CreateTaskModal() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        deadline: "",
        priority: PriorityLevels.MEDIUM,
    });

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

        // Add optional description if provided
        if (formData.description.trim()) {
            taskData.description = formData.description.trim();
        }

        const result = await createTask(taskData);

        if (result.success) {
            toast.success(result.message || "Task created successfully");
            setOpen(false);
            setFormData({
                title: "",
                description: "",
                deadline: "",
                priority: PriorityLevels.MEDIUM,
            });
            router.refresh();
        } else {
            toast.error(result.message || "Failed to create task");
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to the system. Title, priority, and deadline are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                                rows={3}
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
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
