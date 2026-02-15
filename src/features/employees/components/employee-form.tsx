"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Employee, Status, Gender, EmploymentType, Department } from "@/features/employees/types";
import { createEmployee, updateEmployee, getDepartments } from "@/services/employee.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmployeeFormProps {
    employee?: Employee;
    mode: "create" | "edit";
}

interface FormErrors {
    [key: string]: string;
}

export function EmployeeForm({ employee, mode }: EmployeeFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            const { departments } = await getDepartments();
            setDepartments(departments);
        };
        fetchDepartments();
    }, []);

    const [formData, setFormData] = useState({
        staffId: employee?.staffId || "",
        firstName: employee?.firstName || "",
        lastName: employee?.lastName || "",
        email: employee?.email || "",
        mobileNumber: employee?.mobileNumber || "",
        gender: (employee?.gender as Gender) || Gender.MALE,
        employmentType: (employee?.employmentType as EmploymentType) || EmploymentType.FULL_TIME,
        joinDate: employee?.joinDate || new Date().toISOString().split("T")[0],
        lastDate: employee?.lastDate || "",
        status: (employee?.status as Status) || Status.ACTIVE,
        departmentId: employee?.department?.id || "",
        designation: employee?.designation || "",
        fileId: employee?.profilePicture?.id || "",
    });

    const [currentFileId, setCurrentFileId] = useState(employee?.profilePicture?.id || "");
    const [currentFilePath, setCurrentFilePath] = useState(employee?.profilePicture?.path || "");

    const handleFileUploaded = (fileId: string, filePath: string) => {
        setCurrentFileId(fileId);
        setCurrentFilePath(filePath);
        setFormData(prev => ({ ...prev, fileId }));
    };

    const handleFileRemoved = () => {
        setCurrentFileId("");
        setCurrentFilePath("");
        setFormData(prev => ({ ...prev, fileId: "" }));
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
        const newErrors: FormErrors = {};

        if (!formData.staffId || formData.staffId.length < 3) {
            newErrors.staffId = "Staff ID must be at least 3 characters";
        }
        if (!formData.firstName) {
            newErrors.firstName = "First name is required";
        }
        if (!formData.lastName) {
            newErrors.lastName = "Last name is required";
        }
        if (!formData.designation) {
            newErrors.designation = "Designation is required";
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.joinDate) {
            newErrors.joinDate = "Join date is required";
        }
        if (formData.lastDate && new Date(formData.lastDate) < new Date(formData.joinDate)) {
            newErrors.lastDate = "Last date cannot be before join date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        // Clean up empty optional fields
        const cleanedData = {
            ...formData,
            mobileNumber: formData.mobileNumber || null,
            lastDate: formData.lastDate || null,
            departmentId: formData.departmentId || null,
            designation: formData.designation,
            fileId: formData.fileId || null,
        };

        try {
            const result = mode === "create"
                ? await createEmployee(cleanedData)
                : await updateEmployee(employee!.id, cleanedData);

            if (result.success) {
                toast.success(result.message);
                // Use window.location for reliable navigation after form submission
                if (mode === "create") {
                    window.location.href = "/dashboard/employees";
                } else {
                    window.location.href = `/dashboard/employees/${employee!.id}`;
                }
            } else {
                toast.error(result.message || "An error occurred");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="staffId">Staff ID *</Label>
                            <Input
                                id="staffId"
                                name="staffId"
                                placeholder="e.g., EMP001"
                                value={formData.staffId}
                                onChange={handleChange}
                            />
                            {errors.staffId && (
                                <p className="text-sm text-red-500">{errors.staffId}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500">{errors.lastName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation *</Label>
                            <Input
                                id="designation"
                                name="designation"
                                placeholder="e.g. Software Engineer"
                                value={formData.designation}
                                onChange={handleChange}
                            />
                            {errors.designation && (
                                <p className="text-sm text-red-500">{errors.designation}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="employee@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input
                                id="mobileNumber"
                                name="mobileNumber"
                                placeholder="+88017XXXXXXXX"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <select
                                id="gender"
                                name="gender"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value={Gender.MALE}>Male</option>
                                <option value={Gender.FEMALE}>Female</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="employmentType">Employment Type *</Label>
                            <select
                                id="employmentType"
                                name="employmentType"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.employmentType}
                                onChange={handleChange}
                            >
                                <option value={EmploymentType.FULL_TIME}>Full Time</option>
                                <option value={EmploymentType.PART_TIME}>Part Time</option>
                                <option value={EmploymentType.CONTRACTUAL}>Contractual</option>
                                <option value={EmploymentType.INTERN}>Intern</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <select
                                id="status"
                                name="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value={Status.ACTIVE}>Active</option>
                                <option value={Status.INACTIVE}>Inactive</option>
                            </select>
                        </div>

                        {/* Department Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="departmentId">Department</Label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.departmentId}
                                onChange={handleChange}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="joinDate">Join Date *</Label>
                            <Input
                                id="joinDate"
                                name="joinDate"
                                type="date"
                                value={formData.joinDate}
                                onChange={handleChange}
                            />
                            {errors.joinDate && (
                                <p className="text-sm text-red-500">{errors.joinDate}</p>
                            )}
                        </div>

                        {mode === "edit" && (
                            <div className="space-y-2">
                                <Label htmlFor="lastDate">Last Date</Label>
                                <Input
                                    id="lastDate"
                                    name="lastDate"
                                    type="date"
                                    value={formData.lastDate}
                                    onChange={handleChange}
                                />
                                {errors.lastDate && (
                                    <p className="text-sm text-red-500">{errors.lastDate}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Profile Picture */}
                <FileUpload
                    currentFileId={currentFileId}
                    currentFilePath={currentFilePath}
                    onFileUploaded={handleFileUploaded}
                    onFileRemoved={handleFileRemoved}
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "create" ? "Create Employee" : "Update Employee"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
