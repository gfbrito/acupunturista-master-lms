import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class EnrollmentsService {
    private readonly logger = new Logger(EnrollmentsService.name);

    constructor(
        private prisma: PrismaService,
        private spacesService: SpacesService
    ) { }

    async createOrUpdateEnrollment(
        userId: string,
        courseId: string,
        durationDays: number,
        source: string,
        sourceReference: string,
    ) {
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: { userId, courseId },
        });

        const now = new Date();
        let startAt = now;
        let endAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        let enrollment;

        if (existingEnrollment) {
            // If active, extend from current end date
            if (existingEnrollment.status === EnrollmentStatus.ACTIVE && existingEnrollment.endAt > now) {
                startAt = existingEnrollment.startAt;
                endAt = new Date(existingEnrollment.endAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
            } else {
                // If expired, restart from now
                startAt = now;
            }

            enrollment = await this.prisma.enrollment.update({
                where: { id: existingEnrollment.id },
                data: {
                    startAt,
                    endAt,
                    status: EnrollmentStatus.ACTIVE,
                    source,
                    sourceReference,
                },
            });
        } else {
            enrollment = await this.prisma.enrollment.create({
                data: {
                    userId,
                    courseId,
                    startAt,
                    endAt,
                    status: EnrollmentStatus.ACTIVE,
                    source,
                    sourceReference,
                },
            });
        }

        // Auto-join spaces linked to this course
        await this.autoJoinSpaces(userId, courseId);

        return enrollment;
    }

    private async autoJoinSpaces(userId: string, courseId: string) {
        // Find spaces that are linked to this course
        const spaces = await this.prisma.space.findMany({
            where: { courseId },
        });

        for (const space of spaces) {
            try {
                // Check if already a member
                const existingMember = await this.prisma.spaceMember.findUnique({
                    where: {
                        spaceId_userId: {
                            spaceId: space.id,
                            userId,
                        },
                    },
                });

                if (!existingMember) {
                    await this.spacesService.addMember(userId, space.id);
                    this.logger.log(`Auto-joined user ${userId} to space ${space.title} (${space.id})`);
                }
            } catch (error) {
                this.logger.error(`Failed to auto-join user ${userId} to space ${space.id}`, error.stack);
            }
        }
    }
}
