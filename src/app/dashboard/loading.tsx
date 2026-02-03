import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-25" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-15 mb-2" />
                            <Skeleton className="h-3 w-30" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-50" />
                            <Skeleton className="h-4 w-[300px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-75 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-37.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-37.5" />
                                            <Skeleton className="h-3 w-25" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-37.5" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-37.5 w-full rounded-xl" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-50" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
