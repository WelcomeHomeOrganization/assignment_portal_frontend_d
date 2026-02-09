"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { Task } from "@/features/tasks/types";
import { Edit } from "lucide-react";

interface EditTaskButtonProps {
    task: Task;
}

export function EditTaskButton({ task }: EditTaskButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
            >
                <Edit className="h-4 w-4" />
                Edit Task
            </Button>

            <EditTaskModal
                task={task}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
