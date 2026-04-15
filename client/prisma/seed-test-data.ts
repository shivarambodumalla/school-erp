/**
 * Comprehensive test data seed — scoped to stmarys institution.
 * Run: npx tsx prisma/seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomDate(daysAgo: number): Date {
  const d = new Date(); d.setDate(d.getDate() - randomInt(0, daysAgo))
  d.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0); return d
}
function dateOnly(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d }
function isWeekend(d: Date) { return d.getDay() === 0 || d.getDay() === 6 }
function pick<T>(a: T[]) { return a[randomInt(0, a.length - 1)]! }
function shuffle<T>(a: T[]) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = randomInt(0, i);[r[i], r[j]] = [r[j]!, r[i]!] } return r }

async function main() {
  console.log('━━━ STEP 1 — FETCH REQUIRED IDS ━━━')

  const inst = await prisma.institution.findFirst({ where: { subdomain: 'stmarys' } })
  if (!inst) throw new Error('stmarys not found')
  const iid = inst.id
  console.log(`  Institution: ${inst.name} (${iid})`)

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@stmarys.com', institutionId: iid } })
  if (!adminUser) throw new Error('admin not found')

  const allStaff = await prisma.staff.findMany({ where: { institutionId: iid }, select: { id: true, userId: true, firstName: true } })
  const staffWithUser = allStaff.filter(s => s.userId)
  const staff1 = staffWithUser[0]!; const staff2 = staffWithUser[1]!; const staff3 = staffWithUser[2]!
  console.log(`  Staff (with login): ${staffWithUser.map(s => s.firstName).join(', ')}`)
  const staffIds = [staff1.id, staff2.id, staff3.id]

  const allStudents = await prisma.student.findMany({
    where: { institutionId: iid },
    include: { sections: { include: { section: true, classYear: { include: { classTemplate: true } } } } },
  })
  console.log(`  Students: ${allStudents.length}`)

  const classTemplates = await prisma.classTemplate.findMany({ where: { institutionId: iid } })
  const c6T = classTemplates.find(c => c.name === 'Class 6')!
  const c7T = classTemplates.find(c => c.name === 'Class 7')!
  const c8T = classTemplates.find(c => c.name === 'Class 8')!

  const class6Year = await prisma.classYear.findFirst({ where: { institutionId: iid, classTemplateId: c6T.id }, include: { sections: true } })
  const class7Year = await prisma.classYear.findFirst({ where: { institutionId: iid, classTemplateId: c7T.id }, include: { sections: true } })
  const class8Year = await prisma.classYear.findFirst({ where: { institutionId: iid, classTemplateId: c8T.id }, include: { sections: true } })
  console.log(`  Classes: 6(${class6Year?.sections.length}s) 7(${class7Year?.sections.length}s) 8(${class8Year?.sections.length}s)`)

  const academicYear = await prisma.academicYear.findFirst({ where: { institutionId: iid, isCurrent: true } })
  if (!academicYear) throw new Error('No current academic year')
  console.log(`  Academic Year: ${academicYear.name}`)

  const examTypes = await prisma.examType.findMany({ where: { institutionId: iid }, orderBy: { order: 'asc' } })
  const class8Subjects = await prisma.subject.findMany({ where: { institutionId: iid, classYearId: class8Year?.id } })
  const allUsers = await prisma.user.findMany({ where: { institutionId: iid }, select: { id: true } })
  const admissions = await prisma.admission.findMany({ where: { institutionId: iid }, select: { id: true, firstName: true, lastName: true } })

  console.log(`  ExamTypes: ${examTypes.map(e => e.name).join(', ')}`)
  console.log(`  Class8 Subjects: ${class8Subjects.length}, Users: ${allUsers.length}, Admissions: ${admissions.length}`)
  console.log('\nStarting seed...\n')

  // Clean existing seed data (safe — only deletes data we're about to re-insert)
  console.log('Cleaning existing seed data...')
  await prisma.circularRead.deleteMany({ where: { circular: { institutionId: iid } } })
  await prisma.schoolCircular.deleteMany({ where: { institutionId: iid } })
  await prisma.kudos.deleteMany({ where: { institutionId: iid } })
  await prisma.meritListEntry.deleteMany({ where: { meritList: { institutionId: iid } } })
  await prisma.meritListConfig.deleteMany({ where: { institutionId: iid } })
  await prisma.leadFollowUp.deleteMany({ where: { institutionId: iid } })
  await prisma.lead.deleteMany({ where: { institutionId: iid } })
  await prisma.leadLabel.deleteMany({ where: { institutionId: iid } })
  await prisma.reportCardGeneration.deleteMany({ where: { institutionId: iid } })
  console.log('  ✓ Cleaned\n')

  await prisma.$transaction(async (tx) => {

    // ━━━ STEP 2 — LEAD LABELS (8) ━━━
    console.log('STEP 2 — Lead Labels')
    const labelDefs = [
      { name: 'Hot', color: '#ef4444' }, { name: 'Warm', color: '#f59e0b' },
      { name: 'Cold', color: '#6366f1' }, { name: 'Lost', color: '#94a3b8' },
      { name: 'Priority', color: '#8b5cf6' }, { name: 'Follow Today', color: '#f97316' },
      { name: 'Scholarship', color: '#10b981' }, { name: 'Waitlisted', color: '#0ea5e9' },
    ]
    const labels = []
    for (const l of labelDefs) {
      labels.push(await tx.leadLabel.create({ data: { institutionId: iid, name: l.name, color: l.color } }))
    }
    console.log(`  ✓ ${labels.length} labels`)

    // ━━━ STEP 3 — LEADS (50) ━━━
    console.log('STEP 3 — Leads')
    const leadNames: [string, string, string][] = [
      ['Aarav','Sharma','9876543201'],['Aisha','Patel','9876543202'],['Arnav','Mehta','9876543203'],
      ['Ananya','Singh','9876543204'],['Advait','Kumar','9876543205'],['Aditi','Nair','9876543206'],
      ['Arjun','Reddy','9876543207'],['Avni','Gupta','9876543208'],['Aditya','Iyer','9876543209'],
      ['Amara','Pillai','9876543210'],['Bhavya','Joshi','9876543211'],['Chirag','Verma','9876543212'],
      ['Diya','Krishnan','9876543213'],['Dev','Malhotra','9876543214'],['Divya','Menon','9876543215'],
      ['Dhruv','Kapoor','9876543216'],['Esha','Rao','9876543217'],['Farhan','Shaikh','9876543218'],
      ['Gauri','Desai','9876543219'],['Harsh','Pandey','9876543220'],['Ira','Bose','9876543221'],
      ['Ishaan','Mukherjee','9876543222'],['Jiya','Chatterjee','9876543223'],['Kabir','Saxena','9876543224'],
      ['Kavya','Nambiar','9876543225'],['Krish','Agarwal','9876543226'],['Kiara','Shetty','9876543227'],
      ['Laksh','Tiwari','9876543228'],['Layla','Mathur','9876543229'],['Manav','Chawla','9876543230'],
      ['Meera','Venkat','9876543231'],['Mihir','Ghosh','9876543232'],['Myra','Kulkarni','9876543233'],
      ['Neel','Jain','9876543234'],['Neha','Thakur','9876543235'],['Om','Mishra','9876543236'],
      ['Pari','Dubey','9876543237'],['Pranav','Hegde','9876543238'],['Prisha','Sinha','9876543239'],
      ['Rahul','Nair','9876543240'],['Riya','Menon','9876543241'],['Rohan','Bajaj','9876543242'],
      ['Saanvi','Shah','9876543243'],['Sahil','Yadav','9876543244'],['Sara','Puri','9876543245'],
      ['Shiv','Rastogi','9876543246'],['Sia','Bhatia','9876543247'],['Tanvi','Arora','9876543248'],
      ['Veer','Mahajan','9876543249'],['Zara','Chopra','9876543250'],
    ]
    const sources = shuffle<string>([...Array(10).fill('WALK_IN'),...Array(12).fill('WEBSITE'),...Array(13).fill('SOCIAL'),...Array(10).fill('REFERRAL'),...Array(5).fill('OTHER')])
    const statuses = shuffle<string>([...Array(8).fill('NEW'),...Array(10).fill('CONTACTED'),...Array(10).fill('INTERESTED'),...Array(8).fill('APPLIED'),...Array(8).fill('CONVERTED'),...Array(6).fill('LOST')])
    const targetClassIds = [c6T.id, c7T.id, c8T.id]
    const notePool = ['Parent enquired about admission','Called regarding fee structure','Visited campus, impressed','Referred by existing parent','Found through Google','Interested in sports program','Looking to transfer','Enquired about transport','Wants admission for siblings','Alumni parent']

    const leads = []
    for (let i = 0; i < 50; i++) {
      const [first, last, phone] = leadNames[i]!
      leads.push(await tx.lead.create({
        data: {
          institutionId: iid, name: `${first} ${last}`, phone,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
          source: sources[i] as 'WALK_IN' | 'WEBSITE' | 'SOCIAL' | 'REFERRAL' | 'OTHER',
          status: statuses[i] as 'NEW' | 'CONTACTED' | 'INTERESTED' | 'APPLIED' | 'CONVERTED' | 'LOST',
          targetClassId: pick(targetClassIds), labelId: pick(labels).id,
          notes: pick(notePool), assignedToId: pick(staffIds), createdAt: randomDate(90),
        },
      }))
    }
    console.log(`  ✓ ${leads.length} leads`)

    // ━━━ STEP 4 — FOLLOW-UPS (80) ━━━
    console.log('STEP 4 — Follow-ups')
    const channels = shuffle<string>([...Array(30).fill('CALL'),...Array(25).fill('WHATSAPP'),...Array(15).fill('EMAIL'),...Array(10).fill('SMS')])
    const outcomePool = [
      'Parent very interested, visiting campus next week','Discussed fee structure, needs scholarship info',
      'Not reachable, will try again','Very interested, submitted application',
      'Requires more information on transport','Campus tour scheduled for weekend',
      'Parent concerned about class strength','Scholarship criteria explained',
      'Application form shared via WhatsApp','Converted — admission confirmed',
    ]
    const today = dateOnly(new Date())

    for (let i = 0; i < 80; i++) {
      const lead = leads[i % 50]!
      let scheduledAt: Date; let completedAt: Date | null = null; let outcome: string | null = null
      if (i < 20) {
        scheduledAt = randomDate(30); completedAt = new Date(scheduledAt.getTime() + randomInt(1, 48) * 3600000)
        outcome = outcomePool[i % outcomePool.length]!
      } else if (i < 40) {
        scheduledAt = new Date(today); scheduledAt.setHours(randomInt(8, 17), randomInt(0, 59))
      } else if (i < 55) {
        scheduledAt = daysAgo(randomInt(1, 14)); scheduledAt.setHours(randomInt(8, 17))
      } else {
        scheduledAt = new Date(); scheduledAt.setDate(scheduledAt.getDate() + randomInt(1, 7)); scheduledAt.setHours(randomInt(8, 17))
      }
      await tx.leadFollowUp.create({
        data: {
          leadId: lead.id, institutionId: iid, staffId: pick(staffIds),
          channel: channels[i] as 'CALL' | 'WHATSAPP' | 'EMAIL' | 'SMS',
          scheduledAt, completedAt, notes: outcome ?? `Follow up with ${lead.name}`, outcome,
        },
      })
    }
    console.log(`  ✓ 80 follow-ups`)

    // ━━━ STEP 5 — MERIT LIST CONFIGS (3) ━━━
    console.log('STEP 5 — Merit list configs')
    const mc1 = await tx.meritListConfig.create({ data: { institutionId: iid, name: 'Class 6 Admissions 2025-26', academicYearId: academicYear.id, targetClassId: c6T.id, totalSeats: 60, cutoffScore: 65, rankingCriteria: [{ type: 'ENTRANCE_TEST', weight: 50 },{ type: 'PREVIOUS_MARKS', weight: 30 },{ type: 'AGE', weight: 20 }], publishedAt: daysAgo(10) } })
    const mc2 = await tx.meritListConfig.create({ data: { institutionId: iid, name: 'Class 7 Lateral Entry', academicYearId: academicYear.id, targetClassId: c7T.id, totalSeats: 10, cutoffScore: 70, rankingCriteria: [{ type: 'ENTRANCE_TEST', weight: 70 },{ type: 'PREVIOUS_MARKS', weight: 30 }] } })
    const mc3 = await tx.meritListConfig.create({ data: { institutionId: iid, name: 'Class 8 Lateral Entry', academicYearId: academicYear.id, targetClassId: c8T.id, totalSeats: 5, cutoffScore: 75, rankingCriteria: [{ type: 'ENTRANCE_TEST', weight: 100 }] } })
    console.log(`  ✓ 3 configs`)

    // ━━━ STEP 6 — MERIT LIST ENTRIES (30) ━━━
    console.log('STEP 6 — Merit list entries')
    // Each config can reuse same admissions (unique per meritListId+admissionId)
    const sAdm = shuffle(admissions)
    let meritTotal = 0
    // Config 1: 15 entries (all available admissions)
    for (let r = 1; r <= sAdm.length; r++) {
      const st = r <= 10 ? 'SELECTED' : r <= 13 ? 'WAITLISTED' : 'REJECTED'
      await tx.meritListEntry.create({ data: { meritListId: mc1.id, admissionId: sAdm[r - 1]!.id, rank: r, score: randomInt(45, 95), status: st as 'SELECTED' | 'WAITLISTED' | 'REJECTED' } })
      meritTotal++
    }
    // Config 2: 10 entries (reuse admissions — different meritListId so no unique conflict)
    const sAdm2 = shuffle(admissions)
    for (let r = 1; r <= Math.min(10, sAdm2.length); r++) {
      await tx.meritListEntry.create({ data: { meritListId: mc2.id, admissionId: sAdm2[r - 1]!.id, rank: r, score: randomInt(68, 88), status: r <= 7 ? 'SELECTED' : 'WAITLISTED' } })
      meritTotal++
    }
    // Config 3: 5 entries
    const sAdm3 = shuffle(admissions)
    for (let r = 1; r <= Math.min(5, sAdm3.length); r++) {
      await tx.meritListEntry.create({ data: { meritListId: mc3.id, admissionId: sAdm3[r - 1]!.id, rank: r, score: randomInt(60, 85), status: 'WAITLISTED' } })
      meritTotal++
    }
    console.log(`  ✓ ${meritTotal} entries`)

    // ━━━ STEP 7 — KUDOS (40) ━━━
    console.log('STEP 7 — Kudos')
    const badgePool = shuffle<{ badge: string; pts: number }>([
      ...Array(8).fill({ badge: 'TROPHY', pts: 50 }),...Array(8).fill({ badge: 'STAR', pts: 30 }),
      ...Array(8).fill({ badge: 'CROWN', pts: 40 }),...Array(6).fill({ badge: 'LIGHTNING', pts: 25 }),
      ...Array(6).fill({ badge: 'HEART', pts: 20 }),...Array(4).fill({ badge: 'THUMBS_UP', pts: 15 }),
    ])
    const kTitles = ['Outstanding Performance in Mathematics','Best Science Project','Most Improved Student','Perfect Attendance','Excellent Leadership','Helping Classmates','Top Score in Unit Test','Best English Essay','District Sports Representative','Exceptional Conduct','Creative Art Winner','100% Homework Submission','Best Debate Speaker','Science Olympiad Participant','Mathematics Quiz Champion']
    for (let i = 0; i < 40; i++) {
      const b = badgePool[i]!
      await tx.kudos.create({ data: {
        institutionId: iid, studentId: allStudents[i % allStudents.length]!.id,
        teacherId: pick(staffIds), badgeType: b.badge as 'TROPHY' | 'STAR' | 'CROWN' | 'LIGHTNING' | 'HEART' | 'THUMBS_UP',
        title: kTitles[i % kTitles.length]!, description: i % 3 === 0 ? 'Keep up the great work!' : null,
        points: b.pts, createdAt: randomDate(60),
      } })
    }
    console.log(`  ✓ 40 kudos`)

    // ━━━ STEP 8 — CIRCULARS (15) ━━━
    console.log('STEP 8 — Circulars')
    const cDefs: Array<{ t: string; a: string; p: boolean; cls?: string[]; c: string }> = [
      { t: 'Annual Day — 15th April 2025', a: 'ALL', p: true, c: 'Annual Day at auditorium. 9AM-1PM. School uniform.' },
      { t: 'Holiday — Good Friday 18th April', a: 'ALL', p: false, c: 'School closed 18th April. Resume 21st April.' },
      { t: 'Class 8 PTM', a: 'CLASS', p: true, cls: class8Year ? [class8Year.id] : [], c: 'PTM Saturday 20th April, 10AM-12:30PM.' },
      { t: 'Summer Vacation 2025', a: 'ALL', p: true, c: 'Vacation 10th May. Reopen 15th June.' },
      { t: 'Fee Reminder — 30th April', a: 'ALL', p: true, c: 'Last date quarterly fee: 30th April. Late charges apply.' },
      { t: 'Sports Day — 22nd April', a: 'ALL', p: false, c: 'Sports Day 22nd April. House T-shirts. 8AM.' },
      { t: 'Uniform Update', a: 'ALL', p: false, c: 'Updated uniforms from next term.' },
      { t: 'Field Trip — Science Museum', a: 'CLASS', p: false, cls: [class6Year?.id, class7Year?.id].filter(Boolean) as string[], c: 'Class 6 & 7 trip 25th April. Slips by 22nd.' },
      { t: 'Final Term Exam Schedule', a: 'ALL', p: true, c: 'Exams begin 1st May. Schedule on notice board.' },
      { t: 'New Library Books', a: 'STUDENTS', p: false, c: '200 new books. Visit during break hours.' },
      { t: 'Staff Dev Day — Closed', a: 'ALL', p: false, c: 'Closed 28th April for Staff Development.' },
      { t: 'Inter-School Quiz Results', a: 'ALL', p: false, c: 'Our team won 2nd prize at DPS Quiz!' },
      { t: 'Yoga Week 5-9 May', a: 'ALL', p: false, c: 'Yoga sessions 30 min morning assembly.' },
      { t: 'Digital Classroom Launch', a: 'ALL', p: false, c: 'Smart boards installed. Training next week.' },
      { t: 'Class 6 Welcome Party', a: 'CLASS', p: false, cls: class6Year ? [class6Year.id] : [], c: 'Welcome party 16th April, last 2 periods.' },
    ]
    const circulars = []
    for (const d of cDefs) {
      circulars.push(await tx.schoolCircular.create({ data: {
        institutionId: iid, title: d.t, content: d.c,
        targetAudience: d.a as 'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF' | 'CLASS',
        targetClassIds: d.cls ?? [], isPinned: d.p, publishedAt: randomDate(30), createdById: staffIds[0]!,
      } }))
    }
    console.log(`  ✓ ${circulars.length} circulars`)

    // ━━━ STEP 9 — CIRCULAR READS ━━━
    console.log('STEP 9 — Circular reads')
    const readData: Array<{ circularId: string; userId: string; readAt: Date }> = []
    for (const c of circulars) {
      const pct = randomInt(75, 100)
      const su = shuffle(allUsers); const n = Math.max(1, Math.floor(su.length * pct / 100))
      for (let j = 0; j < n; j++) readData.push({ circularId: c.id, userId: su[j]!.id, readAt: randomDate(15) })
    }
    await tx.circularRead.createMany({ data: readData, skipDuplicates: true })
    console.log(`  ✓ ${readData.length} reads`)

    // ━━━ STEP 10 — REPORT CARD GENERATIONS ━━━
    console.log('STEP 10 — Report card generations')
    const ut1 = examTypes.find(e => e.name.includes('Unit Test 1')) ?? examTypes[0]
    const ut2 = examTypes.find(e => e.name.includes('Unit Test 2')) ?? examTypes[1]
    const hy = examTypes.find(e => e.name.includes('Half')) ?? examTypes[2]
    const rcDefs = [
      { cy: class8Year?.id, ex: [ut1?.id, ut2?.id].filter(Boolean) as string[], g: daysAgo(30) },
      { cy: class7Year?.id, ex: [hy?.id].filter(Boolean) as string[], g: daysAgo(15) },
      { cy: class6Year?.id, ex: [ut1?.id, ut2?.id, hy?.id].filter(Boolean) as string[], g: daysAgo(5) },
    ]
    // Check existing to avoid unique violations
    const existingRc = await tx.reportCardGeneration.findMany({
      where: { institutionId: iid }, select: { classYearId: true, academicYearId: true },
    })
    const rcKeys = new Set(existingRc.map(r => `${r.classYearId}-${r.academicYearId}`))
    let rcCount = 0
    for (const rc of rcDefs) {
      if (!rc.cy) continue
      if (rcKeys.has(`${rc.cy}-${academicYear.id}`)) continue
      await tx.reportCardGeneration.create({ data: {
        institutionId: iid, classYearId: rc.cy, academicYearId: academicYear.id,
        examTypeIds: rc.ex, includeAttendance: !!rc.g, status: rc.g ? 'GENERATED' : 'DRAFT',
        generatedAt: rc.g, createdById: adminUser.id,
      } })
      rcCount++
    }
    console.log(`  ✓ ${rcCount} generations`)

    // ━━━ STEP 11 — ATTENDANCE ━━━
    console.log('STEP 11 — Attendance')
    const attData: Array<{ institutionId: string; studentId: string; sectionId: string; date: Date; status: 'PRESENT'|'ABSENT'|'LATE'|'EXCUSED'; markedById: string }> = []
    for (const st of allStudents.filter(s => s.sections.length > 0)) {
      const sec = st.sections[0]!
      for (let d = 1; d <= 45; d++) {
        const dt = daysAgo(d); if (isWeekend(dt)) continue
        const r = Math.random()
        attData.push({ institutionId: iid, studentId: st.id, sectionId: sec.sectionId, date: dateOnly(dt),
          status: r < 0.85 ? 'PRESENT' : r < 0.93 ? 'ABSENT' : r < 0.97 ? 'LATE' : 'EXCUSED', markedById: pick(staffIds) })
      }
    }
    await tx.attendance.createMany({ data: attData, skipDuplicates: true })
    console.log(`  ✓ ${attData.length} attendance records`)

    // ━━━ STEP 12 — GRADE ENTRIES ━━━
    console.log('STEP 12 — Grade entries')
    const grData: Array<{ institutionId: string; studentId: string; subjectId: string; examTypeId: string; marksObtained: number; totalMarks: number; enteredById: string }> = []
    const c8Stu = allStudents.filter(s => s.sections.some(sec => sec.classYear?.classTemplate?.name === 'Class 8'))
    const exCfg = [{ ex: ut1, tot: 20, mn: 12, mx: 20 },{ ex: ut2, tot: 20, mn: 12, mx: 20 },{ ex: hy, tot: 100, mn: 55, mx: 90 }].filter(e => e.ex)
    for (const st of c8Stu) {
      const ab = Math.random() > 0.7 ? 0.15 : Math.random() < 0.3 ? -0.15 : 0
      for (const sub of class8Subjects) {
        for (const ec of exCfg) {
          const rng = ec.mx - ec.mn; const base = ec.mn + rng * (0.5 + ab)
          grData.push({ institutionId: iid, studentId: st.id, subjectId: sub.id, examTypeId: ec.ex!.id,
            marksObtained: Math.min(ec.mx, Math.max(ec.mn, Math.round(base + (Math.random() - 0.5) * rng * 0.4))),
            totalMarks: ec.tot, enteredById: pick(staffIds) })
        }
      }
    }
    await tx.gradeEntry.createMany({ data: grData, skipDuplicates: true })
    console.log(`  ✓ ${grData.length} grade entries`)

    // ━━━ STEP 13 — BEHAVIOUR INCIDENTS ━━━
    console.log('STEP 13 — Behaviour incidents')
    const incT: Array<{ type: string; sev: string }> = [
      ...Array(5).fill({ type: 'MISCONDUCT', sev: 'LOW' }),...Array(4).fill({ type: 'LATE_SUBMISSION', sev: 'LOW' }),
      ...Array(3).fill({ type: 'DISRUPTIVE', sev: 'MEDIUM' }),...Array(2).fill({ type: 'BULLYING', sev: 'HIGH' }),
      { type: 'CHEATING', sev: 'HIGH' },
    ]
    const acts = ['Verbal warning','Written warning','Parent meeting','Detention 1hr','Counsellor session','Apology letter','Community service','Suspended extracurricular']
    const iStu = shuffle(allStudents).slice(0, 8)
    for (let i = 0; i < 15; i++) {
      const d = incT[i]!
      await tx.behaviourIncident.create({ data: {
        institutionId: iid, studentId: iStu[i % iStu.length]!.id,
        type: d.type as 'MISCONDUCT' | 'LATE_SUBMISSION' | 'DISRUPTIVE' | 'BULLYING' | 'CHEATING',
        severity: d.sev as 'LOW' | 'MEDIUM' | 'HIGH',
        date: dateOnly(randomDate(60)), description: `Incident: ${d.type.toLowerCase().replace('_', ' ')}.`,
        actionTaken: pick(acts), reportedById: pick([staff1.id, staff2.id]), parentNotified: d.sev === 'HIGH',
      } })
    }
    console.log(`  ✓ 15 incidents`)

    // ━━━ STEP 14 — ACHIEVEMENTS ━━━
    console.log('STEP 14 — Achievements')
    const achD: Array<{ cat: string; title: string; desc: string }> = [
      { cat: 'ACADEMIC', title: 'Math Olympiad Gold', desc: 'Gold in National Math Olympiad regional.' },
      { cat: 'ACADEMIC', title: 'Science Fair 1st', desc: 'First prize water purification model.' },
      { cat: 'ACADEMIC', title: 'Essay Competition', desc: 'First inter-school essay Climate Change.' },
      { cat: 'ACADEMIC', title: 'Spelling Bee', desc: 'National Spelling Bee finalist.' },
      { cat: 'ACADEMIC', title: 'Hindi Poetry', desc: 'Won annual Hindi poetry recitation.' },
      { cat: 'ACADEMIC', title: 'CS Project', desc: 'Best project school app prototype.' },
      { cat: 'ACADEMIC', title: 'Quiz Champion', desc: 'Won inter-class quiz.' },
      { cat: 'ACADEMIC', title: 'Top Scorer', desc: 'Highest aggregate half-yearly exams.' },
      { cat: 'SPORTS', title: 'Cricket Runner-Up', desc: 'District cricket tournament.' },
      { cat: 'SPORTS', title: 'Athletics Silver', desc: 'Silver 100m state athletics.' },
      { cat: 'SPORTS', title: 'Football Champs', desc: 'Inter-school football winners.' },
      { cat: 'SPORTS', title: 'Badminton Gold', desc: 'Inter-school badminton singles.' },
      { cat: 'SPORTS', title: 'Swimming Bronze', desc: 'District 50m freestyle bronze.' },
      { cat: 'CULTURAL', title: 'Dance Performance', desc: 'Lead classical dance annual day.' },
      { cat: 'CULTURAL', title: 'Vocal Solo Winner', desc: 'Inter-school vocal solo first.' },
      { cat: 'CULTURAL', title: 'Art Exhibition', desc: 'Best painting school exhibition.' },
      { cat: 'CULTURAL', title: 'Best Actor', desc: 'Inter-school drama festival.' },
      { cat: 'COMMUNITY', title: 'NSS Volunteer', desc: '3-day NSS camp cleanliness drive.' },
      { cat: 'COMMUNITY', title: 'Tree Planting', desc: '50 saplings on Environment Day.' },
      { cat: 'COMMUNITY', title: 'Blood Donation', desc: 'Organized awareness campaign.' },
    ]
    const aStu = shuffle(allStudents).slice(0, 12)
    for (let i = 0; i < 20; i++) {
      const d = achD[i]!
      await tx.achievement.create({ data: {
        institutionId: iid, studentId: aStu[i % aStu.length]!.id,
        category: d.cat as 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'COMMUNITY',
        title: d.title, description: d.desc, date: dateOnly(randomDate(90)), awardedById: pick([adminUser.id, staff1.id]),
      } })
    }
    console.log(`  ✓ 20 achievements`)

    // ━━━ STEP 15 — COUNSELLOR NOTES ━━━
    console.log('STEP 15 — Counsellor notes')
    const cNotes = [
      'Exam anxiety signs. Recommended breathing exercises.','Parents separating. Needs emotional support.',
      'Exceptional student. Recommend gifted program.','Attendance concern. Parent agreed to improve.',
      'Science career interest. Shared competition info.','Peer conflict mediated. Reconciled.',
      'Math struggles. Extra tutoring suggested.','Behavioral improvement. Positive reinforcement works.',
      'Feeling isolated. Buddy system arranged.','Academic support plan created.',
    ]
    const cStu = shuffle(allStudents).slice(0, 5)
    for (let i = 0; i < 10; i++) {
      const nd = randomDate(45); const fu = new Date(nd); fu.setDate(fu.getDate() + 14)
      await tx.counsellorNote.create({ data: {
        institutionId: iid, studentId: cStu[i % cStu.length]!.id,
        note: cNotes[i]!, followUpDate: fu, createdById: adminUser.id, createdAt: nd,
      } })
    }
    console.log(`  ✓ 10 counsellor notes`)

  }, { timeout: 600000 })

  console.log('\n━━━ VERIFYING COUNTS ━━━\n')
}

main()
  .then(async () => {
    const counts = await prisma.$queryRaw<Array<{ model: string; count: bigint }>>`
      SELECT 'Lead' as model, COUNT(*)::bigint as count FROM "Lead"
      UNION ALL SELECT 'LeadLabel', COUNT(*)::bigint FROM "LeadLabel"
      UNION ALL SELECT 'LeadFollowUp', COUNT(*)::bigint FROM "LeadFollowUp"
      UNION ALL SELECT 'MeritListConfig', COUNT(*)::bigint FROM "MeritListConfig"
      UNION ALL SELECT 'MeritListEntry', COUNT(*)::bigint FROM "MeritListEntry"
      UNION ALL SELECT 'Kudos', COUNT(*)::bigint FROM "Kudos"
      UNION ALL SELECT 'SchoolCircular', COUNT(*)::bigint FROM "SchoolCircular"
      UNION ALL SELECT 'CircularRead', COUNT(*)::bigint FROM "CircularRead"
      UNION ALL SELECT 'ReportCardGeneration', COUNT(*)::bigint FROM "ReportCardGeneration"
      UNION ALL SELECT 'Attendance', COUNT(*)::bigint FROM "Attendance"
      UNION ALL SELECT 'GradeEntry', COUNT(*)::bigint FROM "GradeEntry"
      UNION ALL SELECT 'BehaviourIncident', COUNT(*)::bigint FROM "BehaviourIncident"
      UNION ALL SELECT 'Achievement', COUNT(*)::bigint FROM "Achievement"
      UNION ALL SELECT 'CounsellorNote', COUNT(*)::bigint FROM "CounsellorNote"
    `
    const mins: Record<string, number> = {
      Lead: 50, LeadLabel: 8, LeadFollowUp: 80, MeritListConfig: 3, MeritListEntry: 30,
      Kudos: 40, SchoolCircular: 15, CircularRead: 100, ReportCardGeneration: 3,
      Attendance: 600, GradeEntry: 100, BehaviourIncident: 15, Achievement: 20, CounsellorNote: 10,
    }
    let ok = true
    for (const r of counts) {
      const c = Number(r.count); const m = mins[r.model] ?? 0; const p = c >= m
      if (!p) ok = false
      console.log(`  ${r.model}: ${c} ${p ? '✅' : `❌ (min: ${m})`}`)
    }
    console.log(ok ? '\n✅ All counts meet minimums. Ready for feature testing.\n' : '\n❌ Some below minimum.\n')
    if (!ok) process.exit(1)
  })
  .catch(e => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
