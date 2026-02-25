import { Skeleton } from "@/components/ui/skeleton";

export function TrainerSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-129px)] w-full max-w-2xl mx-auto">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-border/40">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex flex-col items-center justify-center h-full space-y-6 pt-10">
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border/40">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}
