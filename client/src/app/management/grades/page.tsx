import { Construction } from 'lucide-react'

export default function GradesPage() {
  return (
    <div className="flex flex-col items-center justify-center
      min-h-[60vh] gap-4">
      <div className="h-14 w-14 rounded-full bg-muted flex
        items-center justify-center">
        <Construction className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold">Grades</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coming soon. This feature is being built.
        </p>
      </div>
    </div>
  )
}
