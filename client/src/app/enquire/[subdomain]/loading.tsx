export default function EnquireLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse space-y-3 text-center">
        <div className="h-16 w-16 rounded-full bg-muted mx-auto" />
        <div className="h-4 w-32 bg-muted rounded mx-auto" />
      </div>
    </div>
  )
}
