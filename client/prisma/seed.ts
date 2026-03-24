import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const HASH_ROUNDS = 12

async function main(): Promise<void> {
    await prisma.user.deleteMany()
    await prisma.institution.deleteMany()

    const pwd = await bcrypt.hash('Demo@1234', HASH_ROUNDS)

    const stmarys = await prisma.institution.create({
        data: {
            name: "St. Mary's Convent School",
            subdomain: 'stmarys',
            board: 'CBSE',
            planTier: 'GROWTH',
        },
    })

    await prisma.user.createMany({
        data: [
            {
                institutionId: stmarys.id, email: 'admin@stmarys.com',
                hashedPassword: pwd, portalType: 'ADMIN'
            },
            {
                institutionId: stmarys.id, email: 'teacher@stmarys.com',
                hashedPassword: pwd, portalType: 'TEACHER'
            },
            {
                institutionId: stmarys.id, email: 'student@stmarys.com',
                hashedPassword: pwd, portalType: 'STUDENT'
            },
            {
                institutionId: stmarys.id, email: 'parent@stmarys.com',
                hashedPassword: pwd, portalType: 'PARENT'
            },
            {
                institutionId: stmarys.id, email: 'instructor@stmarys.com',
                hashedPassword: pwd, portalType: 'INSTRUCTOR'
            },
        ],
    })

    // Super Admin (linked to stmarys for DB constraint, has platform-wide access via portalType)
    await prisma.user.upsert({
        where: {
            institutionId_email: {
                institutionId: stmarys.id,
                email: 'super@platform.com',
            },
        },
        update: {},
        create: {
            institutionId: stmarys.id,
            email: 'super@platform.com',
            hashedPassword: pwd,
            portalType: 'SUPER_ADMIN',
        },
    })

    // Platform roles
    const superAdminRole = await prisma.platformRole.upsert({
        where: { name: 'Super Admin' },
        update: {},
        create: {
            name: 'Super Admin',
            description: 'Full platform access',
            isSystemRole: true,
            masqueradeMode: 'FULL_ACCESS',
            permissions: [
                'platform.institutions.view', 'platform.institutions.manage',
                'platform.billing.view', 'platform.billing.manage',
                'platform.analytics.view', 'platform.tickets.view',
                'platform.tickets.resolve', 'platform.settings.manage',
                'platform.roles.manage', 'platform.masquerade',
                'platform.users.manage',
            ],
        },
    })

    await prisma.platformRole.upsert({
        where: { name: 'Support Agent' },
        update: {},
        create: {
            name: 'Support Agent',
            description: 'Can view institutions and resolve tickets',
            isSystemRole: false,
            masqueradeMode: 'READ_ONLY',
            permissions: [
                'platform.institutions.view', 'platform.tickets.view',
                'platform.tickets.resolve', 'platform.masquerade',
            ],
        },
    })

    await prisma.platformRole.upsert({
        where: { name: 'Billing Manager' },
        update: {},
        create: {
            name: 'Billing Manager',
            description: 'Manages billing and plans only',
            isSystemRole: false,
            masqueradeMode: 'DISABLED',
            permissions: [
                'platform.institutions.view', 'platform.billing.view',
                'platform.billing.manage', 'platform.analytics.view',
            ],
        },
    })

    await prisma.platformRole.upsert({
        where: { name: 'Analyst' },
        update: {},
        create: {
            name: 'Analyst',
            description: 'Read-only analytics access',
            isSystemRole: false,
            masqueradeMode: 'DISABLED',
            permissions: [
                'platform.institutions.view', 'platform.analytics.view',
            ],
        },
    })

    // Platform user (super admin)
    await prisma.platformUser.upsert({
        where: { email: 'super@platform.com' },
        update: {},
        create: {
            email: 'super@platform.com',
            hashedPassword: pwd,
            platformRoleId: superAdminRole.id,
        },
    })

    // eslint-disable-next-line no-console -- seed script output
    console.log('Seeded. Password for all: Demo@1234')
    // eslint-disable-next-line no-console -- seed script output
    console.log('Super admin: super@platform.com / Demo@1234')
    // eslint-disable-next-line no-console -- seed script output
    console.log('Platform roles: Super Admin, Support Agent, Billing Manager, Analyst')
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
