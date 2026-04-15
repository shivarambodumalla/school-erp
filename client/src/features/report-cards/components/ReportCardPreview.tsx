'use client'

interface InstitutionInfo {
  name: string
  logoUrl: string | null
  addressLine1: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  phone: string | null
}

interface SubjectRow {
  subjectName: string
  marks: { examTypeName: string; obtained: number; total: number }[]
  totalObtained: number
  totalPossible: number
}

interface ReportCardPreviewProps {
  institution: InstitutionInfo
  studentName: string
  rollNo: string | null
  className: string
  academicYear: string
  subjects: SubjectRow[]
  examTypeNames: string[]
  attendance: { total: number; present: number } | null
  remarks: string | null
}

export function ReportCardPreview({
  institution,
  studentName,
  rollNo,
  className,
  academicYear,
  subjects,
  examTypeNames,
  attendance,
  remarks,
}: ReportCardPreviewProps) {
  const grandTotalObtained = subjects.reduce((s, r) => s + r.totalObtained, 0)
  const grandTotalPossible = subjects.reduce((s, r) => s + r.totalPossible, 0)
  const overallPercentage = grandTotalPossible > 0
    ? ((grandTotalObtained / grandTotalPossible) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="bg-white text-black p-6 sm:p-8 rounded-xl border
      print:border-none print:rounded-none print:p-0
      print:shadow-none max-w-3xl mx-auto">
      {/* School header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6 print:mb-4">
        {institution.logoUrl && (
          <img
            src={institution.logoUrl}
            alt={institution.name}
            className="h-16 w-16 mx-auto mb-2 object-contain"
          />
        )}
        <h1 className="text-xl font-bold uppercase tracking-wide">
          {institution.name}
        </h1>
        {(institution.addressLine1 || institution.city) && (
          <p className="text-xs text-gray-600 mt-1">
            {[institution.addressLine1, institution.city, institution.state, institution.pinCode]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        {institution.phone && (
          <p className="text-xs text-gray-600">Phone: {institution.phone}</p>
        )}
        <h2 className="text-base font-semibold mt-3 uppercase">
          Report Card &mdash; {academicYear}
        </h2>
      </div>

      {/* Student info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 print:mb-4">
        <div>
          <span className="text-gray-600">Student Name:</span>{' '}
          <span className="font-medium">{studentName}</span>
        </div>
        <div>
          <span className="text-gray-600">Class:</span>{' '}
          <span className="font-medium">{className}</span>
        </div>
        {rollNo && (
          <div>
            <span className="text-gray-600">Roll No:</span>{' '}
            <span className="font-medium">{rollNo}</span>
          </div>
        )}
      </div>

      {/* Marks table */}
      <div className="overflow-x-auto mb-6 print:mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-200">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                Subject
              </th>
              {examTypeNames.map((name) => (
                <th
                  key={name}
                  className="border border-gray-300 px-3 py-2 text-center font-semibold"
                >
                  {name}
                </th>
              ))}
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                Total
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((row) => {
              const pct = row.totalPossible > 0
                ? ((row.totalObtained / row.totalPossible) * 100).toFixed(1)
                : '-'
              return (
                <tr key={row.subjectName} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">
                    {row.subjectName}
                  </td>
                  {examTypeNames.map((etName) => {
                    const entry = row.marks.find((m) => m.examTypeName === etName)
                    return (
                      <td
                        key={etName}
                        className="border border-gray-300 px-3 py-2 text-center"
                      >
                        {entry ? `${entry.obtained}/${entry.total}` : '-'}
                      </td>
                    )
                  })}
                  <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                    {row.totalObtained}/{row.totalPossible}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {pct}%
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold print:bg-gray-200">
              <td className="border border-gray-300 px-3 py-2">Grand Total</td>
              {examTypeNames.map((name) => (
                <td
                  key={name}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  {subjects.reduce((s, row) => {
                    const entry = row.marks.find((m) => m.examTypeName === name)
                    return s + (entry?.obtained ?? 0)
                  }, 0)}
                  /
                  {subjects.reduce((s, row) => {
                    const entry = row.marks.find((m) => m.examTypeName === name)
                    return s + (entry?.total ?? 0)
                  }, 0)}
                </td>
              ))}
              <td className="border border-gray-300 px-3 py-2 text-center">
                {grandTotalObtained}/{grandTotalPossible}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {overallPercentage}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Attendance row */}
      {attendance && (
        <div className="text-sm mb-6 print:mb-4 p-3 rounded-lg bg-gray-50
          print:bg-white print:border print:border-gray-300">
          <span className="font-semibold">Attendance:</span>{' '}
          {attendance.present}/{attendance.total} days present
          {attendance.total > 0 && (
            <span className="ml-2 text-gray-600">
              ({((attendance.present / attendance.total) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
      )}

      {/* Remarks */}
      {remarks && (
        <div className="text-sm mb-6 print:mb-4">
          <span className="font-semibold">Remarks:</span>{' '}
          <span>{remarks}</span>
        </div>
      )}

      {/* Signature lines */}
      <div className="grid grid-cols-3 gap-8 mt-12 pt-8 text-center text-xs text-gray-600">
        <div>
          <div className="border-t border-gray-400 pt-2">Class Teacher</div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-2">Principal</div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-2">Parent / Guardian</div>
        </div>
      </div>
    </div>
  )
}
