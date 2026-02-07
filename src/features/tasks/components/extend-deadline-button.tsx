"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExtendDeadlineModal } from "@/features/tasks/components/extend-deadline-modal";
import { CalendarClock } from "lucide-react";

interface ExtendDeadlineButtonProps {
    taskId: string;
    currentDeadline: string;
}

export function ExtendDeadlineButton({ taskId, currentDeadline }: ExtendDeadlineButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2"
            >
                <CalendarClock className="h-4 w-4" />
                Extend Deadline
            </Button>

            <ExtendDeadlineModal
                taskId={taskId}
                currentDeadline={currentDeadline}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
