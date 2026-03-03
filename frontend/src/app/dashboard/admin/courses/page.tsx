"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreateCourseModal } from "@/components/admin/CreateCourseModal"
import { useLanguage } from "@/contexts/LanguageContext"
import { PlusCircle } from "lucide-react"

export default function ManageCoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const { t } = useLanguage()

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses')
            setCourses(res.data)
        } catch (error) {
            console.error("Failed to fetch courses", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const handleDeleteCourse = async (id: string) => {
        if (!confirm(t("Are you sure you want to delete this course?"))) return
        try {
            await api.delete(`/courses/${id}`)
            fetchCourses()
        } catch (error) {
            console.error("Failed to delete course", error)
            alert(t("Failed to delete course"))
        }
    }

    if (loading) return <div className="p-8">{t('Loading...')}</div>

    return (
        <div className="space-y-6 container mx-auto py-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('Manage Courses')}</h1>
                    <p className="text-gray-500 mt-1">{t('Create and manage your educational content.')}</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <PlusCircle size={18} />
                    {t('Create Course')}
                </Button>
            </div>

            <div className="grid gap-4">
                {courses.map((course) => (
                    <Card key={course.id} className="flex flex-col md:flex-row items-center justify-between p-4 overflow-hidden">
                        <div className="flex items-center gap-4 flex-1">
                            {course.thumbnail && (
                                <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-md" />
                            )}
                            <div>
                                <h4 className="font-semibold text-lg">{course.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {course.slug}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <Link href={`/dashboard/admin/courses/${course.id}/content`}>
                                <Button variant="outline" size="sm">{t('Edit Content')}</Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                                {t('Delete Course')}
                            </Button>
                        </div>
                    </Card>
                ))}
                {courses.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        <p>{t('No courses found. Create your first course!')}</p>
                    </div>
                )}
            </div>

            <CreateCourseModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={fetchCourses}
            />
        </div>
    )
}
