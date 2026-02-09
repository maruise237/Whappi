import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/30 p-8 rounded-lg border-2 border-primary/5 backdrop-blur-xl shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-full max-w-md rounded-lg opacity-40" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-11 w-32 rounded-lg" />
          <div className="h-8 w-0.5 bg-muted/30 hidden md:block" />
          <Skeleton className="h-12 w-[200px] rounded-lg" />
          <Skeleton className="h-14 w-48 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-16 max-w-5xl mx-auto mt-12">
        {/* Step 1: Session Card Skeleton */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <Skeleton className="h-8 w-2 bg-primary rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-lg opacity-40" />
          </div>
          <Card className="overflow-hidden border-2 border-primary/10 bg-card/30 backdrop-blur-xl h-[240px] rounded-lg shadow-xl">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-48 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex gap-6">
                <Skeleton className="h-28 w-28 rounded-lg" />
                <div className="flex-1 space-y-4 pt-2">
                  <Skeleton className="h-5 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Step 2: Messaging Tabs Skeleton */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <Skeleton className="h-8 w-2 bg-primary rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-lg opacity-40" />
          </div>
          <Card className="overflow-hidden border-2 border-primary/10 bg-card/30 h-[450px] rounded-lg shadow-xl">
            <CardHeader className="p-6 border-b border-primary/5">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </CardContent>
          </Card>
        </section>

        {/* Step 3: Log Viewer Skeleton */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <Skeleton className="h-8 w-2 bg-primary rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-lg opacity-40" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-lg shadow-xl" />
        </section>

        {/* Step 4: API Usage Skeleton */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <Skeleton className="h-8 w-2 bg-primary rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-lg opacity-40" />
          </div>
          <Card className="overflow-hidden border-2 border-primary/10 bg-card/30 backdrop-blur-xl rounded-lg shadow-xl">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-12 w-32 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Skeleton className="h-[300px] w-full rounded-lg shadow-inner" />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-lg border-2 border-primary/5 bg-card/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 rounded-full opacity-40" />
            <Skeleton className="h-8 w-8 rounded-lg opacity-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-full opacity-30" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <div className="rounded-lg border-2 border-primary/10 overflow-hidden bg-card/30 backdrop-blur-xl shadow-xl">
      <div className="h-20 border-b border-primary/5 bg-primary/5 flex items-center px-10 gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-full opacity-30" />
        ))}
      </div>
      <div className="divide-y divide-primary/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-24 flex items-center px-10 gap-8">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1 rounded-full opacity-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActivitySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="p-5 space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-lg shrink-0 opacity-20" />
          <div className="flex-1 space-y-3 py-1">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded-full opacity-30" />
              <Skeleton className="h-3 w-12 rounded-full opacity-10" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded-md opacity-20" />
              <Skeleton className="h-3 w-40 rounded-full opacity-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
