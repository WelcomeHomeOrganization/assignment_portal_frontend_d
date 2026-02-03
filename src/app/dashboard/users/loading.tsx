import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function UsersLoading() {
    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-border/50 bg-card">
                        <CardContent className="p-0">
                            <Skeleton className="h-2 w-full" />
                            <div className="p-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
