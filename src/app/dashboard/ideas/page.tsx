import { getIdeas } from "@/services/idea.service";
import { IdeasTable } from "@/features/ideas/components/ideas-table";
import { IdeaIcon } from "@/components/ui/icons";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateIdeaModal } from "@/features/ideas/components/create-idea-modal";

interface IdeasPageProps {
    searchParams: Promise<{ page?: string }>;
}

async function IdeasTableContent({ page }: { page: number }) {
    const { ideas, meta } = await getIdeas(page);

    return <IdeasTable ideas={ideas} meta={meta} />;
}

function IdeasTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function IdeasPage({ searchParams }: IdeasPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <IdeaIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Browse and explore all submitted ideas.
                    </p>
                </div>
                <CreateIdeaModal />
            </div>

            <Suspense key={page} fallback={<IdeasTableSkeleton />}>
                <IdeasTableContent page={page} />
            </Suspense>
        </div>
    );
}
