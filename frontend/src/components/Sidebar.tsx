"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, GraduationCap, Calendar, Settings, User, Shield, PlusCircle, Hash, FileText, BookOpen, ChevronDown, ChevronRight, LogOut, MessageSquare, Award, Users, UserCog } from "lucide-react"
import { spacesService, Space } from "@/services/spaces"
import { pagesService } from "@/services/pages"
import { coursesService, Course } from "@/services/courses"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateSpaceForm } from "@/components/community/CreateSpaceForm"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAppSettings } from "@/contexts/AppSettingsContext"

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { settings } = useAppSettings()
    const [isAdmin, setIsAdmin] = useState(false)
    const [spaces, setSpaces] = useState<Space[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [pages, setPages] = useState<any[]>([])
    const [isCoursesOpen, setIsCoursesOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const { t } = useLanguage()

    useEffect(() => {
        const checkAdmin = () => {
            try {
                const userStr = localStorage.getItem("user")
                if (userStr) {
                    const user = JSON.parse(userStr)
                    if (user.role === "ADMIN") {
                        setIsAdmin(true)
                    }
                }
            } catch (e) {
                console.error("Error checking admin status", e)
            }
        }
        checkAdmin()

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Pages (Public)
                try {
                    const pagesData = await pagesService.getAll(true)
                    setPages(pagesData)
                } catch (e) {
                    console.error("Failed to fetch pages", e)
                }

                // Fetch Spaces (Protected)
                try {
                    const spacesData = await spacesService.getAllSpaces()
                    setSpaces(spacesData)
                } catch (e) {
                    console.error("Failed to fetch spaces", e)
                }

                // Fetch Courses (Protected)
                try {
                    const coursesData = await coursesService.getCourses()
                    setCourses(coursesData)
                } catch (e) {
                    console.error("Failed to fetch courses", e)
                }

            } catch (error) {
                console.error("Failed to fetch sidebar data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        const handleRefresh = () => fetchData()
        window.addEventListener('sidebar:refresh', handleRefresh)

        return () => {
            window.removeEventListener('sidebar:refresh', handleRefresh)
        }
    }, [])

    const handleCreateSpace = async (data: any) => {
        try {
            await spacesService.createSpace(data)
            const updatedSpaces = await spacesService.getAllSpaces()
            setSpaces(updatedSpaces)
            setIsCreateDialogOpen(false)
        } catch (error) {
            console.error("Failed to create space", error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    const getSpaceIcon = (type: string) => {
        switch (type) {
            case 'COURSE': return GraduationCap;
            case 'EVENT': return Calendar;
            case 'DISCUSSION': return MessageSquare;
            default: return Hash;
        }
    }

    if (loading) return <div className="w-[260px] lg:w-[280px] bg-white border-r border-gray-100 h-screen p-4">Loading...</div>

    return (
        <aside className="hidden md:block w-[260px] lg:w-[280px] flex-shrink-0 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 pb-8 border-r border-gray-100 bg-white">
            <div className="p-4">
                <h1 className="text-xl font-bold text-primary mb-6 px-3">{settings.appName}</h1>

                <nav className="space-y-6">
                    {/* Feed Section */}
                    <div>
                        <Link href="/dashboard" className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2",
                            pathname === "/dashboard"
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        )}>
                            <div className="flex items-center gap-3">
                                <span className={pathname === "/dashboard" ? "text-white" : "text-gray-400"}>
                                    <LayoutDashboard size={18} />
                                </span>
                                <span className="truncate">{t('Feed')}</span>
                            </div>
                        </Link>

                        <div className="flex items-center justify-between px-3 mb-2 mt-4">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('Community')}</h2>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-gray-400 hover:text-primary transition-colors">
                                        <PlusCircle size={16} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('Create New Space')}</DialogTitle>
                                    </DialogHeader>
                                    <CreateSpaceForm onSubmit={handleCreateSpace} onCancel={() => setIsCreateDialogOpen(false)} />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="pl-2 space-y-0.5">
                            {spaces.map(space => {
                                const Icon = getSpaceIcon(space.type);
                                const href = `/dashboard/spaces/${space.slug}`;
                                const isActive = pathname === href;
                                return (
                                    <Link key={space.id} href={href} className={cn(
                                        "flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "text-black bg-gray-50"
                                            : "text-gray-500 hover:text-black hover:bg-gray-50"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className={isActive ? "text-black" : "text-gray-400"}>
                                                {space.icon ? <span>{space.icon}</span> : <Icon size={16} />}
                                            </span>
                                            <span className="truncate">{space.title}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Courses Section */}
                    <div>
                        <div
                            className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-gray-100",
                                pathname.startsWith("/dashboard/courses") ? "text-black" : "text-gray-600"
                            )}
                            onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">
                                    <BookOpen size={18} />
                                </span>
                                <span className="truncate">{t('Courses')}</span>
                            </div>
                            {isCoursesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>

                        {isCoursesOpen && (
                            <div className="mt-1 ml-2 pl-2 border-l border-gray-100 space-y-0.5">
                                <Link href="/dashboard/courses" className={cn(
                                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    pathname === "/dashboard/courses" ? "text-black bg-gray-50" : "text-gray-500 hover:text-black hover:bg-gray-50"
                                )}>
                                    {t('All Courses')}
                                </Link>
                                {courses.map(course => (
                                    <Link key={course.id} href={`/dashboard/courses/${course.id}`} className={cn(
                                        "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === `/dashboard/courses/${course.id}` ? "text-black bg-gray-50" : "text-gray-500 hover:text-black hover:bg-gray-50"
                                    )}>
                                        <span className="truncate">{course.title}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Events Section */}
                    <div>
                        <Link href="/dashboard/calendar" className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            pathname === "/dashboard/calendar"
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        )}>
                            <div className="flex items-center gap-3">
                                <span className={pathname === "/dashboard/calendar" ? "text-white" : "text-gray-400"}>
                                    <Calendar size={18} />
                                </span>
                                <span className="truncate">{t('Calendar')}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Custom Pages Section */}
                    {pages.length > 0 && (
                        <>
                            <div className="h-px bg-gray-100 my-2" />
                            <div>
                                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">
                                    {t('Pages')}
                                </h3>
                                <div className="space-y-0.5">
                                    {pages.map(page => (
                                        <Link
                                            key={page.id}
                                            href={`/dashboard/pages/${page.slug}`}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                pathname === `/dashboard/pages/${page.slug}`
                                                    ? "bg-black text-white"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={pathname === `/dashboard/pages/${page.slug}` ? "text-white" : "text-gray-400"}>
                                                    <FileText size={18} />
                                                </span>
                                                <span className="truncate">{page.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Admin & Profile Section */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">
                            {t('Account')}
                        </h3>
                        <div className="space-y-0.5">
                            {isAdmin && (
                                <>
                                    <Link href="/dashboard/admin" className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === "/dashboard/admin"
                                            ? "bg-black text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className={pathname === "/dashboard/admin" ? "text-white" : "text-gray-400"}>
                                                <Shield size={18} />
                                            </span>
                                            <span className="truncate">{t('Admin Dashboard')}</span>
                                        </div>
                                    </Link>
                                    <Link href="/dashboard/admin/courses" className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === "/dashboard/admin/courses"
                                            ? "bg-black text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className={pathname === "/dashboard/admin/courses" ? "text-white" : "text-gray-400"}>
                                                <BookOpen size={18} />
                                            </span>
                                            <span className="truncate">{t('Manage Courses')}</span>
                                        </div>
                                    </Link>
                                    <Link href="/dashboard/admin/users" className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === "/dashboard/admin/users"
                                            ? "bg-black text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className={pathname === "/dashboard/admin/users" ? "text-white" : "text-gray-400"}>
                                                <Users size={18} />
                                            </span>
                                            <span className="truncate">{t('Manage Users')}</span>
                                        </div>
                                    </Link>
                                    <Link href="/dashboard/admin?tab=roles" className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        pathname === "/dashboard/admin" && typeof window !== 'undefined' && window.location.search.includes('roles')
                                            ? "bg-black text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400">
                                                <UserCog size={18} />
                                            </span>
                                            <span className="truncate">{t('Manage Groups')}</span>
                                        </div>
                                    </Link>
                                </>
                            )}
                            <Link href="/dashboard/profile" className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === "/dashboard/profile"
                                    ? "bg-black text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}>
                                <div className="flex items-center gap-3">
                                    <span className={pathname === "/dashboard/profile" ? "text-white" : "text-gray-400"}>
                                        <User size={18} />
                                    </span>
                                    <span className="truncate">{t('Profile')}</span>
                                </div>
                            </Link>
                            <Link href="/dashboard/settings" className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === "/dashboard/settings"
                                    ? "bg-black text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}>
                                <div className="flex items-center gap-3">
                                    <span className={pathname === "/dashboard/settings" ? "text-white" : "text-gray-400"}>
                                        <Settings size={18} />
                                    </span>
                                    <span className="truncate">{t('Settings')}</span>
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 hover:text-red-600">
                                        <LogOut size={18} />
                                    </span>
                                    <span className="truncate">{t('Logout')}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="mt-8 pt-4 border-t border-gray-100 text-center space-y-1">
                    <span className="text-xs text-gray-400 block">{t('Powered by')} Master LMS</span>
                    <a
                        href="https://gfbdigital.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-primary transition-colors"
                    >
                        Desenvolvido por <span className="font-semibold">GFBDIGITAL</span>
                    </a>
                </div>
            </div>
        </aside >
    )
}
