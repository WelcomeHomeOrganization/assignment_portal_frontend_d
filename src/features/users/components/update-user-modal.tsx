"use client";

import { useState, useEffect, FormEvent } from "react";
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
import { Loader2 } from "lucide-react";
import { updateUser, getEmployeesWithoutUser, EmployeeWithoutUser } from "@/services/user.service";
import { User } from "@/features/users/types";

interface UpdateUserModalProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function UpdateUserModal({ user, open, onOpenChange, onSuccess }: UpdateUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [employees, setEmployees] = useState<EmployeeWithoutUser[]>([]);

    const [formData, setFormData] = useState({
        employeeId: user.employee?.id || "",
        email: user.email,
        password: "",
        status: user.status,
    });

    // Load employees when dialog opens
    useEffect(() => {
        if (open) {
            loadEmployees();
            // Reset form data to current user data when dialog opens
            setFormData({
                employeeId: user.employee?.id || "",
                email: user.email,
                password: "",
                status: user.status,
            });
        }
    }, [open, user]);

    const loadEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
            const data = await getEmployeesWithoutUser();
            setEmployees(data);
        } catch (error) {
            toast.error("Failed to load employees");
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            // Only include fields that have changed or been filled
            const updateData: {
                employeeId?: string;
                email?: string;
                password?: string;
                status?: string;
            } = {};

            if (formData.employeeId && formData.employeeId !== user.employee?.id) {
                updateData.employeeId = formData.employeeId;
            }
            if (formData.email && formData.email !== user.email) {
                updateData.email = formData.email;
            }
            if (formData.password) {
                updateData.password = formData.password;
            }
            if (formData.status !== user.status) {
                updateData.status = formData.status;
            }

            // Check if there are any changes
            if (Object.keys(updateData).length === 0) {
                toast.info("No changes to update");
                setIsSubmitting(false);
                return;
            }

            const result = await updateUser(user.id, updateData);

            if (result.success) {
                toast.success(result.message || "User updated successfully");
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(result.message || "Failed to update user");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Update User</DialogTitle>
                        <DialogDescription>
                            Update user information. All fields are optional.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee</Label>
                            {isLoadingEmployees ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <select
                                    id="employeeId"
                                    name="employeeId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                >
                                    {user.employee && (
                                        <option value={user.employee.id}>
                                            {user.employee.staffId} - {user.employee.firstName} {user.employee.lastName}
                                        </option>
                                    )}
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.staffId} - {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Current: {user.employee?.staffId} - {user.employee?.firstName} {user.employee?.lastName}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Leave empty to keep current password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Only fill this if you want to change the password
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                name="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
