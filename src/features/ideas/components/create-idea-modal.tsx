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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Check, X, Building2 } from "lucide-react";
import { createIdea } from "@/services/idea.service";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { generateAIContent } from "@/services/ai.service";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { searchEmployeesForSelect, searchDepartmentsForSelect, EmployeeSelectItem } from "@/services/employee.service";
import { Department } from "@/features/employees/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function CreateIdeaModal() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        visibility: "public" as 'public' | 'private',
        employeeIds: [] as string[],
        departmentIds: [] as string[],
    });
    const [aiContext, setAiContext] = useState("");
    const [aiLanguage, setAiLanguage] = useState("Bangla");
    const [isGenerating, setIsGenerating] = useState(false);

    // State for Selects
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeSelectItem[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);

    const router = useRouter();

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

    const handleGenerate = async (type: 'title' | 'description') => {
        if (!aiContext) {
            toast.error("Please enter a topic for AI generation");
            return;
        }

        setIsGenerating(true);
        try {
            const prompt = type === 'title'
                ? `Give me idea title : ${aiContext}. Answer : ${aiLanguage}`
                : `Give me idea description : ${aiContext}. Answer : ${aiLanguage}`;

            const content = await generateAIContent(prompt);

            if (content) {
                setFormData(prev => ({
                    ...prev,
                    [type]: content
                }));
                toast.success(`Generated ${type} successfully`);
            }
        } catch (error) {
            toast.error("Failed to generate content");
        } finally {
            setIsGenerating(false);
        }
    };

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
            const result = await createIdea(payload);

            if (result.success) {
                toast.success(result.message || "Idea created successfully!");
                setFormData({
                    title: "",
                    description: "",
                    visibility: "public",
                    employeeIds: [],
                    departmentIds: []
                });
                setSelectedEmployees([]);
                setSelectedDepartments([]);
                setAiContext("");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to create idea");
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
                    <Plus className="mr-2 h-4 w-4" />
                    Create Idea
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Idea</DialogTitle>
                        <DialogDescription>
                            Share your innovative idea with the team. You can use AI to help generate content.
                        </DialogDescription>
                    </DialogHeader>

                    {/* AI Helper Section */}
                    <div className="bg-muted/50 p-4 rounded-lg mt-4 space-y-4 border">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">AI Assistant</span>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="ai-context">Topic / Context</Label>
                                <Input
                                    id="ai-context"
                                    placeholder="E.g., Bangladesh Match win news"
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-4 items-end">
                                <div className="w-[140px]">
                                    <Label>Language</Label>
                                    <Select value={aiLanguage} onValueChange={setAiLanguage}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bangla">Bangla</SelectItem>
                                            <SelectItem value="English">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2 flex-1">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleGenerate('title')}
                                        disabled={isGenerating || !aiContext}
                                    >
                                        {isGenerating ? "..." : "Generate Title"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleGenerate('description')}
                                        disabled={isGenerating || !aiContext}
                                    >
                                        {isGenerating ? "..." : "Generate Desc"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Enter idea title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
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
                            <Label htmlFor="visibility">Visibility</Label>
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
                            {isSubmitting ? "Creating..." : "Create Idea"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
