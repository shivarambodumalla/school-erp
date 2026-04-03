import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const HASH_ROUNDS = 12

async function main(): Promise<void> {
    // Clean up in dependency order
    await prisma.feeConcession.deleteMany()
    await prisma.feePayment.deleteMany()
    await prisma.feeReminder.deleteMany()
    await prisma.feeFine.deleteMany()
    await prisma.feeCategory.deleteMany()
    await prisma.feeSettings.deleteMany()
    await prisma.staffIdCard.deleteMany()
    await prisma.performanceNote.deleteMany()
    await prisma.staffDocument.deleteMany()
    await prisma.staffSalary.deleteMany()
    await prisma.staffSalaryConfig.deleteMany()
    await prisma.staffAttendance.deleteMany()
    await prisma.staffLeave.deleteMany()
    await prisma.staffLeaveType.deleteMany()
    await prisma.classTeacherAssignment.deleteMany()
    await prisma.staffRoleAssignment.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.staffRole.deleteMany()
    await prisma.department.deleteMany()
    await prisma.staffSettings.deleteMany()
    await prisma.courseEnrollment.deleteMany()
    await prisma.courseAttachment.deleteMany()
    await prisma.coursePost.deleteMany()
    await prisma.course.deleteMany()
    await prisma.substitutionRecord.deleteMany()
    await prisma.examSchedule.deleteMany()
    await prisma.lessonPlan.deleteMany()
    await prisma.homeworkCompletion.deleteMany()
    await prisma.homeworkLog.deleteMany()
    await prisma.timetableSlot.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.attendanceSettings.deleteMany()
    await prisma.gradeEntry.deleteMany()
    await prisma.examType.deleteMany()
    await prisma.pollVote.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.quizAttempt.deleteMany()
    await prisma.quizQuestion.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.assignmentSubmission.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.subjectAttachment.deleteMany()
    await prisma.subjectPost.deleteMany()
    await prisma.subjectTeacher.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.promotionRecord.deleteMany()
    await prisma.studentSection.deleteMany()
    await prisma.ticketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.parentCommunicationLog.deleteMany()
    await prisma.schoolCalendarEvent.deleteMany()
    await prisma.document.deleteMany()
    await prisma.studentExit.deleteMany()
    await prisma.studentSibling.deleteMany()
    await prisma.studentIdCard.deleteMany()
    await prisma.studentDocument.deleteMany()
    await prisma.counsellorNote.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.behaviourIncident.deleteMany()
    await prisma.guardian.deleteMany()
    await prisma.feePayment.deleteMany()
    await prisma.student.deleteMany()
    await prisma.admission.deleteMany()
    await prisma.inquiry.deleteMany()
    await prisma.section.deleteMany()
    await prisma.classYear.deleteMany()
    await prisma.classTemplate.deleteMany()
    await prisma.academicYear.deleteMany()
    await prisma.admissionSettings.deleteMany()
    await prisma.documentTypeConfig.deleteMany()
    await prisma.onboardingStep.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.notificationTemplate.deleteMany()
    await prisma.role.deleteMany()
    await prisma.user.deleteMany()
    await prisma.institution.deleteMany()

    const pwd = await bcrypt.hash('Demo@1234', HASH_ROUNDS)
    const teacherPwd = await bcrypt.hash('TempPass@123', HASH_ROUNDS)

    // ── Institution ──
    const stmarys = await prisma.institution.create({
        data: {
            name: "St. Mary's Convent School",
            subdomain: 'stmarys',
            board: 'CBSE',
            planTier: 'GROWTH',
        },
    })

    // ── Users ──
    const adminUser = await prisma.user.create({
        data: {
            institutionId: stmarys.id, email: 'admin@stmarys.com',
            hashedPassword: pwd, portalType: 'ADMIN',
        },
    })

    await prisma.user.createMany({
        data: [
            { institutionId: stmarys.id, email: 'student@stmarys.com', hashedPassword: pwd, portalType: 'STUDENT' },
            { institutionId: stmarys.id, email: 'parent@stmarys.com', hashedPassword: pwd, portalType: 'PARENT' },
            { institutionId: stmarys.id, email: 'instructor@stmarys.com', hashedPassword: pwd, portalType: 'INSTRUCTOR' },
        ],
    })

    // 3 test teachers
    const teacher1 = await prisma.user.upsert({
        where: { institutionId_email: { institutionId: stmarys.id, email: 'teacher1@stmarys.com' } },
        update: {},
        create: { institutionId: stmarys.id, email: 'teacher1@stmarys.com', hashedPassword: teacherPwd, portalType: 'TEACHER' },
    })
    const teacher2 = await prisma.user.upsert({
        where: { institutionId_email: { institutionId: stmarys.id, email: 'teacher2@stmarys.com' } },
        update: {},
        create: { institutionId: stmarys.id, email: 'teacher2@stmarys.com', hashedPassword: teacherPwd, portalType: 'TEACHER' },
    })
    const teacher3 = await prisma.user.upsert({
        where: { institutionId_email: { institutionId: stmarys.id, email: 'teacher3@stmarys.com' } },
        update: {},
        create: { institutionId: stmarys.id, email: 'teacher3@stmarys.com', hashedPassword: teacherPwd, portalType: 'TEACHER' },
    })

    // Also keep the generic teacher login
    await prisma.user.upsert({
        where: { institutionId_email: { institutionId: stmarys.id, email: 'teacher@stmarys.com' } },
        update: {},
        create: { institutionId: stmarys.id, email: 'teacher@stmarys.com', hashedPassword: pwd, portalType: 'TEACHER' },
    })

    // Super Admin
    await prisma.user.upsert({
        where: { institutionId_email: { institutionId: stmarys.id, email: 'super@platform.com' } },
        update: {},
        create: { institutionId: stmarys.id, email: 'super@platform.com', hashedPassword: pwd, portalType: 'SUPER_ADMIN' },
    })

    // ── Platform roles ──
    const superAdminRole = await prisma.platformRole.upsert({
        where: { name: 'Super Admin' },
        update: {},
        create: {
            name: 'Super Admin', description: 'Full platform access',
            isSystemRole: true, masqueradeMode: 'FULL_ACCESS',
            permissions: [
                'platform.institutions.view', 'platform.institutions.manage',
                'platform.billing.view', 'platform.billing.manage',
                'platform.analytics.view', 'platform.tickets.view',
                'platform.tickets.resolve', 'platform.settings.manage',
                'platform.roles.manage', 'platform.masquerade', 'platform.users.manage',
            ],
        },
    })
    await prisma.platformRole.upsert({
        where: { name: 'Support Agent' }, update: {},
        create: { name: 'Support Agent', description: 'Can view institutions and resolve tickets', masqueradeMode: 'READ_ONLY', permissions: ['platform.institutions.view', 'platform.tickets.view', 'platform.tickets.resolve', 'platform.masquerade'] },
    })
    await prisma.platformRole.upsert({
        where: { name: 'Billing Manager' }, update: {},
        create: { name: 'Billing Manager', description: 'Manages billing and plans only', permissions: ['platform.institutions.view', 'platform.billing.view', 'platform.billing.manage', 'platform.analytics.view'] },
    })
    await prisma.platformRole.upsert({
        where: { name: 'Analyst' }, update: {},
        create: { name: 'Analyst', description: 'Read-only analytics access', permissions: ['platform.institutions.view', 'platform.analytics.view'] },
    })
    await prisma.platformUser.upsert({
        where: { email: 'super@platform.com' }, update: {},
        create: { email: 'super@platform.com', hashedPassword: pwd, platformRoleId: superAdminRole.id },
    })

    // ── Academic Year ──
    const ay = await prisma.academicYear.create({
        data: {
            institutionId: stmarys.id, name: '2024-25',
            startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'),
            isCurrent: true,
        },
    })

    // ── ClassTemplates ──
    const classTemplatesData = [
        { name: 'Class 6', gradeLevel: 6, sections: ['A', 'B'] },
        { name: 'Class 7', gradeLevel: 7, sections: ['A', 'B'] },
        { name: 'Class 8', gradeLevel: 8, sections: ['A', 'B', 'C'] },
    ]

    const classMap: Record<string, { classYearId: string; sections: Record<string, string> }> = {}

    for (const cd of classTemplatesData) {
        const template = await prisma.classTemplate.upsert({
            where: { institutionId_name: { institutionId: stmarys.id, name: cd.name } },
            update: {},
            create: { institutionId: stmarys.id, name: cd.name, gradeLevel: cd.gradeLevel },
        })

        const classYear = await prisma.classYear.upsert({
            where: { classTemplateId_academicYearId: { classTemplateId: template.id, academicYearId: ay.id } },
            update: {},
            create: { institutionId: stmarys.id, classTemplateId: template.id, academicYearId: ay.id },
        })

        const sectionMap: Record<string, string> = {}
        for (const sName of cd.sections) {
            const sec = await prisma.section.upsert({
                where: { classYearId_name: { classYearId: classYear.id, name: sName } },
                update: {},
                create: { institutionId: stmarys.id, classYearId: classYear.id, name: sName },
            })
            sectionMap[sName] = sec.id
        }
        classMap[cd.name] = { classYearId: classYear.id, sections: sectionMap }
    }

    // ── Admission Settings ──
    await prisma.admissionSettings.upsert({
        where: { institutionId: stmarys.id }, update: {},
        create: {
            institutionId: stmarys.id,
            admissionNoPrefix: 'STM', admissionNoCurrentSeq: 1011,
            rollNoCurrentSeq: 11, appNoPrefix: 'APP', appNoCurrentSeq: 11,
        },
    })

    // ── Students ──
    const studentsData = [
        { firstName: 'Arjun',  lastName: 'Sharma',   gender: 'MALE',   bloodGroup: 'B+',  dob: '2012-04-15', sisId: 'ONF-2024-00001', admissionNo: 'STM1001', rollNo: '1',  class: 'Class 8', section: 'A', guardian: 'Rajesh Sharma',   guardianPhone: '9876543001' },
        { firstName: 'Priya',  lastName: 'Nair',     gender: 'FEMALE', bloodGroup: 'O+',  dob: '2012-07-22', sisId: 'ONF-2024-00002', admissionNo: 'STM1002', rollNo: '2',  class: 'Class 8', section: 'A', guardian: 'Deepa Nair',      guardianPhone: '9876543002' },
        { firstName: 'Rahul',  lastName: 'Verma',    gender: 'MALE',   bloodGroup: 'A+',  dob: '2012-02-10', sisId: 'ONF-2024-00003', admissionNo: 'STM1003', rollNo: '3',  class: 'Class 8', section: 'B', guardian: 'Suresh Verma',    guardianPhone: '9876543003' },
        { firstName: 'Sneha',  lastName: 'Iyer',     gender: 'FEMALE', bloodGroup: 'AB+', dob: '2012-09-05', sisId: 'ONF-2024-00004', admissionNo: 'STM1004', rollNo: '4',  class: 'Class 8', section: 'B', guardian: 'Lakshmi Iyer',    guardianPhone: '9876543004' },
        { firstName: 'Kiran',  lastName: 'Reddy',    gender: 'MALE',   bloodGroup: 'B-',  dob: '2012-11-30', sisId: 'ONF-2024-00005', admissionNo: 'STM1005', rollNo: '5',  class: 'Class 7', section: 'A', guardian: 'Venkat Reddy',    guardianPhone: '9876543005' },
        { firstName: 'Anjali', lastName: 'Menon',    gender: 'FEMALE', bloodGroup: 'O-',  dob: '2013-03-18', sisId: 'ONF-2024-00006', admissionNo: 'STM1006', rollNo: '6',  class: 'Class 7', section: 'A', guardian: 'Pradeep Menon',   guardianPhone: '9876543006' },
        { firstName: 'Vikram', lastName: 'Singh',    gender: 'MALE',   bloodGroup: 'A-',  dob: '2013-06-25', sisId: 'ONF-2024-00007', admissionNo: 'STM1007', rollNo: '7',  class: 'Class 7', section: 'B', guardian: 'Harpreet Singh',  guardianPhone: '9876543007' },
        { firstName: 'Divya',  lastName: 'Krishnan', gender: 'FEMALE', bloodGroup: 'B+',  dob: '2013-08-14', sisId: 'ONF-2024-00008', admissionNo: 'STM1008', rollNo: '8',  class: 'Class 6', section: 'A', guardian: 'Ramesh Krishnan', guardianPhone: '9876543008' },
        { firstName: 'Aakash', lastName: 'Patel',    gender: 'MALE',   bloodGroup: 'O+',  dob: '2014-01-09', sisId: 'ONF-2024-00009', admissionNo: 'STM1009', rollNo: '9',  class: 'Class 6', section: 'A', guardian: 'Amit Patel',      guardianPhone: '9876543009' },
        { firstName: 'Meera',  lastName: 'Pillai',   gender: 'FEMALE', bloodGroup: 'AB-', dob: '2014-05-20', sisId: 'ONF-2024-00010', admissionNo: 'STM1010', rollNo: '10', class: 'Class 6', section: 'B', guardian: 'Sujata Pillai',   guardianPhone: '9876543010' },
        { firstName: 'Ravi',    lastName: 'Kumar',     gender: 'MALE',   bloodGroup: 'A+',  dob: '2012-01-12', sisId: 'ONF-2024-00011', admissionNo: 'STM1011', rollNo: '11', class: 'Class 8', section: 'C', guardian: 'Naresh Kumar',     guardianPhone: '9876543011' },
        { firstName: 'Sanya',   lastName: 'Gupta',     gender: 'FEMALE', bloodGroup: 'B+',  dob: '2012-03-28', sisId: 'ONF-2024-00012', admissionNo: 'STM1012', rollNo: '12', class: 'Class 8', section: 'C', guardian: 'Mohan Gupta',      guardianPhone: '9876543012' },
        { firstName: 'Deepak',  lastName: 'Rao',       gender: 'MALE',   bloodGroup: 'O-',  dob: '2012-06-14', sisId: 'ONF-2024-00013', admissionNo: 'STM1013', rollNo: '13', class: 'Class 8', section: 'A', guardian: 'Sudhir Rao',       guardianPhone: '9876543013' },
        { firstName: 'Nisha',   lastName: 'Joshi',     gender: 'FEMALE', bloodGroup: 'AB+', dob: '2012-08-02', sisId: 'ONF-2024-00014', admissionNo: 'STM1014', rollNo: '14', class: 'Class 8', section: 'B', guardian: 'Prakash Joshi',    guardianPhone: '9876543014' },
        { firstName: 'Rohan',   lastName: 'Das',       gender: 'MALE',   bloodGroup: 'A-',  dob: '2013-01-19', sisId: 'ONF-2024-00015', admissionNo: 'STM1015', rollNo: '15', class: 'Class 7', section: 'A', guardian: 'Tapan Das',        guardianPhone: '9876543015' },
        { firstName: 'Kavya',   lastName: 'Mahesh',    gender: 'FEMALE', bloodGroup: 'O+',  dob: '2013-04-07', sisId: 'ONF-2024-00016', admissionNo: 'STM1016', rollNo: '16', class: 'Class 7', section: 'B', guardian: 'Mahesh Babu',      guardianPhone: '9876543016' },
        { firstName: 'Arun',    lastName: 'Bhat',      gender: 'MALE',   bloodGroup: 'B-',  dob: '2013-07-23', sisId: 'ONF-2024-00017', admissionNo: 'STM1017', rollNo: '17', class: 'Class 7', section: 'A', guardian: 'Girish Bhat',      guardianPhone: '9876543017' },
        { firstName: 'Tanvi',   lastName: 'Kulkarni',  gender: 'FEMALE', bloodGroup: 'A+',  dob: '2013-10-11', sisId: 'ONF-2024-00018', admissionNo: 'STM1018', rollNo: '18', class: 'Class 7', section: 'B', guardian: 'Satish Kulkarni',  guardianPhone: '9876543018' },
        { firstName: 'Siddharth', lastName: 'Nambiar', gender: 'MALE',   bloodGroup: 'AB-', dob: '2014-02-28', sisId: 'ONF-2024-00019', admissionNo: 'STM1019', rollNo: '19', class: 'Class 6', section: 'A', guardian: 'Rajeev Nambiar',   guardianPhone: '9876543019' },
        { firstName: 'Pooja',   lastName: 'Hegde',     gender: 'FEMALE', bloodGroup: 'O+',  dob: '2014-04-16', sisId: 'ONF-2024-00020', admissionNo: 'STM1020', rollNo: '20', class: 'Class 6', section: 'B', guardian: 'Dinesh Hegde',     guardianPhone: '9876543020' },
        { firstName: 'Nikhil',  lastName: 'Rajan',     gender: 'MALE',   bloodGroup: 'B+',  dob: '2014-06-30', sisId: 'ONF-2024-00021', admissionNo: 'STM1021', rollNo: '21', class: 'Class 6', section: 'A', guardian: 'Sreekumar Rajan',  guardianPhone: '9876543021' },
        { firstName: 'Ishita',  lastName: 'Sen',       gender: 'FEMALE', bloodGroup: 'A-',  dob: '2012-12-05', sisId: 'ONF-2024-00022', admissionNo: 'STM1022', rollNo: '22', class: 'Class 8', section: 'A', guardian: 'Kamal Sen',        guardianPhone: '9876543022' },
        { firstName: 'Varun',   lastName: 'Tiwari',    gender: 'MALE',   bloodGroup: 'O-',  dob: '2013-02-14', sisId: 'ONF-2024-00023', admissionNo: 'STM1023', rollNo: '23', class: 'Class 7', section: 'B', guardian: 'Manish Tiwari',    guardianPhone: '9876543023' },
        { firstName: 'Lakshmi', lastName: 'Suresh',    gender: 'FEMALE', bloodGroup: 'AB+', dob: '2013-11-22', sisId: 'ONF-2024-00024', admissionNo: 'STM1024', rollNo: '24', class: 'Class 6', section: 'B', guardian: 'Suresh Naidu',     guardianPhone: '9876543024' },
        { firstName: 'Harsh',   lastName: 'Pandey',    gender: 'MALE',   bloodGroup: 'B-',  dob: '2014-08-08', sisId: 'ONF-2024-00025', admissionNo: 'STM1025', rollNo: '25', class: 'Class 6', section: 'A', guardian: 'Anil Pandey',      guardianPhone: '9876543025' },
    ]

    // Create students and enroll in sections
    for (const s of studentsData) {
        const cls = classMap[s.class]
        if (!cls) continue
        const sectionId = cls.sections[s.section]

        const student = await prisma.student.upsert({
            where: { sisId: s.sisId },
            update: {},
            create: {
                institutionId: stmarys.id,
                sisId: s.sisId, admissionNo: s.admissionNo, rollNo: s.rollNo,
                firstName: s.firstName, lastName: s.lastName,
                dateOfBirth: new Date(s.dob),
                gender: s.gender as 'MALE' | 'FEMALE' | 'OTHER',
                bloodGroup: s.bloodGroup,
                guardianName: s.guardian, guardianPhone: s.guardianPhone,
                status: 'ACTIVE', boardingType: 'DAY_SCHOLAR', transportMode: 'PARENT_DROP',
            },
        })

        // Enroll student in section via StudentSection
        await prisma.studentSection.upsert({
            where: { studentId_classYearId: { studentId: student.id, classYearId: cls.classYearId } },
            update: {},
            create: {
                institutionId: stmarys.id,
                studentId: student.id,
                sectionId: sectionId,
                classYearId: cls.classYearId,
            },
        })
    }

    // ── Inquiries ──
    const inquiries = [
        { name: 'Mohan Lal', phone: '9900100001', email: 'mohan@gmail.com', source: 'WALK_IN', notes: 'Visited campus, interested in Class 6' },
        { name: 'Fatima Khan', phone: '9900100002', email: 'fatima.k@gmail.com', source: 'PHONE', notes: 'Called about admission process for Class 7' },
        { name: 'George Thomas', phone: '9900100003', email: null, source: 'REFERRAL', notes: 'Referred by current parent Mr. Sharma' },
        { name: 'Sunita Devi', phone: '9900100004', email: 'sunita.d@yahoo.com', source: 'WEBSITE', notes: 'Filled website form, wants info on transport' },
        { name: 'Rakesh Jain', phone: '9900100005', email: null, source: 'WALK_IN', notes: 'Walk-in, interested in Class 8 transfer' },
    ]
    for (const inq of inquiries) {
        await prisma.inquiry.create({
            data: {
                institutionId: stmarys.id, name: inq.name, phone: inq.phone, email: inq.email,
                source: inq.source as 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'REFERRAL' | 'OTHER',
                notes: inq.notes, createdById: adminUser.id,
            },
        })
    }

    // ── Admissions (various statuses) ──
    const admissionsData: Array<{
        appNo: string; admNo: string | null; status: string
        firstName: string; lastName: string; gender: string; dob: string; bloodGroup: string
        class: string; section: string; admType: string; prevSchool: string | null
        guardian: string; guardianPhone: string; guardianType: string
        admittedAt: string | null; enrolledAt: string | null
        rejectedAt: string | null; rejectionReason: string | null
    }> = [
        { appNo: 'APP-001', admNo: 'STM1030', status: 'ENROLLED', firstName: 'Aarav', lastName: 'Chopra', gender: 'MALE', dob: '2012-05-10', bloodGroup: 'A+', class: 'Class 8', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Ravi Chopra', guardianPhone: '9988770001', guardianType: 'FATHER', admittedAt: '2024-03-15', enrolledAt: '2024-04-01', rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-002', admNo: 'STM1031', status: 'ENROLLED', firstName: 'Saanvi', lastName: 'Bose', gender: 'FEMALE', dob: '2013-08-22', bloodGroup: 'O+', class: 'Class 7', section: 'A', admType: 'TRANSFER', prevSchool: 'Delhi Public School', guardian: 'Partha Bose', guardianPhone: '9988770002', guardianType: 'FATHER', admittedAt: '2024-03-18', enrolledAt: '2024-04-01', rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-003', admNo: 'STM1032', status: 'ENROLLED', firstName: 'Reyansh', lastName: 'Malhotra', gender: 'MALE', dob: '2014-01-30', bloodGroup: 'B-', class: 'Class 6', section: 'B', admType: 'NEW', prevSchool: null, guardian: 'Sanjay Malhotra', guardianPhone: '9988770003', guardianType: 'FATHER', admittedAt: '2024-03-20', enrolledAt: '2024-04-02', rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-004', admNo: 'STM1033', status: 'ADMITTED', firstName: 'Anaya', lastName: 'Dutta', gender: 'FEMALE', dob: '2012-11-15', bloodGroup: 'AB+', class: 'Class 8', section: 'B', admType: 'TRANSFER', prevSchool: 'Kendriya Vidyalaya', guardian: 'Ajay Dutta', guardianPhone: '9988770004', guardianType: 'FATHER', admittedAt: '2024-06-10', enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-005', admNo: 'STM1034', status: 'ADMITTED', firstName: 'Kabir', lastName: 'Ahuja', gender: 'MALE', dob: '2013-04-08', bloodGroup: 'O-', class: 'Class 7', section: 'B', admType: 'NEW', prevSchool: null, guardian: 'Preeti Ahuja', guardianPhone: '9988770005', guardianType: 'MOTHER', admittedAt: '2024-06-12', enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-006', admNo: 'STM1035', status: 'ADMITTED', firstName: 'Myra', lastName: 'Saxena', gender: 'FEMALE', dob: '2014-07-19', bloodGroup: 'A-', class: 'Class 6', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Vikas Saxena', guardianPhone: '9988770006', guardianType: 'FATHER', admittedAt: '2024-06-15', enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-007', admNo: null, status: 'APPLIED', firstName: 'Vihaan', lastName: 'Kapoor', gender: 'MALE', dob: '2012-09-25', bloodGroup: 'B+', class: 'Class 8', section: 'C', admType: 'NEW', prevSchool: null, guardian: 'Rahul Kapoor', guardianPhone: '9988770007', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-008', admNo: null, status: 'APPLIED', firstName: 'Aisha', lastName: 'Fernandes', gender: 'FEMALE', dob: '2013-12-03', bloodGroup: 'O+', class: 'Class 7', section: 'A', admType: 'TRANSFER', prevSchool: 'Sacred Heart Convent', guardian: 'Michael Fernandes', guardianPhone: '9988770008', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-009', admNo: null, status: 'APPLIED', firstName: 'Dhruv', lastName: 'Banerjee', gender: 'MALE', dob: '2014-03-17', bloodGroup: 'AB-', class: 'Class 6', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Sourav Banerjee', guardianPhone: '9988770009', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-010', admNo: null, status: 'APPLIED', firstName: 'Kiara', lastName: 'Thakur', gender: 'FEMALE', dob: '2012-06-20', bloodGroup: 'A+', class: 'Class 8', section: 'A', admType: 'TRANSFER', prevSchool: 'Ryan International', guardian: 'Deepak Thakur', guardianPhone: '9988770010', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-011', admNo: null, status: 'APPLIED', firstName: 'Arnav', lastName: 'Chauhan', gender: 'MALE', dob: '2013-09-08', bloodGroup: 'B-', class: 'Class 7', section: 'B', admType: 'NEW', prevSchool: null, guardian: 'Rajendra Chauhan', guardianPhone: '9988770011', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-012', admNo: null, status: 'REJECTED', firstName: 'Zara', lastName: 'Sheikh', gender: 'FEMALE', dob: '2012-02-14', bloodGroup: 'O-', class: 'Class 8', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Irfan Sheikh', guardianPhone: '9988770012', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: '2024-04-20', rejectionReason: 'Class 8A at full capacity' },
        { appNo: 'APP-013', admNo: null, status: 'REJECTED', firstName: 'Vivek', lastName: 'Mishra', gender: 'MALE', dob: '2014-10-30', bloodGroup: 'A+', class: 'Class 6', section: 'B', admType: 'TRANSFER', prevSchool: 'Army Public School', guardian: 'Alok Mishra', guardianPhone: '9988770013', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: '2024-05-10', rejectionReason: 'Incomplete documents' },
        { appNo: 'APP-014', admNo: null, status: 'INQUIRY', firstName: 'Tara', lastName: 'Choudhary', gender: 'FEMALE', dob: '2013-05-25', bloodGroup: 'B+', class: 'Class 7', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Ramesh Choudhary', guardianPhone: '9988770014', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
        { appNo: 'APP-015', admNo: null, status: 'INQUIRY', firstName: 'Om', lastName: 'Agarwal', gender: 'MALE', dob: '2014-08-12', bloodGroup: 'O+', class: 'Class 6', section: 'A', admType: 'NEW', prevSchool: null, guardian: 'Vinod Agarwal', guardianPhone: '9988770015', guardianType: 'FATHER', admittedAt: null, enrolledAt: null, rejectedAt: null, rejectionReason: null },
    ]

    for (const a of admissionsData) {
        const cls = classMap[a.class]
        if (!cls) continue
        const admission = await prisma.admission.create({
            data: {
                institutionId: stmarys.id, applicationNo: a.appNo, admissionNo: a.admNo,
                status: a.status as 'INQUIRY' | 'APPLIED' | 'ADMITTED' | 'ENROLLED' | 'REJECTED',
                firstName: a.firstName, lastName: a.lastName,
                dateOfBirth: new Date(a.dob), gender: a.gender as 'MALE' | 'FEMALE' | 'OTHER',
                bloodGroup: a.bloodGroup, admissionType: a.admType as 'NEW' | 'TRANSFER',
                previousSchoolName: a.prevSchool,
                classId: cls.classYearId, sectionId: cls.sections[a.section],
                academicYearId: ay.id, createdById: adminUser.id,
                appliedAt: new Date('2024-03-01'),
                admittedAt: a.admittedAt ? new Date(a.admittedAt) : null,
                enrolledAt: a.enrolledAt ? new Date(a.enrolledAt) : null,
                rejectedAt: a.rejectedAt ? new Date(a.rejectedAt) : null,
                rejectionReason: a.rejectionReason,
            },
        })
        await prisma.guardian.create({
            data: {
                admissionId: admission.id,
                type: a.guardianType as 'FATHER' | 'MOTHER' | 'GUARDIAN',
                name: a.guardian, phone: a.guardianPhone,
                isPrimaryContact: true, isEmergencyContact: true,
            },
        })
    }

    // ── ExamTypes ──
    const examTypesData = [
        { name: 'Unit Test 1', shortName: 'UT1', weightage: 10, order: 1 },
        { name: 'Unit Test 2', shortName: 'UT2', weightage: 10, order: 2 },
        { name: 'Half Yearly', shortName: 'HY', weightage: 30, order: 3 },
        { name: 'Annual', shortName: 'ANN', weightage: 50, order: 4 },
    ]
    for (const et of examTypesData) {
        await prisma.examType.upsert({
            where: { institutionId_name: { institutionId: stmarys.id, name: et.name } },
            update: {},
            create: {
                institutionId: stmarys.id, name: et.name, shortName: et.shortName,
                weightage: et.weightage, order: et.order, countInFinalGrade: true,
            },
        })
    }

    // ── Subjects for Class 8 (all sections via sectionId=null) ──
    const class8 = classMap['Class 8']
    const subjectsData = [
        { name: 'Mathematics', code: 'MATH8', weeklyPeriods: 6, teacherId: teacher1.id },
        { name: 'Science', code: 'SCI8', weeklyPeriods: 5, teacherId: teacher2.id },
        { name: 'English', code: 'ENG8', weeklyPeriods: 5, teacherId: teacher3.id },
        { name: 'Hindi', code: 'HIN8', weeklyPeriods: 4, teacherId: teacher1.id },
        { name: 'Social Studies', code: 'SST8', weeklyPeriods: 4, teacherId: teacher2.id },
    ]

    for (const sub of subjectsData) {
        const subject = await prisma.subject.upsert({
            where: { classYearId_sectionId_name: { classYearId: class8.classYearId, sectionId: '', name: sub.name } },
            update: {},
            create: {
                institutionId: stmarys.id, classYearId: class8.classYearId,
                name: sub.name, code: sub.code, weeklyPeriods: sub.weeklyPeriods,
                hasOnlineContent: true,
            },
        })
        await prisma.subjectTeacher.upsert({
            where: { subjectId_teacherId: { subjectId: subject.id, teacherId: sub.teacherId } },
            update: {},
            create: { subjectId: subject.id, teacherId: sub.teacherId, isPrimary: true },
        })
    }

    // ── AttendanceSettings ──
    await prisma.attendanceSettings.upsert({
        where: { institutionId: stmarys.id }, update: {},
        create: { institutionId: stmarys.id, mode: 'BOTH' },
    })

    // ── Standalone Course ──
    const spokenEnglish = await prisma.course.create({
        data: {
            institutionId: stmarys.id,
            title: 'Spoken English — Beginner',
            description: 'Build confidence in everyday English conversation.',
            instructorId: teacher1.id,
            targetType: 'ALL',
            status: 'ACTIVE',
        },
    })

    const coursePostsData = [
        { title: 'Introduction to Greetings', type: 'MATERIAL', order: 1 },
        { title: 'Self-Introduction Practice', type: 'MATERIAL', order: 2 },
        { title: 'Ordering Food in English', type: 'MATERIAL', order: 3 },
    ]
    for (const cp of coursePostsData) {
        await prisma.coursePost.create({
            data: {
                courseId: spokenEnglish.id,
                title: cp.title,
                type: cp.type as 'MATERIAL',
                order: cp.order,
                isPublished: true,
                createdById: teacher1.id,
            },
        })
    }

    // Find Arjun and Priya to enroll
    const arjun = await prisma.student.findFirst({
        where: { institutionId: stmarys.id, firstName: 'Arjun', lastName: 'Sharma' },
    })
    const priya = await prisma.student.findFirst({
        where: { institutionId: stmarys.id, firstName: 'Priya', lastName: 'Nair' },
    })
    if (arjun) {
        await prisma.courseEnrollment.create({
            data: { courseId: spokenEnglish.id, studentId: arjun.id },
        })
    }
    if (priya) {
        await prisma.courseEnrollment.create({
            data: { courseId: spokenEnglish.id, studentId: priya.id },
        })
    }

    // ── Staff Settings ──
    await prisma.staffSettings.upsert({
        where: { institutionId: stmarys.id },
        update: {},
        create: {
            institutionId: stmarys.id,
            employeeNoPrefix: 'EMP',
            employeeNoCurrentSeq: 1054,
            documentTypes: JSON.stringify([
                'Appointment Letter', 'Qualification Certificate', 'ID Proof',
                'PAN Card', 'Bank Details', 'Previous Experience Letter',
            ]),
        },
    })

    // ── Staff Salary Config ──
    await prisma.staffSalaryConfig.upsert({
        where: { institutionId: stmarys.id },
        update: {},
        create: {
            institutionId: stmarys.id,
            allowanceTypes: JSON.stringify([
                { name: 'HRA', isPercentage: true, value: 20 },
                { name: 'Transport Allowance', isPercentage: false },
                { name: 'Medical Allowance', isPercentage: false },
            ]),
            deductionTypes: JSON.stringify([
                { name: 'PF', isPercentage: true, value: 12 },
                { name: 'Professional Tax', isPercentage: false, value: 200 },
            ]),
        },
    })

    // ── Staff Leave Types ──
    const leaveTypes = [
        { name: 'Casual Leave', shortName: 'CL', maxDaysPerYear: 12, carryForward: false, isPaid: true },
        { name: 'Sick Leave', shortName: 'SL', maxDaysPerYear: 10, carryForward: false, isPaid: true },
        { name: 'Earned Leave', shortName: 'EL', maxDaysPerYear: 15, carryForward: true, isPaid: true },
        { name: 'Maternity Leave', shortName: 'ML', maxDaysPerYear: 180, carryForward: false, isPaid: true },
        { name: 'Loss of Pay', shortName: 'LOP', maxDaysPerYear: 365, carryForward: false, isPaid: false },
    ]
    for (const lt of leaveTypes) {
        await prisma.staffLeaveType.upsert({
            where: { institutionId_name: { institutionId: stmarys.id, name: lt.name } },
            update: {},
            create: { institutionId: stmarys.id, ...lt },
        })
    }

    // ── Staff Roles with Permissions ──
    const FEATURES = [
        'classes', 'timetable', 'subjects', 'syllabus',
        'student_profiles', 'attendance', 'grades',
        'assignments', 'quizzes', 'behaviour', 'counsellor_notes',
        'admissions', 'enrollment', 'announcements',
        'parent_messages', 'notifications', 'fees',
        'staff_profiles', 'leave', 'payroll', 'courses',
        'vibe', 'documents', 'reports', 'roles',
        'settings', 'audit_log', 'brand_theme',
    ]

    const staffRolesData = [
        {
            name: 'Principal',
            description: 'Highest authority. Full access to everything.',
            isSystemRole: true,
            permissions: FEATURES.map(f => ({ feature: f, access: 'FULL', scope: 'INSTITUTION' })),
        },
        {
            name: 'Vice Principal',
            description: 'Second in command. Full ops access except payroll and settings.',
            isSystemRole: true,
            permissions: [
                { feature: 'classes', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'timetable', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'subjects', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'syllabus', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'student_profiles', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'attendance', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'grades', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'assignments', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'quizzes', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'behaviour', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'counsellor_notes', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'admissions', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'enrollment', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'announcements', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'parent_messages', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'notifications', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'fees', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'staff_profiles', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'leave', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'payroll', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'courses', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'vibe', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'documents', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'reports', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'roles', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'settings', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'audit_log', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'brand_theme', access: 'VIEW', scope: 'INSTITUTION' },
            ],
        },
        {
            name: 'Head of Department',
            description: 'Manages a department. Approves dept leave. Views dept performance.',
            isSystemRole: true,
            permissions: [
                { feature: 'classes', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'timetable', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'subjects', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'syllabus', access: 'FULL', scope: 'DEPARTMENT' },
                { feature: 'student_profiles', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'attendance', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'grades', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'assignments', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'quizzes', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'behaviour', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'counsellor_notes', access: 'NONE', scope: 'OWN' },
                { feature: 'admissions', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'enrollment', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'announcements', access: 'EDIT', scope: 'DEPARTMENT' },
                { feature: 'parent_messages', access: 'EDIT', scope: 'DEPARTMENT' },
                { feature: 'notifications', access: 'EDIT', scope: 'DEPARTMENT' },
                { feature: 'fees', access: 'NONE', scope: 'OWN' },
                { feature: 'staff_profiles', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'leave', access: 'EDIT', scope: 'DEPARTMENT' },
                { feature: 'payroll', access: 'NONE', scope: 'OWN' },
                { feature: 'courses', access: 'FULL', scope: 'OWN' },
                { feature: 'vibe', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'documents', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'reports', access: 'VIEW', scope: 'DEPARTMENT' },
                { feature: 'roles', access: 'NONE', scope: 'OWN' },
                { feature: 'settings', access: 'NONE', scope: 'OWN' },
                { feature: 'audit_log', access: 'NONE', scope: 'OWN' },
                { feature: 'brand_theme', access: 'NONE', scope: 'OWN' },
            ],
        },
        {
            name: 'Class Teacher',
            description: 'Responsible for one class section. Primary contact for students and parents.',
            isSystemRole: true,
            permissions: [
                { feature: 'classes', access: 'VIEW', scope: 'OWN' },
                { feature: 'timetable', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'subjects', access: 'VIEW', scope: 'OWN' },
                { feature: 'syllabus', access: 'EDIT', scope: 'OWN' },
                { feature: 'student_profiles', access: 'VIEW', scope: 'OWN' },
                { feature: 'attendance', access: 'EDIT', scope: 'OWN' },
                { feature: 'grades', access: 'EDIT', scope: 'OWN' },
                { feature: 'assignments', access: 'FULL', scope: 'OWN' },
                { feature: 'quizzes', access: 'FULL', scope: 'OWN' },
                { feature: 'behaviour', access: 'EDIT', scope: 'OWN' },
                { feature: 'counsellor_notes', access: 'NONE', scope: 'OWN' },
                { feature: 'admissions', access: 'NONE', scope: 'OWN' },
                { feature: 'enrollment', access: 'NONE', scope: 'OWN' },
                { feature: 'announcements', access: 'EDIT', scope: 'OWN' },
                { feature: 'parent_messages', access: 'EDIT', scope: 'OWN' },
                { feature: 'notifications', access: 'VIEW', scope: 'OWN' },
                { feature: 'fees', access: 'NONE', scope: 'OWN' },
                { feature: 'staff_profiles', access: 'NONE', scope: 'OWN' },
                { feature: 'leave', access: 'VIEW', scope: 'OWN' },
                { feature: 'payroll', access: 'NONE', scope: 'OWN' },
                { feature: 'courses', access: 'FULL', scope: 'OWN' },
                { feature: 'vibe', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'documents', access: 'VIEW', scope: 'OWN' },
                { feature: 'reports', access: 'VIEW', scope: 'OWN' },
                { feature: 'roles', access: 'NONE', scope: 'OWN' },
                { feature: 'settings', access: 'NONE', scope: 'OWN' },
                { feature: 'audit_log', access: 'NONE', scope: 'OWN' },
                { feature: 'brand_theme', access: 'NONE', scope: 'OWN' },
            ],
        },
        {
            name: 'Subject Teacher',
            description: 'Teaches specific subjects. Focuses on content delivery and assessment.',
            isSystemRole: true,
            permissions: [
                { feature: 'classes', access: 'VIEW', scope: 'OWN' },
                { feature: 'timetable', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'subjects', access: 'VIEW', scope: 'OWN' },
                { feature: 'syllabus', access: 'EDIT', scope: 'OWN' },
                { feature: 'student_profiles', access: 'VIEW', scope: 'OWN' },
                { feature: 'attendance', access: 'EDIT', scope: 'OWN' },
                { feature: 'grades', access: 'EDIT', scope: 'OWN' },
                { feature: 'assignments', access: 'FULL', scope: 'OWN' },
                { feature: 'quizzes', access: 'FULL', scope: 'OWN' },
                { feature: 'behaviour', access: 'VIEW', scope: 'OWN' },
                { feature: 'counsellor_notes', access: 'NONE', scope: 'OWN' },
                { feature: 'admissions', access: 'NONE', scope: 'OWN' },
                { feature: 'enrollment', access: 'NONE', scope: 'OWN' },
                { feature: 'announcements', access: 'VIEW', scope: 'OWN' },
                { feature: 'parent_messages', access: 'NONE', scope: 'OWN' },
                { feature: 'notifications', access: 'VIEW', scope: 'OWN' },
                { feature: 'fees', access: 'NONE', scope: 'OWN' },
                { feature: 'staff_profiles', access: 'NONE', scope: 'OWN' },
                { feature: 'leave', access: 'VIEW', scope: 'OWN' },
                { feature: 'payroll', access: 'NONE', scope: 'OWN' },
                { feature: 'courses', access: 'FULL', scope: 'OWN' },
                { feature: 'vibe', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'documents', access: 'NONE', scope: 'OWN' },
                { feature: 'reports', access: 'VIEW', scope: 'OWN' },
                { feature: 'roles', access: 'NONE', scope: 'OWN' },
                { feature: 'settings', access: 'NONE', scope: 'OWN' },
                { feature: 'audit_log', access: 'NONE', scope: 'OWN' },
                { feature: 'brand_theme', access: 'NONE', scope: 'OWN' },
            ],
        },
        {
            name: 'Admin Staff',
            description: 'Office administration. Manages admissions, fees, records and timetable.',
            isSystemRole: true,
            permissions: [
                { feature: 'classes', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'timetable', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'subjects', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'syllabus', access: 'NONE', scope: 'OWN' },
                { feature: 'student_profiles', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'attendance', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'grades', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'assignments', access: 'NONE', scope: 'OWN' },
                { feature: 'quizzes', access: 'NONE', scope: 'OWN' },
                { feature: 'behaviour', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'counsellor_notes', access: 'NONE', scope: 'OWN' },
                { feature: 'admissions', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'enrollment', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'announcements', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'parent_messages', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'notifications', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'fees', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'staff_profiles', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'leave', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'payroll', access: 'NONE', scope: 'OWN' },
                { feature: 'courses', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'vibe', access: 'EDIT', scope: 'INSTITUTION' },
                { feature: 'documents', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'reports', access: 'FULL', scope: 'INSTITUTION' },
                { feature: 'roles', access: 'NONE', scope: 'OWN' },
                { feature: 'settings', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'audit_log', access: 'VIEW', scope: 'INSTITUTION' },
                { feature: 'brand_theme', access: 'NONE', scope: 'OWN' },
            ],
        },
        {
            name: 'School Administrator',
            description: 'Full access to everything. Assignable to multiple admins.',
            isSystemRole: true,
            permissions: FEATURES.map(f => ({ feature: f, access: 'FULL', scope: 'INSTITUTION' })),
        },
    ]

    for (const role of staffRolesData) {
        await prisma.staffRole.upsert({
            where: { institutionId_name: { institutionId: stmarys.id, name: role.name } },
            update: { permissions: role.permissions },
            create: {
                institutionId: stmarys.id,
                name: role.name,
                description: role.description,
                isSystemRole: role.isSystemRole,
                permissions: role.permissions,
            },
        })
    }

    // ── Departments ──
    const departmentsData = [
        { name: 'Science Department', color: '#10b981', description: 'Manages Physics, Chemistry, Biology', subjectNames: ['Physics', 'Chemistry', 'Biology'] },
        { name: 'Mathematics Department', color: '#3b82f6', description: 'Manages Maths and Statistics', subjectNames: ['Mathematics', 'Statistics'] },
        { name: 'Languages Department', color: '#f59e0b', description: 'Manages English, Hindi, Tamil', subjectNames: ['English', 'Hindi'] },
        { name: 'Social Studies Department', color: '#8b5cf6', description: 'Manages History, Geography, Civics', subjectNames: ['History', 'Geography', 'Civics'] },
        { name: 'Arts & Sports Department', color: '#ec4899', description: 'Manages PE, Arts, Music', subjectNames: ['Physical Education', 'Arts', 'Music'] },
        { name: 'Administration', color: '#64748b', description: 'School administration and operations', subjectNames: [] },
    ]
    for (const dept of departmentsData) {
        await prisma.department.upsert({
            where: { institutionId_name: { institutionId: stmarys.id, name: dept.name } },
            update: { color: dept.color, description: dept.description, subjectNames: dept.subjectNames },
            create: { institutionId: stmarys.id, name: dept.name, color: dept.color, description: dept.description, subjectNames: dept.subjectNames },
        })
    }

    // ── Convert teachers to Staff records ──
    const scienceDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Science Department' } },
    })
    const mathsDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Mathematics Department' } },
    })
    const langsDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Languages Department' } },
    })
    const classTeacherRole = await prisma.staffRole.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Class Teacher' } },
    })
    const subjectTeacherRole = await prisma.staffRole.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Subject Teacher' } },
    })

    const staff1 = await prisma.staff.upsert({
        where: { institutionId_employeeNo: { institutionId: stmarys.id, employeeNo: 'EMP1001' } },
        update: {},
        create: {
            institutionId: stmarys.id, userId: teacher1.id,
            employeeNo: 'EMP1001', firstName: 'Priya', lastName: 'Nair',
            designation: 'Senior Science Teacher', joiningDate: new Date('2023-06-01'),
            status: 'ACTIVE', departmentId: scienceDept?.id, primaryRoleId: classTeacherRole?.id,
        },
    })

    await prisma.staff.upsert({
        where: { institutionId_employeeNo: { institutionId: stmarys.id, employeeNo: 'EMP1002' } },
        update: {},
        create: {
            institutionId: stmarys.id, userId: teacher2.id,
            employeeNo: 'EMP1002', firstName: 'Raj', lastName: 'Kumar',
            designation: 'Mathematics Teacher', joiningDate: new Date('2023-06-01'),
            status: 'ACTIVE', departmentId: mathsDept?.id, primaryRoleId: subjectTeacherRole?.id,
        },
    })

    await prisma.staff.upsert({
        where: { institutionId_employeeNo: { institutionId: stmarys.id, employeeNo: 'EMP1003' } },
        update: {},
        create: {
            institutionId: stmarys.id, userId: teacher3.id,
            employeeNo: 'EMP1003', firstName: 'Sunita', lastName: 'Devi',
            designation: 'Languages Teacher', joiningDate: new Date('2023-06-01'),
            status: 'ACTIVE', departmentId: langsDept?.id, primaryRoleId: subjectTeacherRole?.id,
        },
    })

    // Set HOD for Science department
    if (scienceDept && staff1) {
        await prisma.department.update({
            where: { id: scienceDept.id },
            data: { hodId: staff1.id },
        })
    }

    // ── Bulk Staff (50 additional) for table testing ──
    const socialDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Social Studies Department' } },
    })
    const artsDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Arts & Sports Department' } },
    })
    const adminDept = await prisma.department.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Administration' } },
    })
    const adminStaffRole = await prisma.staffRole.findUnique({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Admin Staff' } },
    })

    const bulkStaffData: { firstName: string; lastName: string; designation: string; deptId: string | null; roleId: string | null; status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' }[] = [
        { firstName: 'Ananya', lastName: 'Sharma', designation: 'Physics Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Vikram', lastName: 'Singh', designation: 'Chemistry Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Meera', lastName: 'Patel', designation: 'Biology Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Rohan', lastName: 'Gupta', designation: 'Maths Teacher', deptId: mathsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Kavita', lastName: 'Menon', designation: 'Statistics Teacher', deptId: mathsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Arun', lastName: 'Pillai', designation: 'English Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Deepa', lastName: 'Iyer', designation: 'Hindi Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Suresh', lastName: 'Reddy', designation: 'History Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Lakshmi', lastName: 'Naidu', designation: 'Geography Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Ramesh', lastName: 'Verma', designation: 'Civics Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Pooja', lastName: 'Desai', designation: 'PE Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Kiran', lastName: 'Joshi', designation: 'Music Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Sanjay', lastName: 'Mishra', designation: 'Art Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Neha', lastName: 'Agarwal', designation: 'Office Manager', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Amit', lastName: 'Tiwari', designation: 'Accounts Officer', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Ritu', lastName: 'Saxena', designation: 'Receptionist', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Manish', lastName: 'Bhatt', designation: 'Lab Assistant', deptId: scienceDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Geeta', lastName: 'Chauhan', designation: 'Library Head', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Rajesh', lastName: 'Pandey', designation: 'Sports Coach', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Savita', lastName: 'Kulkarni', designation: 'Dance Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ON_LEAVE' },
        { firstName: 'Dinesh', lastName: 'Yadav', designation: 'IT Coordinator', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Smita', lastName: 'Jain', designation: 'Counsellor', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Vivek', lastName: 'Srivastava', designation: 'Physics Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Asha', lastName: 'Mohan', designation: 'Chemistry Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'INACTIVE' },
        { firstName: 'Prakash', lastName: 'Nair', designation: 'Maths Teacher', deptId: mathsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Usha', lastName: 'Rao', designation: 'English Teacher', deptId: langsDept?.id ?? null, roleId: classTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Hemant', lastName: 'Dubey', designation: 'Hindi Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Nandini', lastName: 'Bose', designation: 'History Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ON_LEAVE' },
        { firstName: 'Manoj', lastName: 'Kapoor', designation: 'Geography Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Rekha', lastName: 'Malhotra', designation: 'Biology Teacher', deptId: scienceDept?.id ?? null, roleId: classTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Gaurav', lastName: 'Mehta', designation: 'Maths Teacher', deptId: mathsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Swati', lastName: 'Chopra', designation: 'English Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Pankaj', lastName: 'Rastogi', designation: 'Computer Teacher', deptId: adminDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Jaya', lastName: 'Krishnan', designation: 'Librarian', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Tarun', lastName: 'Sethi', designation: 'Physics Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Pallavi', lastName: 'Goswami', designation: 'Chemistry Teacher', deptId: scienceDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Ajay', lastName: 'Thakur', designation: 'PE Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Bhavna', lastName: 'Dixit', designation: 'Music Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'INACTIVE' },
        { firstName: 'Nitin', lastName: 'Awasthi', designation: 'Science Lab Tech', deptId: scienceDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Shweta', lastName: 'Bansal', designation: 'Nurse', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Rahul', lastName: 'Trivedi', designation: 'Security Head', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Priti', lastName: 'Choudhary', designation: 'Accounts Clerk', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Vijay', lastName: 'Rathore', designation: 'Transport Incharge', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Manju', lastName: 'Sinha', designation: 'Maths Teacher', deptId: mathsDept?.id ?? null, roleId: classTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Alok', lastName: 'Saxena', designation: 'Hindi Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ON_LEAVE' },
        { firstName: 'Divya', lastName: 'Hegde', designation: 'Civics Teacher', deptId: socialDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Siddharth', lastName: 'Patil', designation: 'Art Teacher', deptId: artsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Anjali', lastName: 'Mukherjee', designation: 'Exam Controller', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Harish', lastName: 'Garg', designation: 'Store Keeper', deptId: adminDept?.id ?? null, roleId: adminStaffRole?.id ?? null, status: 'ACTIVE' },
        { firstName: 'Padma', lastName: 'Venkatesh', designation: 'Sanskrit Teacher', deptId: langsDept?.id ?? null, roleId: subjectTeacherRole?.id ?? null, status: 'ACTIVE' },
    ]

    const joiningDates = [
        '2020-04-01', '2021-06-15', '2022-01-10', '2022-07-01', '2023-03-20',
        '2023-06-01', '2023-09-01', '2024-01-05', '2024-04-15', '2024-06-01',
    ]

    for (let i = 0; i < bulkStaffData.length; i++) {
        const s = bulkStaffData[i]
        const empNo = `EMP${1004 + i}`
        await prisma.staff.upsert({
            where: { institutionId_employeeNo: { institutionId: stmarys.id, employeeNo: empNo } },
            update: {},
            create: {
                institutionId: stmarys.id,
                employeeNo: empNo,
                firstName: s.firstName,
                lastName: s.lastName,
                designation: s.designation,
                joiningDate: new Date(joiningDates[i % joiningDates.length]),
                status: s.status,
                departmentId: s.deptId,
                primaryRoleId: s.roleId,
                phone: `98${String(10000000 + i).slice(0, 8)}`,
                personalEmail: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@gmail.com`,
            },
        })
    }

    // eslint-disable-next-line no-console -- seed script output
    console.log('✅ Seeded: 3 class templates, 3 class years, 7 sections, 25 students enrolled')
    // eslint-disable-next-line no-console -- seed script output
    console.log('✅ 5 inquiries, 15 admissions, 4 exam types, 5 subjects, 3 teachers')
    // eslint-disable-next-line no-console -- seed script output
    console.log('✅ 1 course (Spoken English), 3 posts, 2 enrollments (Arjun + Priya)')
    // eslint-disable-next-line no-console -- seed script output
    console.log('✅ Staff: 6 roles, 6 departments, 5 leave types, 53 staff records (3 + 50 bulk)')

    // ── Fee Module ──
    await prisma.feeSettings.upsert({
        where: { institutionId: stmarys.id },
        update: {},
        create: {
            institutionId: stmarys.id,
            receiptPrefix: 'RCP',
            receiptCurrentSeq: 1003,
            lateFineEnabled: false,
            partialPaymentAllowed: true,
        },
    })

    const tuitionFee = await prisma.feeCategory.upsert({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Tuition Fee' } },
        update: {},
        create: {
            institutionId: stmarys.id, name: 'Tuition Fee',
            description: 'Monthly tuition fee', amount: 2500,
            frequency: 'MONTHLY', applicableTo: 'ALL', order: 1,
        },
    })

    await prisma.feeCategory.upsert({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Transport Fee' } },
        update: {},
        create: {
            institutionId: stmarys.id, name: 'Transport Fee',
            description: 'Monthly transport fee for bus students', amount: 800,
            frequency: 'MONTHLY', applicableTo: 'ALL', isOptional: true, order: 2,
        },
    })

    const annualFee = await prisma.feeCategory.upsert({
        where: { institutionId_name: { institutionId: stmarys.id, name: 'Annual Fee' } },
        update: {},
        create: {
            institutionId: stmarys.id, name: 'Annual Fee',
            description: 'Yearly maintenance and development fee', amount: 5000,
            frequency: 'ANNUAL', applicableTo: 'ALL', order: 3,
        },
    })

    const feeStudents = await prisma.student.findMany({
        where: { institutionId: stmarys.id, status: 'ACTIVE' },
        select: { id: true, firstName: true },
        take: 10,
    })
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const dueDate = new Date(currentYear, new Date().getMonth(), 10)

    for (const s of feeStudents) {
        await prisma.feePayment.create({
            data: {
                institutionId: stmarys.id, studentId: s.id,
                feeCategoryId: tuitionFee.id, amount: 2500,
                fineAmount: 0, totalAmount: 2500, status: 'PENDING',
                dueDate, month: currentMonth, year: currentYear,
            },
        })
        await prisma.feePayment.create({
            data: {
                institutionId: stmarys.id, studentId: s.id,
                feeCategoryId: annualFee.id, amount: 5000,
                fineAmount: 0, totalAmount: 5000, status: 'PENDING',
                dueDate: new Date(currentYear, 3, 10), month: 0, year: currentYear,
            },
        })
    }

    // Mark Arjun + Priya tuition as paid
    const arjunFee = feeStudents.find(s => s.firstName === 'Arjun')
    const priyaFee = feeStudents.find(s => s.firstName === 'Priya')
    if (arjunFee) {
        await prisma.feePayment.updateMany({
            where: { studentId: arjunFee.id, feeCategoryId: tuitionFee.id, month: currentMonth, year: currentYear },
            data: { status: 'PAID', method: 'UPI', receiptNo: `RCP-${currentYear}-1001`, paidAt: new Date(), collectedById: adminUser.id },
        })
    }
    if (priyaFee) {
        await prisma.feePayment.updateMany({
            where: { studentId: priyaFee.id, feeCategoryId: tuitionFee.id, month: currentMonth, year: currentYear },
            data: { status: 'PAID', method: 'UPI', receiptNo: `RCP-${currentYear}-1002`, paidAt: new Date(), collectedById: adminUser.id },
        })
    }

    // eslint-disable-next-line no-console -- seed script output
    console.log('✅ Fees: 3 categories, 10 pending tuition + 10 pending annual, 2 paid (Arjun + Priya)')
    // eslint-disable-next-line no-console -- seed script output
    console.log('Password for all: Demo@1234 | Teachers: TempPass@123')
    // ── Notifications seed ──
    const studentUser = await prisma.user.findFirst({
        where: { institutionId: stmarys.id, email: 'student@stmarys.com' },
    })

    if (adminUser && studentUser) {
        await prisma.notification.createMany({
            data: [
                {
                    institutionId: stmarys.id,
                    userId: adminUser.id,
                    type: 'GENERAL',
                    title: 'Welcome to Onflows',
                    body: 'Your school is all set up. Start by adding classes and staff.',
                    status: 'SENT',
                    channel: 'PUSH',
                    priority: 'NORMAL',
                    sentAt: new Date(),
                },
                {
                    institutionId: stmarys.id,
                    userId: adminUser.id,
                    type: 'FEE_OVERDUE',
                    title: '3 students have overdue fees',
                    body: 'Students in Class 8A have overdue fee payments.',
                    status: 'SENT',
                    channel: 'PUSH',
                    priority: 'HIGH',
                    sentAt: new Date(),
                },
                {
                    institutionId: stmarys.id,
                    userId: studentUser.id,
                    type: 'ASSIGNMENT_DUE',
                    title: 'Assignment due tomorrow',
                    body: 'Mathematics assignment due Mar 28. Open app to submit.',
                    status: 'SENT',
                    channel: 'PUSH',
                    priority: 'NORMAL',
                    sentAt: new Date(),
                },
                {
                    institutionId: stmarys.id,
                    userId: studentUser.id,
                    type: 'GRADE_PUBLISHED',
                    title: 'Grades published',
                    body: 'Your Unit Test 1 grades are now available.',
                    status: 'READ',
                    readAt: new Date(),
                    channel: 'PUSH',
                    priority: 'NORMAL',
                    sentAt: new Date(),
                },
            ],
        })

        await prisma.notificationTemplate.createMany({
            data: [
                {
                    institutionId: stmarys.id,
                    type: 'ATTENDANCE_ABSENT',
                    name: 'Absence Alert',
                    titleTemplate: '{studentName} marked absent',
                    bodyTemplate: '{studentName} was absent on {date}. Please ensure regular attendance.',
                    channel: 'PUSH',
                },
                {
                    institutionId: stmarys.id,
                    type: 'FEE_DUE',
                    name: 'Fee Reminder',
                    titleTemplate: 'Fee due: {categoryName}',
                    bodyTemplate: '₹{amount} is due on {dueDate}. Please pay to avoid late fees.',
                    channel: 'PUSH',
                },
                {
                    institutionId: stmarys.id,
                    type: 'GRADE_PUBLISHED',
                    name: 'Grade Published',
                    titleTemplate: 'Grades available: {examType}',
                    bodyTemplate: '{studentName} scored {marks}/{total} in {subjectName}.',
                    channel: 'PUSH',
                },
            ],
        })
    }

    // eslint-disable-next-line no-console -- seed script output
    console.log('Super admin: super@platform.com / Demo@1234')
}

main()
    .catch((error: unknown) => {
        // eslint-disable-next-line no-console -- seed script error
        console.error(error)
        process.exit(1)
    })
    .finally(() => {
        void prisma.$disconnect()
    })
