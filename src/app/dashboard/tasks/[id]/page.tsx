import { getTaskById } from "@/services/task.service";
import { TaskIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskStatus, PriorityLevels } from "@/features/tasks/types";
import { Calendar, User, Users, FileText, CalendarClock, Send } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskFiles } from "@/features/tasks/components/task-files";
import { ExtendDeadlineButton } from "@/features/tasks/components/extend-deadline-button";
import { EditTaskButton } from "@/features/tasks/components/edit-task-button";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { SubmitTaskButton } from "@/features/tasks/components/submit-task-button";
import { SubmissionNotes } from "@/features/tasks/components/submission-notes";
import { SubmissionFiles } from "@/features/tasks/components/submission-files";
import { ReviewSubmissionButtons } from "@/features/tasks/components/review-submission-buttons";

interface TaskDetailPageProps {
    params: Promise<{ id: string }>;
}

// Helper functions from tasks-table
const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
        case TaskStatus.DRAFT:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        case TaskStatus.PENDING:
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case TaskStatus.ON_PROCESS:
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case TaskStatus.REVIEW:
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        case TaskStatus.COMPLETE:
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case TaskStatus.CANCEL:
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
};

const getPriorityColor = (priority: PriorityLevels): string => {
    switch (priority) {
        case PriorityLevels.LOWEST:
            return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
        case PriorityLevels.LOW:
            return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        case PriorityLevels.MEDIUM:
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case PriorityLevels.HIGH:
            return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
        case PriorityLevels.HIGHEST:
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
    const { id } = await params;
    const task = await getTaskById(id);
    if (!task) {
        notFound();
    }

    // Get current user from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);
    const currentUserId = session?.user.id;

    const isCreator = currentUserId && task.creator.user?.id === currentUserId;

    // Check if current user is assigned to this task
    const isAssigned = currentUserId && task.assigns.some(
        assign => assign.assignee.user?.id === currentUserId
    );

    // Use the last extended deadline if it exists, otherwise use the original deadline
    let deadlineToUse = task.deadline;
    let isExtendedDeadline = false;

    if (task.extendedDeadlines && task.extendedDeadlines.length > 0) {
        const lastExtendedDeadline = task.extendedDeadlines[task.extendedDeadlines.length - 1];
        deadlineToUse = lastExtendedDeadline.deadline;
        isExtendedDeadline = true;
    }

    const deadline = new Date(deadlineToUse);
    const isOverdue = deadline < new Date();

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <TaskIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Task Details</h1>
                    </div>
                    <p className="text-muted-foreground">
                        View detailed information about this task.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isCreator && (
                        <>
                            <EditTaskButton task={task} />
                            <ExtendDeadlineButton taskId={task.id} currentDeadline={deadlineToUse} />
                        </>
                    )}
                    {isAssigned && task.status === TaskStatus.ON_PROCESS && (
                        <SubmitTaskButton taskId={task.id} />
                    )}
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/tasks">
                            ← Back to Tasks
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6">
                {/* Title and Description Section */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
                            {task.description && (
                                <p className="text-muted-foreground mt-3">
                                    {task.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs font-bold tracking-wider",
                                    getStatusColor(task.status)
                                )}
                            >
                                {task.status === TaskStatus.PENDING
                                    ? "Unassigned"
                                    : task.status === TaskStatus.ON_PROCESS
                                        ? "Assigned"
                                        : task.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs font-bold tracking-wider",
                                    getPriorityColor(task.priority)
                                )}
                            >
                                {task.priority}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Deadline:</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                isOverdue && "text-red-600"
                            )}>
                                {deadline.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })} at {deadline.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                            {isExtendedDeadline && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                >
                                    Extended
                                </Badge>
                            )}
                            {isOverdue && (
                                <Badge variant="destructive" className="text-[10px]">
                                    Overdue
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Parent Task Info (if this is a sub-task) */}
                {task.parent && (
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Parent Task</h3>
                        </div>
                        <div className="space-y-3">
                            <p className="font-medium text-base">{task.parent.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-[10px] font-bold",
                                        getStatusColor(task.parent.status)
                                    )}
                                >
                                    {task.parent.status}
                                </Badge>
                                <span className="text-sm font-medium text-muted-foreground ml-2">Priority:</span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-[10px] font-bold",
                                        getPriorityColor(task.parent.priority)
                                    )}
                                >
                                    {task.parent.priority}
                                </Badge>
                            </div>
                            <Button variant="outline" size="sm" asChild className="w-fit">
                                <Link href={`/dashboard/tasks/${task.parent.id}`}>
                                    View Parent Task
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}


                {/* Linked Idea (if task is linked to an idea) */}
                {task.idea && (
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Linked Idea</h3>
                        </div>
                        <div className="space-y-3">
                            <p className="font-medium text-base">{task.idea.title}</p>
                            {task.idea.description && (
                                <p className="text-sm text-muted-foreground">{task.idea.description}</p>
                            )}
                        </div>
                    </div>
                )}


                {/* Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Creator Info */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Creator</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">{task.creator.firstName} {task.creator.lastName}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Staff ID: <span className="font-mono">{task.creator.staffId}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">{task.creator.email}</p>
                            </div>
                        </div>

                        {/* Deadline History */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Deadline History</h3>
                            </div>
                            <div className="space-y-3">
                                {/* Original Deadline */}
                                <div className="flex items-start gap-3 pb-3 border-b">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">Original Deadline</p>
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                                                Initial
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(task.deadline).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })} at {new Date(task.deadline).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Extended Deadlines */}
                                {task.extendedDeadlines && task.extendedDeadlines.length > 0 ? (
                                    task.extendedDeadlines.map((extDeadline, index) => {
                                        const isLast = index === task.extendedDeadlines.length - 1;
                                        return (
                                            <div key={extDeadline.id} className={cn("flex items-start gap-3", !isLast && "pb-3 border-b")}>
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full mt-2 flex-shrink-0",
                                                    isLast ? "bg-orange-500" : "bg-muted-foreground"
                                                )} />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium">Extended Deadline {index + 1}</p>
                                                        {isLast && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                                            >
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(extDeadline.deadline).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })} at {new Date(extDeadline.deadline).toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Extended on {new Date(extDeadline.createdAt).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">No deadline extensions</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Assignees */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Assignees</h3>
                            </div>
                            {task.assigns.length > 0 ? (
                                <div className="space-y-3">
                                    {task.assigns.map((assign) => (
                                        <div key={assign.id} className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {assign.assignee.firstName} {assign.assignee.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {assign.assignee.staffId}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No assignees</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Task Documents */}
                <TaskFiles taskDocs={task.taskDocs} />

                {/* Task Submissions */}
                {task.submissions && task.submissions.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Send className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Submissions ({task.submissions.length})</h3>
                        </div>
                        <div className="space-y-4">
                            {task.submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="p-4 rounded-lg border bg-muted/50"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{submission.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    by {submission.submitter.firstName} {submission.submitter.lastName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <p>{new Date(submission.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            })}</p>
                                            <p>{new Date(submission.createdAt).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}</p>
                                            {submission.status && (
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "mt-2 text-[10px] font-bold tracking-wider",
                                                        submission.status === 'approved' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                                        submission.status === 'rejected' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                        submission.status === 'pending' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    )}
                                                >
                                                    {submission.status.toUpperCase()}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {submission.description && (
                                        <p className="text-sm text-muted-foreground mt-2 pl-13">
                                            {submission.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-3 pl-13">
                                        {submission.reviewer ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">Reviewed by:</span>
                                                <span className="font-medium">
                                                    {submission.reviewer.firstName} {submission.reviewer.lastName}
                                                </span>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                        {isCreator && !submission.reviewer && (
                                            <ReviewSubmissionButtons submissionId={submission.id} />
                                        )}
                                    </div>
                                    <SubmissionFiles files={submission.submissionDocs || []} />
                                    <SubmissionNotes
                                        submissionId={submission.id}
                                        notes={submission.notes || []}
                                        isCompleted={task.status === TaskStatus.COMPLETE}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sub-tasks */}
                {task.children && task.children.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TaskIcon className="h-5 w-5" />
                            Sub-tasks ({task.children.length})
                        </h3>
                        <div className="space-y-3">
                            {task.children.map((child) => (
                                <div key={child.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                                    <div className="flex-1">
                                        <p className="font-medium">{child.title}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[10px] font-bold",
                                                    getStatusColor(child.status)
                                                )}
                                            >
                                                {child.status}
                                            </Badge>
                                            <span className="text-sm font-medium text-muted-foreground ml-2">Priority:</span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "text-[10px] font-bold",
                                                    getPriorityColor(child.priority)
                                                )}
                                            >
                                                {child.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href={`/dashboard/tasks/${child.id}`}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
