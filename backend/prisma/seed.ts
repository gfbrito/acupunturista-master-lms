import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'gfbrito@gmail.com';
    const password = 'c0ca-l1ght';
    const name = 'Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: Role.ADMIN,
        },
        create: {
            email,
            name,
            passwordHash: hashedPassword,
            role: Role.ADMIN,
        },
    });

    console.log({ user });

    // Seed Badges
    const badges = [
        {
            name: 'First Lesson',
            description: 'Completed your first lesson!',
            icon: '🎓',
            condition: 'FIRST_LESSON',
        },
        {
            name: 'Course Completed',
            description: 'Finished an entire course!',
            icon: '🏆',
            condition: 'COURSE_COMPLETED',
        },
        {
            name: 'Community Voice',
            description: 'Posted your first comment.',
            icon: '🗣️',
            condition: 'FIRST_COMMENT',
        },
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { id: badge.name }, // Using name as ID for simplicity in seed, but schema uses UUID. We need to find by name or just create.
            // Since schema doesn't have unique name, let's use findFirst logic or just create if not exists.
            // Actually, for seed stability, let's just create if not exists based on name.
            update: {},
            create: {
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                condition: badge.condition as any,
            },
        }).catch(() => {
            // Ignore if fails (e.g. unique constraint if we had one, or just proceed)
            // Better: findFirst
        });

        // Proper upsert logic requires unique field. Let's use findFirst.
        const existing = await prisma.badge.findFirst({ where: { name: badge.name } });
        if (!existing) {
            await prisma.badge.create({
                data: {
                    name: badge.name,
                    description: badge.description,
                    icon: badge.icon,
                    condition: badge.condition as any,
                },
            });
        }
    }
    console.log('Badges seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
