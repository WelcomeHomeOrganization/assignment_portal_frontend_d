"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { Task } from "@/features/tasks/types";
import { Edit } from "lucide-react";

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

interface EditTaskButtonProps {
    task: Task;
    employees: Employee[];
    ideas: Idea[];
    tasks: ParentTask[];
}

export function EditTaskButton({ task, employees, ideas, tasks }: EditTaskButtonProps) {
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
                employees={employees}
                ideas={ideas}
                tasks={tasks}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
