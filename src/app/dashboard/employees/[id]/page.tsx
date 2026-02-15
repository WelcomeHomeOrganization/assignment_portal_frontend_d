import { getEmployeeById } from "@/services/employee.service";
import { notFound } from "next/navigation";
import { EmployeeIcon, MailIcon, PhoneIcon, CalendarIcon, BriefcaseIcon, BuildingIcon } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React from "react";

// Force dynamic rendering to fetch fresh data on each request
export const dynamic = 'force-dynamic';

interface EmployeeViewPageProps {
    params: Promise<{ id: string }>;
}

export default async function EmployeeViewPage({ params }: EmployeeViewPageProps) {
    const { id } = await params;
    const employee = await getEmployeeById(id);

    if (!employee) {
        notFound();
    }
    // console.log(employee)
    const baseUrl = process.env.BACKEND_LINK;
    const avatarUrl = employee.profilePicture?.path
        ? `${baseUrl}/${employee.profilePicture.path.replace(/\\/g, '/')}`
        : `https://i.pravatar.cc/150?u=${employee.id}`;

    const initials = `${employee.firstName}${employee.lastName}`.toUpperCase();

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/employees">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-primary">
                        <EmployeeIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Employee Details</h1>
                    </div>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/employees/${id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Employee
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarImage src={avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "uppercase text-xs font-bold tracking-wider px-4 py-1",
                                    employee.status === "active"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                            >
                                {employee.status}
                            </Badge>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {employee.firstName} {employee.lastName}
                                </h2>
                                <p className="text-primary font-mono text-lg">{employee.staffId}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem
                                    icon={<MailIcon className="h-5 w-5" />}
                                    label="Email"
                                    value={employee.email}
                                />
                                <InfoItem
                                    icon={<PhoneIcon className="h-5 w-5" />}
                                    label="Mobile"
                                    value={employee.mobileNumber || "Not provided"}
                                />
                                <InfoItem
                                    icon={<BriefcaseIcon className="h-5 w-5" />}
                                    label="Employment Type"
                                    value={employee.employmentType}
                                    capitalize
                                />
                                <InfoItem
                                    icon={<BuildingIcon className="h-5 w-5" />}
                                    label="Department"
                                    value={employee.department?.name || "Not assigned"}
                                />
                                <InfoItem
                                    icon={<BriefcaseIcon className="h-5 w-5" />}
                                    label="Designation"
                                    value={employee.designation || "Not assigned"}
                                />
                                <InfoItem
                                    icon={<CalendarIcon className="h-5 w-5" />}
                                    label="Join Date"
                                    value={new Date(employee.joinDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                />
                                <InfoItem
                                    icon={<CalendarIcon className="h-5 w-5" />}
                                    label="Last Date"
                                    value={employee.lastDate
                                        ? new Date(employee.lastDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "Currently Active"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gender</span>
                            <span className="font-medium capitalize">{employee.gender}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Staff ID</span>
                            <span className="font-mono font-medium">{employee.staffId}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created At</span>
                            <span className="font-medium">
                                {new Date(employee.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span className="font-medium">
                                {new Date(employee.updatedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
    capitalize = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    capitalize?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-0.5">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={cn("font-medium", capitalize && "capitalize")}>{value}</p>
            </div>
        </div>
    );
}
