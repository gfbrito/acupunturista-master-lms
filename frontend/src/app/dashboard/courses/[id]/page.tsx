"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlayCircle, CheckCircle, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CourseReviews } from "@/components/course/CourseReviews"

export default function CourseDetailPage() {
    const { id } = useParams()
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`)
                setCourse(res.data)
            } catch (error) {
                console.error("Error fetching course", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchCourse()
    }, [id])

    const handleDownloadCertificate = async () => {
        try {
            const response = await api.post(`/certificates/generate/${id}`, {}, {
                responseType: 'blob'
            })

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${course.title}-Certificate.pdf`); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Certificate downloaded successfully!")
        } catch (error) {
            console.error("Error downloading certificate", error)
            toast.error("Failed to generate certificate. Please try again.")
        }
    }

    if (loading) return <div>Loading course...</div>
    if (!course) return <div>Course not found</div>

    return (
        <div className="space-y-6">
            {course.bannerUrl && (
                <div className="w-full h-64 md:h-80 relative rounded-xl overflow-hidden mb-6">
                    <img
                        src={course.bannerUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{course.title}</h2>
                    </div>
                </div>
            )}
            {!course.bannerUrl && (
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
                </div>
            )}
            <p className="text-gray-500">{course.description}</p>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Course Content</CardTitle>
                    <div className="text-sm font-medium text-muted-foreground">
                        {course.completedLessons || 0}/{course.totalLessons || 0} lessons completed
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Certificate Banner - Only if 100% complete and hasCertificate is true */}
                    {course.hasCertificate && (course.completedLessons === course.totalLessons) && (course.totalLessons > 0) && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-900">Congratulations! Course Completed</h3>
                                    <p className="text-sm text-green-700">You have successfully completed all lessons.</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleDownloadCertificate}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Award className="mr-2 h-4 w-4" />
                                Download Certificate
                            </Button>
                        </div>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                        {course.modules.map((module: any) => (
                            <AccordionItem key={module.id} value={module.id}>
                                <AccordionTrigger>{module.title}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2">
                                        {module.lessons.map((lesson: any) => (
                                            <Link
                                                key={lesson.id}
                                                href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <PlayCircle className="mr-2 h-4 w-4 text-primary" />
                                                    <span>{lesson.title}</span>
                                                </div>
                                                {/* Placeholder for completed status */}
                                                {/* <CheckCircle className="h-4 w-4 text-green-500" /> */}
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Course Reviews */}
            <CourseReviews courseId={id as string} />
        </div>
    )
}
