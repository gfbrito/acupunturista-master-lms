"use client"

import { useEffect, useState } from "react"
import { api, API_URL } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUser } from "@/contexts/UserContext"
import { communityService } from "@/services/community"
import { coursesService } from "@/services/courses"
import { Feed } from "@/components/community/Feed"
import {
    ThumbsUp, MessageCircle, Star, BookOpen, TrendingUp, Clock,
    Trophy, Calendar, Flame, Award, Bell, Sparkles, ChevronRight, Play
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface CourseWithProgress {
    id: string
    title: string
    thumbnail?: string
    progress: number
    rating: number
    category?: string
    duration?: string
    modules?: any[]
}

interface LeaderboardUser {
    id: string
    name: string
    avatar?: string
    points: number
}

interface EventItem {
    id: string
    title: string
    startAt: string
}

interface BadgeItem {
    id: string
    badge: {
        name: string
        icon: string
    }
    earnedAt: string
}

interface Notification {
    id: string
    content: string
    isRead: boolean
    createdAt: string
}

export default function DashboardPage() {
    const { t } = useLanguage()
    const [user, setUser] = useState<any>(null)
    const [inProgressCourses, setInProgressCourses] = useState<CourseWithProgress[]>([])
    const [completedCourses, setCompletedCourses] = useState<CourseWithProgress[]>([])
    const [topRatedCourses, setTopRatedCourses] = useState<CourseWithProgress[]>([])
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
    const [events, setEvents] = useState<EventItem[]>([])
    const [badges, setBadges] = useState<BadgeItem[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [studyStreak, setStudyStreak] = useState(0)
    const [loading, setLoading] = useState(true)

    // Filter state
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending' | 'pinned'>('all')

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return t('Good morning')
        if (hour < 18) return t('Good afternoon')
        return t('Good evening')
    }

    const getImageUrl = (path?: string) => {
        if (!path) return "/placeholder-course.jpg"
        if (path.startsWith('http') || path.startsWith('https')) return path
        return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token")

                // Fetch user
                const userRes = await api.get("/users/me")
                setUser(userRes.data)

                // Fetch courses with progress using aggregated endpoint
                try {
                    const coursesWithProgress = await coursesService.getCoursesWithProgress()

                    const inProgress = coursesWithProgress
                        .filter((c: CourseWithProgress) => c.progress > 0 && c.progress < 100)
                        .sort((a: CourseWithProgress, b: CourseWithProgress) => b.progress - a.progress)
                        .slice(0, 6)

                    const completed = coursesWithProgress
                        .filter((c: CourseWithProgress) => c.progress >= 100)
                        .slice(0, 3)

                    const topRated = coursesWithProgress
                        .filter((c: CourseWithProgress) => c.rating > 0)
                        .sort((a: CourseWithProgress, b: CourseWithProgress) => b.rating - a.rating)
                        .slice(0, 5)

                    setInProgressCourses(inProgress)
                    setCompletedCourses(completed)
                    setTopRatedCourses(topRated)
                } catch (e) {
                    console.warn("Error fetching courses", e)
                }

                // Fetch leaderboard
                try {
                    const leaderboardRes = await api.get("/gamification/leaderboard")
                    setLeaderboard(leaderboardRes.data.slice(0, 5))
                } catch (e) {
                    console.warn("Error fetching leaderboard", e)
                }

                // Fetch events
                try {
                    const eventsRes = await api.get("/events")
                    setEvents(eventsRes.data.slice(0, 3))
                } catch (e) {
                    console.warn("Error fetching events", e)
                }

                // Fetch badges
                try {
                    const badgesRes = await api.get("/gamification/badges")
                    setBadges(badgesRes.data.slice(0, 3))
                } catch (e) {
                    console.warn("Error fetching badges", e)
                }

                // Fetch notifications
                try {
                    const notifRes = await api.get("/notifications")
                    setNotifications((notifRes.data.notifications || []).slice(0, 5))
                } catch (e) {
                    console.warn("Error fetching notifications", e)
                }

                // Calculate study streak (simplified - count recent lesson completions)
                try {
                    const pointsRes = await api.get("/gamification/points")
                    // Simplified streak calculation based on points activity
                    setStudyStreak(Math.min(7, Math.floor(pointsRes.data / 100)))
                } catch (e) {
                    console.warn("Error fetching streak", e)
                }

            } catch (error) {
                console.error("Error fetching dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('Continue your learning journey')}
                    </p>
                </div>
                {studyStreak > 0 && (
                    <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 px-4 py-2 rounded-full text-orange-600 dark:text-orange-400 font-medium">
                        <Flame size={20} />
                        <span>{studyStreak} {t('days of streak!')}</span>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* In Progress Courses Section */}
                    {inProgressCourses.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight">{t('In Progress')}</h2>
                                <Link href="/dashboard/courses" className="text-sm font-medium text-primary hover:underline">
                                    {t('View all')}
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inProgressCourses.map((course) => (
                                    <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
                                        <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-transparent hover:border-border">
                                            <div className="relative aspect-video overflow-hidden rounded-t-xl">
                                                <Image
                                                    src={getImageUrl(course.thumbnail)}
                                                    alt={course.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="text-white fill-white" size={48} />
                                                </div>
                                            </div>
                                            <CardContent className="p-5 space-y-4">
                                                <div>
                                                    <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {course.category || 'Development'}
                                                    </Badge>
                                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {course.title}
                                                    </h3>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-muted-foreground">{t('Progress')}</span>
                                                        <span className="text-primary">{Math.round(course.progress || 0)}%</span>
                                                    </div>
                                                    <Progress value={course.progress || 0} className="h-2" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feed Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">{t('Community Feed')}</h2>
                        <Feed />
                    </div>
                </div>
                {/* Completed Courses */}


                {/* Recommended */}



                <div className="space-y-6">
                    {/* Completed Courses Widget - Moved to Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Award className="text-green-500" size={18} />
                                {t('Completed Courses')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {completedCourses.length === 0 ? (
                                <div className="text-center py-4 text-xs text-muted-foreground">
                                    {t('No completed courses yet.')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completedCourses.map(course => (
                                        <div key={course.id} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
                                                    <Image src={getImageUrl(course.thumbnail)} alt={course.title} fill className="object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-sm truncate leading-tight">{course.title}</h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-green-100 text-green-700 hover:bg-green-100">
                                                            {t('Completed')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => {
                                                const token = localStorage.getItem("token")
                                                window.open(`${API_URL}/certificates/generate/${course.id}?token=${token}`, '_blank')
                                            }}>
                                                <Award size={12} className="mr-2" />
                                                {t('Certificate')}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recommended - Moved to Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles size={18} className="text-yellow-500" />
                                {t('Recommended')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {topRatedCourses.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">{t('No results found.')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {topRatedCourses.map(course => (
                                        <Link href={`/dashboard/courses/${course.id}`} key={course.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors -mx-2">
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                <Image src={getImageUrl(course.thumbnail)} alt={course.title} fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-medium truncate leading-tight">{course.title}</h4>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                    {course.rating.toFixed(1)}
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leaderboard Widget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={20} />
                                {t('Points Ranking')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{t('No ranking available.')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((u, i) => (
                                        <div key={u.id} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                i === 1 ? 'bg-gray-100 text-gray-700' :
                                                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={u.avatar} />
                                                <AvatarFallback>{u.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 truncate text-sm font-medium">{u.name}</div>
                                            <div className="font-bold text-sm">{u.points}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="text-blue-500" size={20} />
                                {t('Upcoming events')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{t('No upcoming events.')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {events.map(event => (
                                        <div key={event.id} className="flex items-center gap-3 border-l-2 border-blue-500 pl-3">
                                            <div>
                                                <p className="text-sm font-medium">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(event.startAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="text-purple-500" size={20} />
                                {t('Your Achievements')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {badges.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    {t('No achievements yet.')}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {badges.map(b => (
                                        <Badge key={b.id} variant="secondary" className="gap-1">
                                            <span>{b.badge.icon}</span>
                                            <span>{b.badge.name}</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="text-red-500" size={20} />
                                {t('Notifications')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">{t('No notifications')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map(notif => (
                                        <div key={notif.id} className={`text-sm p-2 rounded ${notif.isRead ? 'bg-muted/50' : 'bg-blue-50 dark:bg-blue-900/10'}`}>
                                            <p>{notif.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            <Link href="/dashboard/courses" className="block">
                                <Button className="w-full" variant="outline">
                                    <BookOpen size={16} className="mr-2" />
                                    {t('All Courses')}
                                </Button>
                            </Link>
                            <Link href="/dashboard/community" className="block">
                                <Button className="w-full" variant="outline">
                                    <MessageCircle size={16} className="mr-2" />
                                    {t('Community')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
