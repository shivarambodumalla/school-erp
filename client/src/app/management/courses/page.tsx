import { Construction } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Courses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage online courses
        </p>
      </div>
      <div className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-4 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex
          items-center justify-center">
          <Construction className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">
            Courses — Coming Week 9 (May 27)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Instructors create courses with video lessons and PDFs. Students enroll and track their progress.
          </p>
        </div>
      </div>
    </div>
  )
}