import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningPathsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { courseIds, ...pathData } = data;

        const path = await this.prisma.learningPath.create({
            data: {
                ...pathData,
                slug: pathData.title.toLowerCase().replace(/ /g, '-'),
            }
        });

        if (courseIds && courseIds.length > 0) {
            await this.addCoursesToPath(path.id, courseIds);
        }

        return path;
    }

    async findAll() {
        return this.prisma.learningPath.findMany({
            include: {
                courses: {
                    include: { course: true },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const path = await this.prisma.learningPath.findUnique({
            where: { id },
            include: {
                courses: {
                    include: { course: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!path) throw new NotFoundException('Learning Path not found');
        return path;
    }

    async findBySlug(slug: string) {
        const path = await this.prisma.learningPath.findUnique({
            where: { slug },
            include: {
                courses: {
                    include: { course: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!path) throw new NotFoundException('Learning Path not found');
        return path;
    }

    async update(id: string, data: any) {
        const { courseIds, ...pathData } = data;

        const path = await this.prisma.learningPath.update({
            where: { id },
            data: pathData
        });

        if (courseIds) {
            // Replace existing courses
            await this.prisma.learningPathCourse.deleteMany({ where: { learningPathId: id } });
            await this.addCoursesToPath(id, courseIds);
        }

        return this.findOne(id);
    }

    async delete(id: string) {
        return this.prisma.learningPath.delete({ where: { id } });
    }

    private async addCoursesToPath(pathId: string, courseIds: string[]) {
        const data = courseIds.map((courseId, index) => ({
            learningPathId: pathId,
            courseId,
            order: index
        }));

        await this.prisma.learningPathCourse.createMany({ data });
    }
}
