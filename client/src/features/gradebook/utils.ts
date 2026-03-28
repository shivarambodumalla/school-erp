import type { GradebookData, ClassGradebookData } from './types'

export function exportGradebookCsv(data: GradebookData) {
  const headers = [
    'Roll No',
    'Student',
    ...data.examTypes.map((et) => et.shortName),
    'Total %',
    'Grade',
    'Rank',
  ]

  const rows = data.students.map((s) => [
    s.rollNo ?? '',
    `${s.firstName} ${s.lastName}`,
    ...data.examTypes.map((et) => {
      const g = s.grades[et.id]
      return g ? `${g.marksObtained}/${g.totalMarks}` : ''
    }),
    s.percentage.toFixed(1),
    s.overallGrade ?? '',
    s.rank > 0 ? String(s.rank) : '',
  ])

  downloadCsv(
    [headers, ...rows],
    `gradebook-${data.subject.name}.csv`,
  )
}

export function exportClassGradebookCsv(data: ClassGradebookData) {
  const headers = [
    'Roll No',
    'Student',
    'Section',
    ...data.subjects.map((s) => `${s.name} %`),
    ...data.subjects.map((s) => `${s.name} Grade`),
    'Overall %',
    'Overall Grade',
  ]

  const rows = data.students.map((s) => [
    s.rollNo ?? '',
    `${s.firstName} ${s.lastName}`,
    s.sectionName,
    ...data.subjects.map((subj) =>
      s.subjectSummaries[subj.id]?.percentage.toFixed(1) ?? '',
    ),
    ...data.subjects.map((subj) =>
      s.subjectSummaries[subj.id]?.grade ?? '',
    ),
    s.overallPercentage.toFixed(1),
    s.overallGrade ?? '',
  ])

  downloadCsv([headers, ...rows], 'class-gradebook.csv')
}

function downloadCsv(data: string[][], filename: string) {
  const csv = data.map((row) =>
    row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','),
  ).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
