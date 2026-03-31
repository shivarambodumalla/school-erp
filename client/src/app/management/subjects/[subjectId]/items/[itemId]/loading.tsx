import { Skeleton } from '@/components/ui/skeleton'

export default function ItemLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}
