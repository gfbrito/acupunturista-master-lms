import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommunityService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async getPosts(page: number = 1, limit: number = 10, spaceId?: string) {
        const skip = (page - 1) * limit;
        const where = spaceId ? { spaceId } : {};
        return this.prisma.communityPost.findMany({
            skip,
            take: limit,
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async getFeed(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        // Get spaces user is a member of
        const userMemberships = await this.prisma.spaceMember.findMany({
            where: { userId },
            select: { spaceId: true }
        });
        const memberSpaceIds = userMemberships.map(m => m.spaceId);

        const posts = await this.prisma.communityPost.findMany({
            skip,
            take: limit,
            where: {
                OR: [
                    { space: { accessLevel: 'PUBLIC' } },
                    { spaceId: { in: memberSpaceIds } },
                    { spaceId: null } // Global posts if any
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                space: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        type: true,
                    }
                },
                poll: {
                    include: {
                        options: {
                            include: {
                                votes: true
                            }
                        },
                        votes: {
                            where: { userId }
                        }
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 3 // Preview last 3 comments
                },
                _count: {
                    select: { comments: true }
                }
            },
        });

        // Transform posts to include userVote status for polls
        return posts.map(post => {
            if (post.poll) {
                const userVote = post.poll.votes[0]; // Since we filtered by userId, this will be the user's vote if it exists
                return {
                    ...post,
                    poll: {
                        ...post.poll,
                        userVoteId: userVote ? userVote.optionId : null,
                        votes: undefined // Remove raw votes array from response
                    }
                };
            }
            return post;
        });
    }

    async getTrendingPosts(limit: number = 5) {
        return this.prisma.communityPost.findMany({
            take: limit,
            orderBy: [
                { likes: 'desc' },
                { comments: { _count: 'desc' } }
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: { comments: true }
                }
            },
        });
    }

    async createPost(userId: string, content: string, spaceId?: string, title?: string, imageUrl?: string, poll?: { question: string, options: string[] }) {
        return this.prisma.communityPost.create({
            data: {
                userId,
                content,
                title,
                imageUrl,
                spaceId,
                poll: poll ? {
                    create: {
                        question: poll.question,
                        options: {
                            create: poll.options.map(text => ({ text }))
                        }
                    }
                } : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                poll: {
                    include: {
                        options: true
                    }
                }
            },
        });
    }

    async likePost(postId: string, userId: string) {
        // Toggle like logic to prevent spam
        const existingLike = await this.prisma.communityPostLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await this.prisma.communityPostLike.delete({
                where: {
                    id: existingLike.id
                }
            });
            return this.prisma.communityPost.update({
                where: { id: postId },
                data: {
                    likes: { decrement: 1 },
                },
            });
        } else {
            // Like
            await this.prisma.communityPostLike.create({
                data: {
                    postId,
                    userId
                }
            });
            const post = await this.prisma.communityPost.update({
                where: { id: postId },
                data: {
                    likes: { increment: 1 },
                },
            });

            if (post.userId !== userId) {
                const liker = await this.prisma.user.findUnique({ where: { id: userId } });
                await this.notificationsService.create(
                    post.userId,
                    'LIKE',
                    'New Like',
                    `${liker?.name || 'Someone'} liked your post`,
                    `/dashboard/community`
                );
            }
            return post;
        }
    }

    async addComment(userId: string, postId: string, content: string) {
        const comment = await this.prisma.communityComment.create({
            data: {
                userId,
                postId,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
        if (post && post.userId !== userId) {
            const commenter = await this.prisma.user.findUnique({ where: { id: userId } });
            await this.notificationsService.create(
                post.userId,
                'COMMENT',
                'New Comment',
                `${commenter?.name || 'Someone'} commented on your post`,
                `/dashboard/community`
            );
        }

        return comment;
    }

    async votePoll(userId: string, pollId: string, optionId: string) {
        // Check if user already voted
        const existingVote = await this.prisma.pollVote.findUnique({
            where: {
                pollId_userId: {
                    pollId,
                    userId
                }
            }
        });

        if (existingVote) {
            throw new Error('User already voted in this poll');
        }

        return this.prisma.pollVote.create({
            data: {
                pollId,
                optionId,
                userId
            }
        });
    }
}
