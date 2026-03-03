import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class CoursesService {
    constructor(
        private prisma: PrismaService,
        private certificatesService: CertificatesService
    ) { }

    async findAll() {
        const courses = await this.prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                materials: true
                            }
                        }
                    }
                }
            },
        });

        return courses.map(course => {
            const lessonsCount = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
            const hasSupportMaterial = course.modules.some(module =>
                module.lessons.some(lesson => lesson.materials.length > 0)
            );

            // Remove heavy nested data for the list view, keep what's needed
            const { modules, ...courseData } = course;
            return {
                ...courseData,
                lessonsCount,
                hasSupportMaterial
            };
        });
    }

    async findAllWithProgress(userId: string) {
        const courses = await this.prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                materials: true
                            }
                        }
                    }
                },
                reviews: true
            },
        });

        const coursesWithProgress = await Promise.all(courses.map(async (course) => {
            const lessonsCount = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
            const hasSupportMaterial = course.modules.some(module =>
                module.lessons.some(lesson => lesson.materials.length > 0)
            );

            // Calculate progress
            const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
            const totalLessons = allLessonIds.length;
            let progress = 0;

            if (totalLessons > 0) {
                const completedLessons = await this.prisma.lessonProgress.count({
                    where: {
                        userId,
                        lessonId: { in: allLessonIds },
                        status: 'COMPLETED'
                    }
                });
                progress = Math.round((completedLessons / totalLessons) * 100);
            }

            // Calculate rating
            const reviews = course.reviews || [];
            const rating = reviews.length > 0
                ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
                : 0;

            const { modules, reviews: _, ...courseData } = course;
            return {
                ...courseData,
                lessonsCount,
                hasSupportMaterial,
                progress,
                rating
            };
        }));

        return coursesWithProgress;
    }

    async getLatestLessons(limit: number = 5) {
        return this.prisma.lesson.findMany({
            where: { isPublished: true },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                module: {
                    select: {
                        course: {
                            select: {
                                title: true,
                            }
                        }
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: { orderBy: { order: 'asc' } },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async create(data: { title: string; description?: string; slug: string; thumbnail?: string; bannerUrl?: string; defaultAccessDays?: number; hasCertificate?: boolean; totalHours?: number }) {
        return this.prisma.course.create({
            data: {
                ...data,
                defaultAccessDays: data.defaultAccessDays || 365,
                hasCertificate: data.hasCertificate || false,
                totalHours: data.totalHours || 0,
            },
        });
    }

    async update(id: string, data: { title?: string; description?: string; slug?: string; thumbnail?: string; bannerUrl?: string; defaultAccessDays?: number; hasCertificate?: boolean; totalHours?: number; certificateSettings?: any }) {
        return this.prisma.course.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.course.delete({
            where: { id },
        });
    }

    async createModule(courseId: string, data: { title: string; description?: string; order: number }) {
        return this.prisma.module.create({
            data: {
                ...data,
                courseId,
            },
        });
    }

    async updateModule(id: string, data: { title?: string; description?: string; order?: number }) {
        return this.prisma.module.update({
            where: { id },
            data,
        });
    }

    async removeModule(id: string) {
        return this.prisma.module.delete({
            where: { id },
        });
    }

    async createLesson(moduleId: string, data: { title: string; content?: string; videoUrl?: string; videoType?: 'BUNNY' | 'VIMEO' | 'YOUTUBE'; durationSeconds?: number; order: number; isPublished?: boolean; materials?: { title: string; type: string; url: string }[] }) {
        const { materials, content, videoUrl, ...lessonData } = data;
        return this.prisma.lesson.create({
            data: {
                ...lessonData,
                description: content,
                videoId: videoUrl,
                isPublished: lessonData.isPublished ?? false,
                moduleId,
                materials: {
                    create: materials,
                },
            },
            include: { materials: true },
        });
    }

    async updateLesson(id: string, data: { title?: string; content?: string; videoUrl?: string; videoType?: 'BUNNY' | 'VIMEO' | 'YOUTUBE'; durationSeconds?: number; order?: number; isPublished?: boolean; materials?: { title: string; type: string; url: string }[] }) {
        const { materials, content, videoUrl, ...lessonData } = data;

        // If materials are provided, we replace them (simple strategy for now)
        // A better strategy would be to diff, but for MVP replace is fine or add specific endpoints for materials
        if (materials) {
            await this.prisma.lessonMaterial.deleteMany({ where: { lessonId: id } });
        }

        return this.prisma.lesson.update({
            where: { id },
            data: {
                ...lessonData,
                description: content,
                videoId: videoUrl,
                materials: materials ? {
                    create: materials,
                } : undefined,
            },
            include: { materials: true },
        });
    }

    async removeLesson(id: string) {
        return this.prisma.lesson.delete({
            where: { id },
        });
    }

    async getLesson(id: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                module: { select: { courseId: true } },
                materials: true,
            },
        });
        if (!lesson) throw new NotFoundException('Lesson not found');
        return lesson;
    }

    async toggleLessonProgress(userId: string, lessonId: string, isCompleted: boolean) {
        const status = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';
        const completedAt = isCompleted ? new Date() : null;

        const progress = await this.prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: { userId, lessonId },
            },
            update: {
                status,
                completedAt,
                lastViewedAt: new Date(),
            },
            create: {
                userId,
                lessonId,
                status,
                completedAt,
                lastViewedAt: new Date(),
            },
        });

        // Check course completion and issue certificate if 100%
        if (isCompleted) {
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: lessonId },
                include: { module: true }
            });

            if (lesson && lesson.module) {
                const courseId = lesson.module.courseId;
                const courseProgress = await this.getUserCourseProgress(userId, courseId);

                if (courseProgress.percentage === 100) {
                    // Check if course has certificate enabled
                    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
                    if (course && course.hasCertificate) {
                        try {
                            await this.certificatesService.issueCertificate(userId, courseId);
                        } catch (e) {
                            console.error('Failed to issue auto-certificate', e);
                        }
                    }
                }
            }
        }

        return progress;
    }

    async getUserCourseProgress(userId: string, courseId: string) {
        // Get all lessons in the course
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: { select: { id: true } },
                    },
                },
            },
        });

        if (!course) throw new NotFoundException('Course not found');

        const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = allLessonIds.length;

        if (totalLessons === 0) return { totalLessons: 0, completedLessons: 0, percentage: 0 };

        // Get completed lessons for user
        const progress = await this.prisma.lessonProgress.findMany({
            where: {
                userId,
                lessonId: { in: allLessonIds },
            },
            select: { lessonId: true, status: true },
        });

        const completedLessonsIds = progress.filter(p => p.status === 'COMPLETED').map(p => p.lessonId);
        const inProgressLessonsIds = progress.filter(p => p.status === 'IN_PROGRESS').map(p => p.lessonId);

        const completedCount = completedLessonsIds.length;
        const percentage = Math.round((completedCount / totalLessons) * 100);

        return {
            totalLessons,
            completedLessons: completedCount,
            percentage,
            completedLessonsIds,
            inProgressLessonsIds,
        };
    }
    async getLessonComments(lessonId: string) {
        return this.prisma.lessonComment.findMany({
            where: { lessonId, parentId: null },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createLessonComment(userId: string, lessonId: string, content: string, parentId?: string) {
        return this.prisma.lessonComment.create({
            data: {
                content,
                userId,
                lessonId,
                parentId
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });
    }

    async likeComment(commentId: string) {
        const comment = await this.prisma.lessonComment.findUnique({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');

        return this.prisma.lessonComment.update({
            where: { id: commentId },
            data: { likes: comment.likes + 1 }
        });
    }

    // Lesson Ratings
    async rateLesson(userId: string, lessonId: string, rating: number) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        return this.prisma.lessonRating.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { rating },
            create: { userId, lessonId, rating }
        });
    }

    async getLessonRating(lessonId: string) {
        const ratings = await this.prisma.lessonRating.findMany({
            where: { lessonId }
        });

        if (ratings.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / ratings.length;

        return {
            average: Math.round(average * 10) / 10,
            count: ratings.length
        };
    }

    // Course Reviews
    async reviewCourse(userId: string, courseId: string, rating: number, comment?: string) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        return this.prisma.courseReview.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: { rating, comment },
            create: { userId, courseId, rating, comment }
        });
    }

    async getCourseReviews(courseId: string) {
        return this.prisma.courseReview.findMany({
            where: { courseId },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getCourseRating(courseId: string) {
        const reviews = await this.prisma.courseReview.findMany({
            where: { courseId }
        });

        if (reviews.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / reviews.length;

        return {
            average: Math.round(average * 10) / 10,
            count: reviews.length
        };
    }
}
