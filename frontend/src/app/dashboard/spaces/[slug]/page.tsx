"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { spacesService, Space } from "@/services/spaces"
import { Feed } from "@/components/community/Feed"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar, MessageSquare, Hash } from "lucide-react"
import { api } from "@/lib/api"

export default function SpacePage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const [space, setSpace] = useState<Space | null>(null)
    const [loading, setLoading] = useState(true)
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
    const [trendingPosts, setTrendingPosts] = useState<any[]>([])
    const [courseUpdates, setCourseUpdates] = useState<any[]>([])

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const data = await spacesService.getSpace(slug)
                setSpace(data)

                // Redirect if it's a course space
                if (data.type === 'COURSE' && data.courseId) {
                    router.push(`/dashboard/courses/${data.courseId}`)
                }
            } catch (error) {
                console.error("Failed to fetch space", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSpace()
    }, [slug, router])

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const [eventsRes, trendingRes, updatesRes] = await Promise.all([
                    api.get("/events"),
                    api.get("/community/posts/trending"),
                    api.get("/courses/updates")
                ])

                setUpcomingEvents(Array.isArray(eventsRes.data) ? eventsRes.data : [])
                setTrendingPosts(Array.isArray(trendingRes.data) ? trendingRes.data : [])
                setCourseUpdates(Array.isArray(updatesRes.data) ? updatesRes.data : [])
            } catch (error) {
                console.error("Failed to fetch widgets data", error)
            }
        }
        fetchWidgets()
    }, [])

    if (loading) return <div>Loading space...</div>
    if (!space) return <div>Space not found</div>

    // If it's a course space, we already redirected. But just in case:
    if (space.type === 'COURSE') return <div>Redirecting to course...</div>

    const getIcon = () => {
        switch (space.type) {
            case 'EVENT': return Calendar;
            case 'DISCUSSION': return MessageSquare;
            default: return Hash;
        }
    }
    const Icon = getIcon()

    const getGradient = (str: string) => {
        const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const hue = Math.abs(hash % 360);
        return `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 40) % 360}, 70%, 40%))`;
    }

    return (
        <div className="space-y-6">
            {/* Cover Image Area */}
            {(space.coverUrl || space.isDynamicCover) ? (
                <div
                    className="w-full h-48 md:h-64 rounded-xl overflow-hidden relative mb-6 shadow-sm"
                    style={{
                        background: space.isDynamicCover ? getGradient(space.title) : undefined
                    }}
                >
                    {!space.isDynamicCover && space.coverUrl && (
                        <img
                            src={space.coverUrl}
                            alt={space.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                        <div className="text-white">
                            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">{space.title}</h1>
                            <p className="text-white/90 capitalize drop-shadow-md flex items-center gap-2">
                                <Icon className="h-5 w-5" /> {space.type.toLowerCase()} Space
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{space.title}</h1>
                        <p className="text-gray-500 capitalize">{space.type.toLowerCase()} Space</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-8">
                    {space.type === 'DISCUSSION' && (
                        <Feed spaceId={space.id} />
                    )}

                    {space.type === 'EVENT' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Events</h2>
                            <p className="text-gray-500">Event list coming soon...</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Upcoming Events Widget */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-primary" /> Upcoming Events
                        </h3>
                        <div className="space-y-3">
                            {upcomingEvents.length === 0 && <p className="text-xs text-gray-400">No upcoming events.</p>}
                            {upcomingEvents.slice(0, 3).map((event: any) => {
                                const date = new Date(event.startAt)
                                return (
                                    <div key={event.id} className="flex gap-3 items-start">
                                        <div className="bg-primary/10 text-primary rounded-lg p-2 text-center min-w-[50px]">
                                            <div className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-lg font-bold">{date.getDate()}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm line-clamp-2">{event.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <Button variant="ghost" className="w-full text-xs h-8">View Calendar</Button>
                        </div>
                    </div>

                    {/* Trending Posts Widget */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Hash size={18} className="text-primary" /> Trending Posts
                        </h3>
                        <div className="space-y-4">
                            {trendingPosts.length === 0 && <p className="text-xs text-gray-400">No trending posts.</p>}
                            {trendingPosts.map((post: any) => (
                                <div key={post.id} className="group cursor-pointer">
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title || post.content.substring(0, 50)}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                        <span>{post.likes} likes</span>
                                        <span>•</span>
                                        <span>{post._count?.comments || 0} comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Updates Widget */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <GraduationCap size={18} className="text-primary" /> Course Updates
                        </h3>
                        <div className="space-y-3">
                            {courseUpdates.length === 0 && <p className="text-xs text-gray-400">No recent updates.</p>}
                            {courseUpdates.map((lesson: any) => (
                                <div key={lesson.id} className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <GraduationCap size={20} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm line-clamp-1">{lesson.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{lesson.module?.course?.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
