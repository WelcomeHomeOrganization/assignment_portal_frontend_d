"use client";

import { useState, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Building2, Pencil } from "lucide-react";
import { updateIdea } from "@/services/idea.service";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Idea } from "@/features/ideas/types";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { searchEmployeesForSelect, searchDepartmentsForSelect, EmployeeSelectItem } from "@/services/employee.service";
import { Department } from "@/features/employees/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

interface EditIdeaModalProps {
    idea: Idea;
}

export function EditIdeaModal({ idea }: EditIdeaModalProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-populate selected employees from employeeAccesses (API response) or fall back to employeeIds
    const initialEmployees: EmployeeSelectItem[] = (idea.employeeAccesses ?? []).map(a => ({
        id: a.employee.id,
        staffId: a.employee.staffId,
        firstName: a.employee.firstName,
        lastName: a.employee.lastName,
        designation: a.employee.designation ?? undefined,
        avatar: a.employee.profilePicture?.path ?? undefined,
    }));

    // Pre-populate selected departments from departmentAccesses (API response)
    const initialDepartments: Department[] = (idea.departmentAccesses ?? []).map(a => ({
        id: a.departmentId,
        name: a.department?.name ?? "",
        createdAt: "",
        updatedAt: "",
    }));

    const [formData, setFormData] = useState({
        title: idea.title,
        description: idea.description,
        visibility: idea.visibility || "public" as 'public' | 'private',
        employeeIds: initialEmployees.map(e => e.id),
        departmentIds: initialDepartments.map(d => d.id),
    });
    const router = useRouter();

    // State for Selects — initialized with existing accesses
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSelectItem[]>(initialEmployees);
    const [selectedDepartments, setSelectedDepartments] = useState<Department[]>(initialDepartments);

    const handleSearchDepartments = useCallback((query: string) => searchDepartmentsForSelect(query), []);
    const handleSearchEmployees = useCallback((query: string) => searchEmployeesForSelect(query), []);

    const employeeDisplay = (item: EmployeeSelectItem) => `${item.firstName} ${item.lastName}`;
    const employeeSecondary = (item: EmployeeSelectItem) => item.staffId;

    const renderEmployeeOption = (item: EmployeeSelectItem, isSelected: boolean) => (
        <div className="flex items-center gap-2 p-2 w-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={item.avatar} alt={`${item.firstName} ${item.lastName}`} />
                <AvatarFallback>
                    {item.firstName?.[0]}{item.lastName?.[0]}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-medium truncate">{item.firstName} {item.lastName}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.staffId}</span>
                    {item.designation && (
                        <>
                            <span>•</span>
                            <span className="truncate">{item.designation}</span>
                        </>
                    )}
                </div>
            </div>
            {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
        </div>
    );

    const renderEmployeeSelected = (item: EmployeeSelectItem, onRemove?: (e: React.MouseEvent) => void) => (
        <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs group">
            <Avatar className="h-4 w-4">
                <AvatarImage src={item.avatar} />
                <AvatarFallback className="text-[8px]">
                    {item.firstName?.[0]}{item.lastName?.[0]}
                </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{item.firstName} {item.lastName}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-1 text-muted-foreground hover:text-foreground rounded-full p-0.5"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );

    const renderDepartmentOption = (item: Department, isSelected: boolean) => (
        <div className="flex items-center gap-2 p-2 w-full">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium truncate flex-1">{item.name}</span>
            {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
        </div>
    );

    const renderDepartmentSelected = (item: Department, onRemove?: (e: React.MouseEvent) => void) => (
        <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs group">
            <Building2 className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate max-w-[120px]">{item.name}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-1 text-muted-foreground hover:text-foreground rounded-full p-0.5"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            title: formData.title,
            description: formData.description,
            visibility: formData.visibility,
            ...(formData.visibility === "private" && {
                employeeIds: formData.employeeIds,
                departmentIds: formData.departmentIds,
            }),
        };

        try {
            const result = await updateIdea(idea.id, payload);

            if (result.success) {
                toast.success(result.message || "Idea updated successfully!");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to update idea");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form data when modal opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setFormData({
                title: idea.title,
                description: idea.description,
                visibility: idea.visibility || "public",
                employeeIds: idea.employeeIds || [],
                departmentIds: idea.departmentIds || [],
            });
            // We assume selectedEmployees and selectedDepartments will be hydrated by backend later 
            // if needed, but for now we reset them to empty when opening specific idea if their arrays are empty
            if (!idea.employeeIds?.length) setSelectedEmployees([]);
            if (!idea.departmentIds?.length) setSelectedDepartments([]);
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                onClick={() => setOpen(true)}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Idea</DialogTitle>
                        <DialogDescription>
                            Update your idea details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-title"
                                placeholder="Enter idea title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Describe your idea in detail"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={5}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-visibility">Visibility</Label>
                            <Select
                                value={formData.visibility}
                                onValueChange={(val: 'public' | 'private') => setFormData(prev => ({ ...prev, visibility: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public (Everyone can see)</SelectItem>
                                    <SelectItem value="private">Private (Only selected can see)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.visibility === "private" && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Share with Departments (Optional)</Label>
                                    <AsyncSearchableSelect<Department>
                                        key="dept-select"
                                        mode="multi"
                                        placeholder="Search departments..."
                                        searchFn={handleSearchDepartments}
                                        displayValue={(item) => item.name}
                                        value={selectedDepartments}
                                        onChange={(val) => {
                                            const next = (val as Department[]) || [];
                                            setSelectedDepartments(next);
                                            setFormData(prev => ({
                                                ...prev,
                                                departmentIds: next.map(d => d.id)
                                            }));
                                        }}
                                        renderOption={renderDepartmentOption}
                                        renderSelected={renderDepartmentSelected}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Share with Employees (Optional)</Label>
                                    <AsyncSearchableSelect<EmployeeSelectItem>
                                        key="emp-select"
                                        mode="multi"
                                        placeholder="Search employees..."
                                        searchFn={handleSearchEmployees}
                                        displayValue={employeeDisplay}
                                        secondaryValue={employeeSecondary}
                                        value={selectedEmployees}
                                        onChange={(val) => {
                                            const next = (val as EmployeeSelectItem[]) || [];
                                            setSelectedEmployees(next);
                                            setFormData(prev => ({
                                                ...prev,
                                                employeeIds: next.map(e => e.id)
                                            }));
                                        }}
                                        renderOption={renderEmployeeOption}
                                        renderSelected={renderEmployeeSelected}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Idea"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
