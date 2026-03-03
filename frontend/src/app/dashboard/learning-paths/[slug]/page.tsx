"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { learningPathsService, LearningPath } from "@/services/learningPaths"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, PlayCircle, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LearningPathPage() {
    const { slug } = useParams()
    const { t } = useLanguage()
    const [path, setPath] = useState<LearningPath | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (slug) {
            fetchPath(slug as string)
        }
    }, [slug])

    const fetchPath = async (slug: string) => {
        try {
            const data = await learningPathsService.getBySlug(slug)
            setPath(data)
        } catch (error) {
            console.error("Failed to fetch path", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8" /></div>
    if (!path) return <div className="text-center py-20">Learning Path not found</div>

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="relative rounded-xl overflow-hidden mb-10 bg-gradient-to-r from-primary/10 to-primary/5 border">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                    {path.coverUrl && (
                        <img
                            src={path.coverUrl}
                            alt={path.title}
                            className="w-full md:w-64 h-40 object-cover rounded-lg shadow-lg"
                        />
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4">
                            Learning Path
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{path.title}</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">{path.description}</p>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Your Journey</h2>
                <div className="space-y-4 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border hidden md:block" />

                    {path.courses.map((item, index) => (
                        <div key={item.id} className="relative pl-0 md:pl-16">
                            {/* Number Bubble */}
                            <div className="absolute left-2 top-6 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center z-10 hidden md:flex">
                                {index + 1}
                            </div>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                    {item.course.thumbnail && (
                                        <img
                                            src={item.course.thumbnail}
                                            alt={item.course.title}
                                            className="w-full md:w-48 h-32 object-cover rounded-md"
                                        />
                                    )}
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-semibold mb-2">{item.course.title}</h3>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            <Link href={`/dashboard/courses/${item.course.slug}`}>
                                                <Button>
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Start Course
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
