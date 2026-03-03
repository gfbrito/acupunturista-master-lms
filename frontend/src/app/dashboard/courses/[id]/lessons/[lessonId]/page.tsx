"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Download, ExternalLink } from "lucide-react"
import { VideoPlayer } from "@/components/course/VideoPlayer"
import { CourseSidebar } from "@/components/course/CourseSidebar"
import { LessonComments } from "@/components/course/LessonComments"
import { StarRating } from "@/components/StarRating"
import Link from "next/link"
import { toast } from "sonner"

// Mock Data for fallback
const MOCK_COURSE = {
    id: "mock-course-1",
    title: "Acupunturista Master",
    modules: [
        {
            id: "mod-1",
            title: "Introdução à Acupuntura",
            lessons: [
                { id: "les-1", title: "História da MTC", isPublished: true, durationSeconds: 600 },
                { id: "les-2", title: "Yin e Yang", isPublished: true, durationSeconds: 1200 },
            ]
        },
        {
            id: "mod-2",
            title: "Meridianos Principais",
            lessons: [
                { id: "les-3", title: "Meridiano do Pulmão", isPublished: true, durationSeconds: 1800 },
                { id: "les-4", title: "Meridiano do Intestino Grosso", isPublished: false, durationSeconds: 1500 },
            ]
        }
    ]
}

const MOCK_LESSON = {
    id: "les-1",
    title: "História da MTC",
    content: "Nesta aula vamos explorar as origens da Medicina Tradicional Chinesa...",
    videoProvider: "YOUTUBE",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll placeholder
    materials: [
        { id: "mat-1", title: "Resumo da Aula (PDF)", type: "PDF", url: "#" },
        { id: "mat-2", title: "Artigo Complementar", type: "LINK", url: "#" }
    ]
}

