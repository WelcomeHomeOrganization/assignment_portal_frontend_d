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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus, ChevronDown } from "lucide-react";
import { createUser, getEmployeesWithoutUser, EmployeeWithoutUser } from "@/services/user.service";

interface CreateUserModalProps {
    onSuccess?: () => void;
}

export function CreateUserModal({ onSuccess }: CreateUserModalProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [employees, setEmployees] = useState<EmployeeWithoutUser[]>([]);

    const [formData, setFormData] = useState({
        employeeId: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Load employees when dialog opens
    useEffect(() => {
        if (open) {
            loadEmployees();
        }
    }, [open]);

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
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.employeeId) {
            newErrors.employeeId = "Please select an employee";
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const result = await createUser(
                formData.employeeId,
                formData.email,
                formData.password
            );

            if (result.success) {
                toast.success(result.message || "User created successfully");
                setOpen(false);
                setFormData({ employeeId: "", email: "", password: "" });
                setErrors({});
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(result.message || "Failed to create user");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Create a user account for an employee. All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee *</Label>
                            {isLoadingEmployees ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : employees.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">
                                    No employees available without user accounts
                                </p>
                            ) : (
                                <select
                                    id="employeeId"
                                    name="employeeId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                >
                                    <option value="">Select an employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.staffId} - {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.employeeId && (
                                <p className="text-sm text-red-500">{errors.employeeId}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || employees.length === 0}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
