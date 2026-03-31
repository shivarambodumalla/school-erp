'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Certificate auto-issues when student progress reaches 100%.
 * The API handles the issuance logic — this component only
 * renders the certificate or shows a "not yet earned" state.
 */

interface Props {
  subjectId: string
  subjectName: string
  className: string
  sectionName: string | null
  academicYear: string
  schoolName: string
  schoolLogo: string | null
  teacherName: string
  studentName: string | null
  completionDate: string | null
  isEarned: boolean
}

export function CertificateViewer({
  subjectId,
  subjectName,
  className: classLabel,
  sectionName,
  academicYear,
  schoolName,
  schoolLogo,
  teacherName,
  studentName,
  completionDate,
  isEarned,
}: Props) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const fullClassName = sectionName
    ? `${classLabel} - ${sectionName}`
    : classLabel

  return (
    <div className="space-y-4">
      {/* Header - hidden in print */}
      <div className="flex flex-col gap-3 sm:flex-row
        sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(
                `/management/subjects/${subjectId}`
              )
            }
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Certificate
            </h1>
            <p className="text-sm text-muted-foreground">
              {subjectName} &mdash; {fullClassName}
            </p>
          </div>
        </div>
        {isEarned && (
          <Button
            onClick={handlePrint}
            className="min-h-[44px]"
          >
            <Printer className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Certificate or not-earned state */}
      {!isEarned ? (
        <div className="rounded-xl border bg-card p-12
          sm:p-16 flex flex-col items-center justify-center
          gap-4 text-center print:hidden">
          <Award className="h-12 w-12 text-muted-foreground" />
          <p className="font-semibold text-lg">
            Certificate Not Yet Earned
          </p>
          <p className="text-sm text-muted-foreground
            max-w-md">
            Complete all content in this subject to earn
            your certificate of completion. Keep up the
            great work!
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            className="certificate-container w-full
              max-w-2xl bg-white rounded-xl shadow-sm
              overflow-hidden"
          >
            {/* Certificate content */}
            <div className="border-[6px] border-double
              border-amber-600/70 m-3 sm:m-6 p-6 sm:p-10
              text-center space-y-6">
              {/* School logo and name */}
              <div className="space-y-2">
                {schoolLogo && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={schoolLogo}
                      alt={schoolName}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                )}
                <p className="text-base sm:text-lg
                  font-semibold text-gray-700
                  tracking-wide uppercase">
                  {schoolName}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t
                  border-amber-600/30" />
                <Award className="h-5 w-5
                  text-amber-600/60" />
                <div className="flex-1 border-t
                  border-amber-600/30" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl
                  font-bold text-gray-800 tracking-wider
                  uppercase">
                  Certificate of Completion
                </h2>
              </div>

              {/* Certifies that */}
              <p className="text-sm text-gray-500">
                This certifies that
              </p>

              {/* Student name */}
              <div className="py-2">
                <p className="text-2xl sm:text-3xl
                  font-serif font-bold text-gray-900
                  italic">
                  {studentName}
                </p>
                <div className="mt-2 mx-auto w-48
                  border-b border-gray-300" />
              </div>

              {/* Completion text */}
              <p className="text-sm text-gray-500">
                has successfully completed
              </p>

              {/* Subject and class */}
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-bold
                  text-gray-800">
                  {subjectName}
                </p>
                <p className="text-sm text-gray-600">
                  {fullClassName}
                </p>
              </div>

              {/* Academic Year */}
              <p className="text-sm text-gray-500">
                Academic Year: {academicYear}
              </p>

              {/* Completion date */}
              {formattedDate && (
                <p className="text-sm text-gray-500">
                  Completed on {formattedDate}
                </p>
              )}

              {/* Signature */}
              <div className="pt-6 sm:pt-8">
                <div className="mx-auto w-48
                  border-b border-gray-400 mb-2" />
                <p className="text-sm font-medium
                  text-gray-700">
                  {teacherName}
                </p>
                <p className="text-xs text-gray-400">
                  Subject Teacher
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            box-shadow: none;
            border-radius: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  )
}
