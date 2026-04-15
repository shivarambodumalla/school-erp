/**
 * Seed script for missing data — fills tables that need 20+ records.
 * Run: npx tsx prisma/seed-missing-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── helpers ────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d }

async function main() {
  console.log('━━━ SEED MISSING DATA ━━━\n')

  // ─── Fetch institution ────────────────────────────────────
  const inst = await prisma.institution.findFirst({ where: { subdomain: 'stmarys' } })
  if (!inst) throw new Error('Institution "stmarys" not found')
  const iid = inst.id
  console.log(`Institution: ${inst.name} (${iid})`)

  // ─── Fetch required IDs ───────────────────────────────────
  const adminUser = await prisma.user.findFirst({ where: { institutionId: iid, email: 'admin@stmarys.com' } })
  if (!adminUser) throw new Error('Admin user not found')
  console.log(`Admin user: ${adminUser.id}`)

  const staff = await prisma.staff.findMany({ where: { institutionId: iid }, take: 10 })
  console.log(`Staff fetched: ${staff.length}`)

  const students = await prisma.student.findMany({
    where: { institutionId: iid },
    include: { sections: { include: { section: true, classYear: { include: { classTemplate: true } } } } },
  })
  console.log(`Students fetched: ${students.length}`)

  const academicYear = await prisma.academicYear.findFirst({ where: { institutionId: iid, isCurrent: true } })
  if (!academicYear) throw new Error('No current academic year')
  console.log(`Academic year: ${academicYear.name}`)

  const sections = await prisma.section.findMany({
    where: { institutionId: iid },
    include: { classYear: { include: { classTemplate: true } } },
  })
  console.log(`Sections fetched: ${sections.length}`)

  const subjects = await prisma.subject.findMany({ where: { institutionId: iid } })
  console.log(`Subjects fetched: ${subjects.length}`)

  const examTypes = await prisma.examType.findMany({ where: { institutionId: iid } })
  const leaveTypes = await prisma.staffLeaveType.findMany({ where: { institutionId: iid } })
  const feeCategories = await prisma.feeCategory.findMany({ where: { institutionId: iid } })
  const allUsers = await prisma.user.findMany({ where: { institutionId: iid }, select: { id: true } })

  const staffWithUser = staff.filter(s => s.userId)
  const staffUserIds = staffWithUser.map(s => s.userId!).filter(Boolean)
  const allUserIds = allUsers.map(u => u.id)

  // ─── 1. Admissions (5 more) ───────────────────────────────
  console.log('\n[1/12] Creating Admissions...')
  const admissionStatuses: Array<'APPLIED' | 'ADMITTED' | 'ENROLLED'> = ['APPLIED', 'APPLIED', 'ADMITTED', 'ADMITTED', 'ENROLLED']
  const admissionNames = [
    { first: 'Aarav', last: 'Patel', gender: 'MALE' as const },
    { first: 'Priya', last: 'Sharma', gender: 'FEMALE' as const },
    { first: 'Rohan', last: 'Gupta', gender: 'MALE' as const },
    { first: 'Ananya', last: 'Singh', gender: 'FEMALE' as const },
    { first: 'Vivek', last: 'Reddy', gender: 'MALE' as const },
  ]
  for (let i = 0; i < 5; i++) {
    const appNo = `APP-2025-${100 + i}`
    try {
      await prisma.admission.create({
        data: {
          institutionId: iid,
          applicationNo: appNo,
          status: admissionStatuses[i]!,
          firstName: admissionNames[i]!.first,
          lastName: admissionNames[i]!.last,
          dateOfBirth: new Date(2014, randomInt(0, 11), randomInt(1, 28)),
          gender: admissionNames[i]!.gender,
          academicYearId: academicYear.id,
          createdById: adminUser.id,
          ...(admissionStatuses[i] === 'ADMITTED' ? { admittedAt: daysAgo(randomInt(1, 10)) } : {}),
          ...(admissionStatuses[i] === 'ENROLLED' ? { admittedAt: daysAgo(15), enrolledAt: daysAgo(5) } : {}),
        },
      })
      console.log(`  Created admission ${appNo} (${admissionStatuses[i]})`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Unique')) console.log(`  Skipped ${appNo} (already exists)`)
      else throw e
    }
  }

  // ─── 2. AuditLogs (25) ───────────────────────────────────
  console.log('\n[2/12] Creating AuditLogs...')
  const auditActions = [
    { action: 'STUDENT_CREATED', table: 'Student' },
    { action: 'STAFF_CREATED', table: 'Staff' },
    { action: 'FEE_COLLECTED', table: 'FeePayment' },
    { action: 'ATTENDANCE_MARKED', table: 'Attendance' },
    { action: 'GRADE_ENTERED', table: 'GradeEntry' },
    { action: 'LEAVE_APPROVED', table: 'StaffLeave' },
    { action: 'ADMISSION_APPLIED', table: 'Admission' },
    { action: 'ROLE_ASSIGNED', table: 'StaffRole' },
    { action: 'SETTING_UPDATED', table: 'FeeSettings' },
    { action: 'DOCUMENT_UPLOADED', table: 'Document' },
  ]
  const auditData = Array.from({ length: 25 }, (_, i) => {
    const pair = auditActions[i % auditActions.length]!
    const userId = i % 3 === 0 ? adminUser.id : pick([...staffUserIds, adminUser.id])
    return {
      institutionId: iid,
      userId,
      action: pair.action,
      tableName: pair.table,
      recordId: `record-${i + 1}`,
      before: undefined,
      after: { seeded: true },
      createdAt: daysAgo(randomInt(0, 30)),
    }
  })
  await prisma.auditLog.createMany({ data: auditData })
  console.log(`  Created 25 audit logs`)

  // ─── 3. CalendarEvents (20) ───────────────────────────────
  console.log('\n[3/12] Creating CalendarEvents...')
  const calendarEvents: Array<{
    title: string
    type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'MEETING'
    isHoliday: boolean
    offsetDays: number
    durationDays: number
  }> = [
    // HOLIDAYS (6)
    { title: 'Republic Day', type: 'HOLIDAY', isHoliday: true, offsetDays: 10, durationDays: 1 },
    { title: 'Holi Festival', type: 'HOLIDAY', isHoliday: true, offsetDays: 30, durationDays: 2 },
    { title: 'Good Friday', type: 'HOLIDAY', isHoliday: true, offsetDays: 50, durationDays: 1 },
    { title: 'Independence Day', type: 'HOLIDAY', isHoliday: true, offsetDays: 120, durationDays: 1 },
    { title: 'Diwali Vacation', type: 'HOLIDAY', isHoliday: true, offsetDays: 150, durationDays: 5 },
    { title: 'Christmas Break', type: 'HOLIDAY', isHoliday: true, offsetDays: 180, durationDays: 3 },
    // EXAMS (5)
    { title: 'Unit Test 1 - Class 6', type: 'EXAM', isHoliday: false, offsetDays: 15, durationDays: 3 },
    { title: 'Unit Test 1 - Class 7', type: 'EXAM', isHoliday: false, offsetDays: 18, durationDays: 3 },
    { title: 'Mid-Term Examinations', type: 'EXAM', isHoliday: false, offsetDays: 60, durationDays: 7 },
    { title: 'Unit Test 2 - All Classes', type: 'EXAM', isHoliday: false, offsetDays: 100, durationDays: 3 },
    { title: 'Final Examinations', type: 'EXAM', isHoliday: false, offsetDays: 140, durationDays: 10 },
    // EVENTS (5)
    { title: 'Annual Day Celebration', type: 'EVENT', isHoliday: false, offsetDays: 45, durationDays: 1 },
    { title: 'Sports Day', type: 'EVENT', isHoliday: false, offsetDays: 75, durationDays: 2 },
    { title: 'Science Exhibition', type: 'EVENT', isHoliday: false, offsetDays: 90, durationDays: 1 },
    { title: 'Cultural Festival', type: 'EVENT', isHoliday: false, offsetDays: 110, durationDays: 2 },
    { title: 'Farewell Day', type: 'EVENT', isHoliday: false, offsetDays: 160, durationDays: 1 },
    // MEETINGS (4)
    { title: 'PTA Meeting - Term 1', type: 'MEETING', isHoliday: false, offsetDays: 20, durationDays: 1 },
    { title: 'Staff Review Meeting', type: 'MEETING', isHoliday: false, offsetDays: 40, durationDays: 1 },
    { title: 'PTA Meeting - Term 2', type: 'MEETING', isHoliday: false, offsetDays: 80, durationDays: 1 },
    { title: 'Annual Planning Meeting', type: 'MEETING', isHoliday: false, offsetDays: 130, durationDays: 1 },
  ]
  for (const evt of calendarEvents) {
    const startDate = daysFromNow(evt.offsetDays)
    startDate.setHours(evt.isHoliday ? 0 : 9, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + evt.durationDays - 1)
    endDate.setHours(evt.isHoliday ? 23 : 16, evt.isHoliday ? 59 : 0, 0, 0)
    try {
      await prisma.schoolCalendarEvent.create({
        data: {
          institutionId: iid,
          title: evt.title,
          description: `${evt.title} — scheduled for the academic session`,
          type: evt.type,
          startDate,
          endDate,
          isHoliday: evt.isHoliday,
          createdById: adminUser.id,
        },
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Unique')) console.log(`  Skipped ${evt.title} (duplicate)`)
      else throw e
    }
  }
  console.log(`  Created ${calendarEvents.length} calendar events`)

  // ─── 4. FeeConcessions (20) ───────────────────────────────
  console.log('\n[4/12] Creating FeeConcessions...')
  const concessionReasons = [
    'Merit Scholarship',
    'Staff Child Discount',
    'Sibling Discount',
    'Financial Assistance',
    'Sports Quota',
  ]
  const concessionStudents = students.slice(0, 15)
  let concessionCount = 0
  for (let i = 0; i < 20; i++) {
    const student = concessionStudents[i % concessionStudents.length]!
    const isPercentage = i < 10
    const feeCategory = feeCategories.length > 0 ? pick(feeCategories) : null
    try {
      await prisma.feeConcession.create({
        data: {
          institutionId: iid,
          studentId: student.id,
          feeCategoryId: feeCategory?.id ?? null,
          name: concessionReasons[i % concessionReasons.length]!,
          type: isPercentage ? 'PERCENTAGE' : 'FIXED',
          amount: isPercentage ? pick([10, 25, 50]) : randomInt(300, 1000),
          validFrom: academicYear.startDate,
          validTill: academicYear.endDate,
          approvedById: adminUser.id,
          notes: `Concession approved for ${student.firstName} ${student.lastName}`,
        },
      })
      concessionCount++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Unique')) console.log(`  Skipped concession ${i} (duplicate)`)
      else throw e
    }
  }
  console.log(`  Created ${concessionCount} fee concessions`)

  // ─── 5. Notifications (25) ────────────────────────────────
  console.log('\n[5/12] Creating Notifications...')
  const notifTypes: Array<'GENERAL' | 'ANNOUNCEMENT' | 'ATTENDANCE_ABSENT' | 'GRADE_PUBLISHED' | 'FEE_DUE'> = [
    'GENERAL', 'ANNOUNCEMENT', 'ATTENDANCE_ABSENT', 'GRADE_PUBLISHED', 'FEE_DUE',
  ]
  const notifTitles: Record<string, string[]> = {
    GENERAL: ['System maintenance scheduled', 'New feature available', 'Welcome to the new term', 'Profile update reminder', 'Password change recommended'],
    ANNOUNCEMENT: ['New circular posted', 'Important notice from principal', 'Upcoming holiday notification', 'Exam schedule released', 'Uniform policy update'],
    ATTENDANCE_ABSENT: ['Attendance marked absent', 'Attendance alert for today', 'Missing attendance record', 'Late arrival recorded', 'Attendance summary ready'],
    GRADE_PUBLISHED: ['Grade published for Unit Test', 'Mid-term results available', 'Assignment grades posted', 'Quiz results updated', 'Report card generated'],
    FEE_DUE: ['Fee payment due', 'Overdue fee reminder', 'Term fee collection starts', 'Late fee applied', 'Fee receipt available'],
  }
  const notifPriorities: Array<'URGENT' | 'HIGH' | 'NORMAL'> = [
    ...Array(5).fill('URGENT' as const),
    ...Array(10).fill('HIGH' as const),
    ...Array(10).fill('NORMAL' as const),
  ]
  const notifData = Array.from({ length: 25 }, (_, i) => {
    const type = notifTypes[i % notifTypes.length]!
    const titles = notifTitles[type]!
    const isRead = i < 10
    return {
      institutionId: iid,
      userId: pick(allUserIds),
      type,
      title: titles[i % titles.length]!,
      body: `This is a notification about: ${titles[i % titles.length]}. Please check your dashboard for details.`,
      channel: 'PUSH' as const,
      status: isRead ? 'READ' as const : 'SENT' as const,
      priority: notifPriorities[i]!,
      data: {},
      sentAt: daysAgo(randomInt(0, 14)),
      readAt: isRead ? daysAgo(randomInt(0, 7)) : null,
      createdAt: daysAgo(randomInt(0, 14)),
    }
  })
  await prisma.notification.createMany({ data: notifData })
  console.log(`  Created 25 notifications`)

  // ─── 6. StaffLeaves (20) ──────────────────────────────────
  console.log('\n[6/12] Creating StaffLeaves...')
  const leaveStatuses: Array<'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED'> = [
    ...Array(8).fill('APPROVED' as const),
    ...Array(6).fill('PENDING' as const),
    ...Array(4).fill('REJECTED' as const),
    ...Array(2).fill('CANCELLED' as const),
  ]
  const leaveReasons = [
    'Personal emergency', 'Family function', 'Medical appointment',
    'Child\'s school event', 'Religious ceremony', 'Out of station travel',
    'Health issue', 'Home maintenance', 'Bank work', 'Government office visit',
    'Wedding in family', 'Festival preparation', 'Doctor visit',
    'Parent-teacher meeting', 'Passport renewal', 'House shifting',
    'Dental appointment', 'Eye checkup', 'Vehicle service', 'Court hearing',
  ]
  let leaveCount = 0
  for (let i = 0; i < 20; i++) {
    const staffMember = pick(staff)
    const leaveType = leaveTypes.length > 0 ? pick(leaveTypes) : null
    if (!leaveType) {
      console.log('  No leave types found, skipping StaffLeaves')
      break
    }
    const daysBack = randomInt(5, 60)
    const fromDate = daysAgo(daysBack)
    const duration = randomInt(1, 3)
    const toDate = new Date(fromDate)
    toDate.setDate(toDate.getDate() + duration - 1)
    const status = leaveStatuses[i]!
    try {
      await prisma.staffLeave.create({
        data: {
          institutionId: iid,
          staffId: staffMember.id,
          leaveTypeId: leaveType.id,
          fromDate,
          toDate,
          totalDays: duration,
          reason: leaveReasons[i]!,
          status,
          ...(status === 'APPROVED' ? {
            approvedById: adminUser.id,
            approvalComment: 'Approved',
            reviewedAt: daysAgo(daysBack - 1),
          } : {}),
          ...(status === 'REJECTED' ? {
            approvedById: adminUser.id,
            approvalComment: 'Cannot be granted during exam period',
            reviewedAt: daysAgo(daysBack - 1),
          } : {}),
        },
      })
      leaveCount++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Unique')) console.log(`  Skipped leave ${i} (duplicate)`)
      else throw e
    }
  }
  console.log(`  Created ${leaveCount} staff leaves`)

  // ─── 7. StaffSalary (20) ──────────────────────────────────
  console.log('\n[7/12] Creating StaffSalaries...')
  const salaryStaff = staff.slice(0, 10)
  const salaryMonths = [
    { month: 3, year: 2026 },
    { month: 2, year: 2026 },
  ]
  let salaryCount = 0
  for (const s of salaryStaff) {
    for (const period of salaryMonths) {
      const basic = randomInt(25000, 80000)
      const hra = Math.round(basic * 0.3)
      const transport = 1500
      const pf = Math.round(basic * 0.12)
      const profTax = 200
      const gross = basic + hra + transport
      const net = gross - pf - profTax
      const paidAt = new Date(period.year, period.month - 1, 28) // last working day approx
      try {
        await prisma.staffSalary.create({
          data: {
            institutionId: iid,
            staffId: s.id,
            month: period.month,
            year: period.year,
            basicSalary: basic,
            allowances: [
              { name: 'HRA', amount: hra },
              { name: 'Transport', amount: transport },
            ],
            deductions: [
              { name: 'PF', amount: pf },
              { name: 'ProfTax', amount: profTax },
            ],
            grossSalary: gross,
            netSalary: net,
            paidAt,
            processedById: adminUser.id,
            notes: `Salary for ${period.month}/${period.year}`,
          },
        })
        salaryCount++
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('Unique')) console.log(`  Skipped salary for staff ${s.firstName} ${period.month}/${period.year} (duplicate)`)
        else throw e
      }
    }
  }
  console.log(`  Created ${salaryCount} staff salaries`)

  // ─── 8. SubjectPosts (24 total, 8 per subject) ───────────
  console.log('\n[8/12] Creating SubjectPosts...')
  const postSubjects = subjects.slice(0, 3)
  const postTypesPerSubject: Array<{ type: 'MATERIAL' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'QUIZ' | 'HOMEWORK'; isPublished: boolean }> = [
    { type: 'MATERIAL', isPublished: true },
    { type: 'MATERIAL', isPublished: true },
    { type: 'ASSIGNMENT', isPublished: true },
    { type: 'ASSIGNMENT', isPublished: true },
    { type: 'ANNOUNCEMENT', isPublished: true },
    { type: 'ANNOUNCEMENT', isPublished: true },
    { type: 'QUIZ', isPublished: false },
    { type: 'HOMEWORK', isPublished: false },
  ]
  const postTitles: Record<string, string[]> = {
    MATERIAL: ['Chapter Notes — Introduction', 'Reference Material — Key Concepts', 'Study Guide — Unit Review', 'Revision Sheet — Important Formulas'],
    ASSIGNMENT: ['Weekly Assignment — Problem Set', 'Group Project — Research Paper', 'Case Study Analysis', 'Practical Assignment — Lab Report'],
    ANNOUNCEMENT: ['Class Schedule Change', 'Guest Lecture Announcement', 'Exam Preparation Guidelines', 'New Resource Available'],
    QUIZ: ['Chapter Quiz — Multiple Choice', 'Surprise Quiz — Short Answers'],
    HOMEWORK: ['Daily Homework — Practice Questions', 'Weekend Homework — Essay Writing'],
  }
  let postCount = 0
  for (const subj of postSubjects) {
    // Find a teacher for this subject
    const subjectTeacher = await prisma.subjectTeacher.findFirst({ where: { subjectId: subj.id } })
    const creatorId = subjectTeacher?.teacherId ?? adminUser.id

    for (let i = 0; i < postTypesPerSubject.length; i++) {
      const pt = postTypesPerSubject[i]!
      const titles = postTitles[pt.type]!
      const title = `${titles[i % titles.length]} — ${subj.name}`
      try {
        await prisma.subjectPost.create({
          data: {
            institutionId: iid,
            subjectId: subj.id,
            sectionId: subj.sectionId,
            type: pt.type,
            title,
            description: `${title}. Please review and complete before the deadline.`,
            isPublished: pt.isPublished,
            createdById: creatorId,
            order: i,
          },
        })
        postCount++
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('Unique')) console.log(`  Skipped post "${title}" (duplicate)`)
        else throw e
      }
    }
  }
  console.log(`  Created ${postCount} subject posts`)

  // ─── 9. SupportTickets (20) ───────────────────────────────
  console.log('\n[9/12] Creating SupportTickets...')
  const ticketData: Array<{
    title: string
    description: string
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  }> = [
    // 5 OPEN
    { title: 'Login issue — password not working', description: 'Unable to login with existing credentials after password reset', priority: 'CRITICAL', status: 'OPEN' },
    { title: 'Fee receipt not generated', description: 'Payment was made via UPI but receipt not showing in dashboard', priority: 'HIGH', status: 'OPEN' },
    { title: 'Bus route change request', description: 'Need to change bus route from Route 5 to Route 3 for next month', priority: 'MEDIUM', status: 'OPEN' },
    { title: 'Student photo not uploading', description: 'Getting error while trying to upload student profile photo, file size is under 2MB', priority: 'HIGH', status: 'OPEN' },
    { title: 'Timetable not visible', description: 'Timetable page shows blank for Class 7-A section', priority: 'CRITICAL', status: 'OPEN' },
    // 8 IN_PROGRESS
    { title: 'Attendance correction needed', description: 'Student was marked absent on 10th but was present', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Grade entry mismatch', description: 'Marks entered for Maths do not match the gradebook total', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Parent portal access issue', description: 'Parent cannot see child progress report in the consumer portal', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { title: 'Circular not delivered', description: 'Latest circular about sports day not received by Class 8 parents', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Duplicate student entry', description: 'Same student appears twice in the student list with different admission numbers', priority: 'CRITICAL', status: 'IN_PROGRESS' },
    { title: 'Leave balance incorrect', description: 'Casual leave balance shows 0 but only 5 leaves taken out of 12', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Assignment submission error', description: 'Students getting error when submitting assignments for English subject', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Report card format issue', description: 'Report card PDF has overlapping text in the remarks section', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    // 5 RESOLVED
    { title: 'SMS notifications not working', description: 'Parents not receiving SMS for attendance alerts', priority: 'CRITICAL', status: 'RESOLVED' },
    { title: 'Fee concession not applied', description: 'Sibling discount was approved but not reflected in fee payment', priority: 'HIGH', status: 'RESOLVED' },
    { title: 'Class teacher assignment missing', description: 'Class 6-B does not have a class teacher assigned', priority: 'MEDIUM', status: 'RESOLVED' },
    { title: 'Calendar event wrong date', description: 'Sports day shown on wrong date in calendar', priority: 'LOW', status: 'RESOLVED' },
    { title: 'Exam schedule conflict', description: 'Two exams scheduled at the same time for Class 7', priority: 'HIGH', status: 'RESOLVED' },
    // 2 CLOSED
    { title: 'Theme color not applying', description: 'Custom theme colors set in branding settings not reflecting on student portal', priority: 'LOW', status: 'CLOSED' },
    { title: 'Old data cleanup request', description: 'Request to remove test data from last year demo', priority: 'MEDIUM', status: 'CLOSED' },
  ]
  let ticketCount = 0
  for (const td of ticketData) {
    const ticket = await prisma.supportTicket.create({
      data: {
        institutionId: iid,
        raisedById: pick(allUserIds),
        title: td.title,
        description: td.description,
        priority: td.priority,
        status: td.status,
        ...(td.status === 'RESOLVED' || td.status === 'CLOSED'
          ? { resolvedById: adminUser.id, resolvedAt: daysAgo(randomInt(1, 5)) }
          : {}),
      },
    })
    ticketCount++

    // Add messages for IN_PROGRESS and RESOLVED tickets
    if (td.status === 'IN_PROGRESS' || td.status === 'RESOLVED') {
      await prisma.ticketMessage.createMany({
        data: [
          {
            ticketId: ticket.id,
            authorId: ticket.raisedById,
            body: `I am facing this issue: ${td.description}. Please help.`,
          },
          {
            ticketId: ticket.id,
            authorId: adminUser.id,
            body: `We are looking into this issue. Our team will resolve it shortly.`,
            isInternal: false,
          },
        ],
      })
    }
  }
  console.log(`  Created ${ticketCount} support tickets with messages`)

  // ─── 10. TimetableSlots (40+) ─────────────────────────────
  console.log('\n[10/12] Creating TimetableSlots...')
  // Find sections that actually have subjects in their classYear
  const sectionsWithSubjects = sections.filter(sec =>
    subjects.some(s => s.classYearId === sec.classYearId && (s.sectionId === null || s.sectionId === sec.id))
  )
  const timetableSections = sectionsWithSubjects.slice(0, 2)
  console.log(`  Using sections: ${timetableSections.map(s => `${s.classYear.classTemplate.name}-${s.name}`).join(', ')}`)
  let slotCount = 0
  for (const sec of timetableSections) {
    // Get subjects for this section's classYear
    const sectionSubjects = subjects.filter(
      s => s.classYearId === sec.classYearId && (s.sectionId === null || s.sectionId === sec.id)
    )
    if (sectionSubjects.length === 0) {
      console.log(`  No subjects for section ${sec.name}, skipping`)
      continue
    }

    for (let day = 1; day <= 5; day++) { // Mon-Fri
      for (let period = 1; period <= 8; period++) {
        const subj = sectionSubjects[(day * 8 + period) % sectionSubjects.length]!
        const startHour = 8 + Math.floor((period - 1) * 45 / 60)
        const startMin = ((period - 1) * 45) % 60
        const endTotalMin = (period - 1) * 45 + 45
        const endHour = 8 + Math.floor(endTotalMin / 60)
        const endMin = endTotalMin % 60
        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
        try {
          await prisma.timetableSlot.create({
            data: {
              institutionId: iid,
              sectionId: sec.id,
              subjectId: subj.id,
              dayOfWeek: day,
              periodNumber: period,
              startTime,
              endTime,
              roomNumber: `Room ${101 + (period % 10)}`,
            },
          })
          slotCount++
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          if (msg.includes('Unique')) {
            // slot already exists — skip silently
          } else throw e
        }
      }
    }
  }
  console.log(`  Created ${slotCount} timetable slots`)

  // ─── 11. KudosConfig (1) ──────────────────────────────────
  console.log('\n[11/12] Upserting KudosConfig...')
  await prisma.kudosConfig.upsert({
    where: { institutionId: iid },
    create: {
      institutionId: iid,
      badgePoints: {
        STAR: 10,
        THUMBS_UP: 15,
        TROPHY: 50,
        HEART: 20,
        LIGHTNING: 25,
        CROWN: 40,
      },
    },
    update: {
      badgePoints: {
        STAR: 10,
        THUMBS_UP: 15,
        TROPHY: 50,
        HEART: 20,
        LIGHTNING: 25,
        CROWN: 40,
      },
    },
  })
  console.log(`  KudosConfig upserted`)

  // ─── 12. EnquiryFormSettings (1) ──────────────────────────
  console.log('\n[12/12] Upserting EnquiryFormSettings...')
  await prisma.enquiryFormSettings.upsert({
    where: { institutionId: iid },
    create: {
      institutionId: iid,
      isEnabled: true,
      welcomeMessage: "Welcome to St. Mary's! Please fill in your details below.",
      thankYouMessage: 'Thank you for your enquiry! Our team will contact you within 24 hours.',
    },
    update: {
      isEnabled: true,
      welcomeMessage: "Welcome to St. Mary's! Please fill in your details below.",
      thankYouMessage: 'Thank you for your enquiry! Our team will contact you within 24 hours.',
    },
  })
  console.log(`  EnquiryFormSettings upserted`)

  // ─── Verification ─────────────────────────────────────────
  console.log('\n━━━ VERIFICATION ━━━')
  const counts = await Promise.all([
    prisma.admission.count({ where: { institutionId: iid } }),
    prisma.auditLog.count({ where: { institutionId: iid } }),
    prisma.schoolCalendarEvent.count({ where: { institutionId: iid } }),
    prisma.feeConcession.count({ where: { institutionId: iid } }),
    prisma.notification.count({ where: { institutionId: iid } }),
    prisma.staffLeave.count({ where: { institutionId: iid } }),
    prisma.staffSalary.count({ where: { institutionId: iid } }),
    prisma.subjectPost.count({ where: { institutionId: iid } }),
    prisma.supportTicket.count({ where: { institutionId: iid } }),
    prisma.timetableSlot.count({ where: { institutionId: iid } }),
    prisma.kudosConfig.count({ where: { institutionId: iid } }),
    prisma.enquiryFormSettings.count({ where: { institutionId: iid } }),
  ])
  const labels = [
    'Admission', 'AuditLog', 'CalendarEvent', 'FeeConcession',
    'Notification', 'StaffLeave', 'StaffSalary', 'SubjectPost',
    'SupportTicket', 'TimetableSlot', 'KudosConfig', 'EnquiryFormSettings',
  ]
  const targets = [20, 25, 20, 20, 20, 20, 20, 20, 20, 40, 1, 1]
  for (let i = 0; i < labels.length; i++) {
    const ok = counts[i]! >= targets[i]! ? 'PASS' : 'FAIL'
    console.log(`  ${ok} ${labels[i]}: ${counts[i]} (target: ${targets[i]}+)`)
  }
}

main()
  .then(() => {
    console.log('\nDone!')
    return prisma.$disconnect()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