export default function LessonPage() {
    const { id: courseId, lessonId } = useParams()
    const router = useRouter()

    const [course, setCourse] = useState<any>(null)
    const [lesson, setLesson] = useState<any>(null)
    const [completedLessons, setCompletedLessons] = useState<string[]>([])
    const [inProgressLessons, setInProgressLessons] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [progressPercentage, setProgressPercentage] = useState(0)
    const [lessonRating, setLessonRating] = useState<{ average: number; count: number } | null>(null)
    const [userRating, setUserRating] = useState<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token")
                const headers = { Authorization: `Bearer ${token}` }

                // 1. Fetch Course Structure
                try {
                    const courseRes = await api.get(`/courses/${courseId}`)
                    setCourse(courseRes.data)
                } catch (e) {
                    console.error("Error fetching course", e)
                    toast.error("Erro ao carregar curso")
                }

                // 2. Fetch Current Lesson
                try {
                    const lessonRes = await api.get(`/lessons/${lessonId}`)
                    setLesson({
                        ...lessonRes.data,
                        videoUrl: lessonRes.data.videoId || lessonRes.data.videoUrl || ""
                    })
                } catch (e) {
                    console.error("Error fetching lesson", e)
                    toast.error("Erro ao carregar aula")
                }

                // 3. Fetch Progress
                try {
                    const progressRes = await api.get(`/courses/${courseId}/progress`)
                    setCompletedLessons(progressRes.data.completedLessonsIds || [])
                    setInProgressLessons(progressRes.data.inProgressLessonsIds || [])
                    setProgressPercentage(progressRes.data.percentage || 0)
                } catch (e) {
                    console.warn("Error fetching progress", e)
                }

                // 4. Fetch Lesson Rating
                try {
                    const ratingRes = await api.get(`/lessons/${lessonId}/rating`)
                    setLessonRating(ratingRes.data)
                } catch (e) {
                    console.warn("Error fetching rating", e)
                }

            } catch (error) {
                console.error("Error fetching data", error)
                toast.error("Erro ao carregar dados da aula")
            } finally {
                setLoading(false)
            }
        }

        if (courseId && lessonId) fetchData()
    }, [courseId, lessonId])

    const handleRateLesson = async (rating: number) => {
        try {
            await api.post(`/lessons/${lessonId}/rate`, { rating })
            setUserRating(rating)
            toast.success("Avaliação enviada com sucesso!")

            // Refetch rating to update average
            const ratingRes = await api.get(`/lessons/${lessonId}/rating`)
            setLessonRating(ratingRes.data)
        } catch (error) {
            console.error("Error rating lesson", error)
            toast.error("Erro ao avaliar aula")
        }
    }

    const handleMarkComplete = async () => {
        try {
            // Optimistic update
            const isCompleted = completedLessons.includes(lessonId as string)
            const newCompleted = isCompleted
                ? completedLessons.filter(id => id !== lessonId)
                : [...completedLessons, lessonId as string]

            setCompletedLessons(newCompleted)

            // Recalculate percentage (simplified for frontend)
            // In real app, backend returns new percentage
            toast.success(isCompleted ? "Aula marcada como não concluída" : "Aula concluída! 🎉")

            // API Call
            await api.post(`/lessons/${lessonId}/progress`, { isCompleted: !isCompleted })

            // Refetch progress to update sidebar percentage
            try {
                const progressRes = await api.get(`/courses/${courseId}/progress`)
                setProgressPercentage(progressRes.data.percentage || 0)
                setInProgressLessons(progressRes.data.inProgressLessonsIds || [])
            } catch (e) {
                console.warn("Error refetching progress", e)
            }

        } catch (error) {
            console.error("Error updating progress", error)
            toast.error("Erro ao atualizar progresso")
        }
    }

    const getNextLessonId = () => {
        if (!course || !course.modules) return null;

        for (let mIndex = 0; mIndex < course.modules.length; mIndex++) {
            const module = course.modules[mIndex];
            const lIndex = module.lessons.findIndex((l: any) => l.id === lessonId);

            if (lIndex !== -1) {
                // Found current lesson
                if (lIndex < module.lessons.length - 1) {
                    // Next lesson in same module
                    return module.lessons[lIndex + 1].id;
                } else if (mIndex < course.modules.length - 1) {
                    // First lesson of next module
                    const nextModule = course.modules[mIndex + 1];
                    if (nextModule.lessons.length > 0) {
                        return nextModule.lessons[0].id;
                    }
                }
                return null; // Last lesson of last module
            }
        }
        return null;
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando aula...</div>
    if (!course || !lesson) return <div className="flex items-center justify-center h-screen">Aula não encontrada</div>

    const isCompleted = completedLessons.includes(lessonId as string)

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header / Breadcrumb */}
            <header className="border-b px-6 py-4 flex items-center gap-2 bg-white sticky top-0 z-10 text-sm">
                <Link href="/dashboard/courses" className="text-gray-500 hover:text-gray-900 flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Cursos
                </Link>
                <span className="text-gray-300">/</span>
                <Link href={`/dashboard/courses/${courseId}`} className="text-gray-500 hover:text-gray-900 truncate max-w-[150px]">
                    {course.title}
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 truncate max-w-[150px]">
                    {course.modules.find((m: any) => m.lessons.some((l: any) => l.id === lessonId))?.title}
                </span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                    {lesson.title}
                </span>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content (Left) */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Video Player */}
                        <div className="space-y-4">
                            <VideoPlayer
                                provider={lesson.videoType || 'BUNNY'}
                                videoId={lesson.videoUrl}
                                title={lesson.title}
                            />

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
                                    <p className="text-gray-500 mt-1">Módulo: {course.modules.find((m: any) => m.lessons.some((l: any) => l.id === lessonId))?.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleMarkComplete}
                                        variant={isCompleted ? "outline" : "default"}
                                        className={isCompleted ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" : ""}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Concluída
                                            </>
                                        ) : (
                                            "Marcar como Concluída"
                                        )}
                                    </Button>

                                    {getNextLessonId() && (
                                        <Link href={`/dashboard/courses/${courseId}/lessons/${getNextLessonId()}`}>
                                            <Button variant="outline" className="gap-2">
                                                Próxima Aula <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sobre esta aula</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none text-gray-600">
                                    {lesson.content || "Sem descrição."}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lesson Rating */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Avaliar esta aula</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {lessonRating && lessonRating.count > 0 && (
                                        <div className="flex items-center gap-3 pb-4 border-b">
                                            <StarRating rating={lessonRating.average} />
                                            <span className="text-sm text-gray-600">
                                                ({lessonRating.count} {lessonRating.count === 1 ? 'avaliação' : 'avaliações'})
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {userRating > 0 ? 'Sua avaliação:' : 'Como você avalia esta aula?'}
                                        </p>
                                        <StarRating
                                            rating={userRating}
                                            interactive
                                            onChange={handleRateLesson}
                                            size={24}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Materials */}
                        {lesson.materials && lesson.materials.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Materiais de Apoio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {lesson.materials.map((material: any) => (
                                            <a
                                                key={material.id}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors">
                                                    {material.type === 'PDF' ? <FileText className="h-5 w-5" /> :
                                                        material.type === 'DOWNLOAD' ? <Download className="h-5 w-5" /> :
                                                            <ExternalLink className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{material.title}</h4>
                                                    <p className="text-xs text-gray-500">{material.type}</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments Section */}
                        <LessonComments lessonId={lessonId as string} />
                    </div>
                </main>

                {/* Sidebar (Right) */}
                <aside className="w-80 hidden lg:block bg-white border-l z-0">
                    <CourseSidebar
                        course={course}
                        currentLessonId={lessonId as string}
                        completedLessonIds={completedLessons}
                        inProgressLessonIds={inProgressLessons}
                        progressPercentage={progressPercentage}
                    />
                </aside>
            </div>
        </div>
    )
}
