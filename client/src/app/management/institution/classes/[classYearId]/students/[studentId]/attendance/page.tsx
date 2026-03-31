interface Props {
  params: Promise<{ classYearId: string; studentId: string }>
}

export default async function StudentAttendancePage({ params }: Props) {
  await params

  return (
    <div className="rounded-xl border bg-card p-16 flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-semibold">Student Attendance</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Attendance records for this class year will appear here.
      </p>
    </div>
  )
}
