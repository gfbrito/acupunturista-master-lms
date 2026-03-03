import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userCount = await prisma.user.count()
    const courseCount = await prisma.course.count()
    const spaceCount = await prisma.space.count()
    const latestLessons = await prisma.lesson.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { module: { select: { title: true, course: { select: { title: true } } } } }
    })
    console.log(JSON.stringify(latestLessons, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
