'use client'

interface ProcessedEntry {
  id: string
  staffId: string
  name: string
  employeeNo: string
  designation: string
  dept: string | null
  basicSalary: string
  allowances: { label: string; amount: number }[]
  deductions: { label: string; amount: number }[]
  lopDays: number
  lopDeduction: string
  grossSalary: string
  netSalary: string
  paidAt: string | null
  payslipUrl: string | null
  notes: string | null
}

interface UnprocessedEntry {
  staffId: string
  name: string
  employeeNo: string
  designation: string
  dept: string | null
}

interface Props {
  unprocessed: UnprocessedEntry[]
  processed: ProcessedEntry[]
  onSelectUnprocessed: (entry: UnprocessedEntry) => void
  onSelectProcessed: (entry: ProcessedEntry) => void
}

export function PayrollStaffList({
  unprocessed, processed, onSelectUnprocessed, onSelectProcessed,
}: Props) {
  return (
    <>
      {unprocessed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-700">
            Unprocessed ({unprocessed.length})
          </h3>
          <div className="border rounded-xl overflow-hidden">
            {unprocessed.map((s) => (
              <button
                key={s.staffId}
                type="button"
                onClick={() => onSelectUnprocessed(s)}
                className="w-full flex items-center justify-between
                  p-3 text-left hover:bg-muted/50 border-b last:border-0
                  min-h-[44px] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.employeeNo} · {s.designation}
                    {s.dept ? ` · ${s.dept}` : ''}
                  </p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700
                  px-2 py-1 rounded-full">
                  Pending
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-700">
            Processed ({processed.length})
          </h3>
          <div className="border rounded-xl overflow-hidden">
            {processed.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProcessed(p)}
                className="w-full flex items-center justify-between
                  p-3 text-left hover:bg-muted/50 border-b last:border-0
                  min-h-[44px] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.employeeNo} · {p.designation}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ₹{Number(p.netSalary).toLocaleString('en-IN')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
