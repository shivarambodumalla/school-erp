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

    // eslint-disable-next-line no-console -- seed script output
    console.log('Seeded. Password for all: Demo@1234')
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
