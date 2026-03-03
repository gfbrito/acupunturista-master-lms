"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/StarRating"
import { useLanguage } from "@/contexts/LanguageContext"
import { coursesService } from "@/services/courses"

interface CourseWithProgress {
    id: string
    title: string
    description: string
    thumbnail?: string
    bannerUrl?: string
    hasCertificate?: boolean
    lessonsCount?: number
    hasSupportMaterial?: boolean
    progress: number
    rating: number
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<CourseWithProgress[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useLanguage()

    useEffect(() => {
        const fetchCoursesWithProgress = async () => {
            try {
                // Use the aggregated endpoint to avoid N+1 queries
                const coursesWithProgress = await coursesService.getCoursesWithProgress()
                setCourses(coursesWithProgress as CourseWithProgress[])
            } catch (error) {
                console.error("Error fetching courses", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCoursesWithProgress()
    }, [])

    if (loading) return <div>{t('Loading courses...')}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">{t('My Courses')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                        {course.thumbnail && (
                            <div className="relative w-full h-48">
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                            {course.rating > 0 && (
                                <div className="mt-1">
                                    <StarRating rating={course.rating} size={16} />
                                </div>
                            )}
                            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {course.lessonsCount !== undefined && (
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        {course.lessonsCount} {t('Lessons')}
                                    </span>
                                )}
                                {course.hasCertificate && (
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        {t('Certificate')}
                                    </span>
                                )}
                                {course.hasSupportMaterial && (
                                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                        {t('Materials')}
                                    </span>
                                )}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t('Progress')}</span>
                                    <span className="font-medium">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                                <Button className="w-full">
                                    {course.progress > 0 ? t('Continue Learning') : t('Start Learning')}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
