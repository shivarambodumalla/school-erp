interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectAttendancePage({ params }: Props) {
  await params

  return (
    <div className="rounded-xl border bg-card p-16 flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-semibold">Subject Attendance coming soon</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Track attendance for this subject&apos;s classes.
      </p>
    </div>
  )
}
