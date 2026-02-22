"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Zap } from "lucide-react";
import InstantTaskForm from "./instant-task-form";

export function InstantTaskModal() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10 transition-colors">
                    <Zap className="h-4 w-4 fill-primary" />
                    Instant Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Create Instant Task
                    </DialogTitle>
                    <DialogDescription>
                        Quickly create a task with basic information.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <InstantTaskForm
                        onSuccess={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
