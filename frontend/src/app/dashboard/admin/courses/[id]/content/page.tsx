"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react"
import Link from "next/link"
import { LessonForm } from "@/components/admin/LessonForm"
import { CertificateDesigner } from "@/components/admin/CertificateDesigner"
import { toast } from "sonner"

export default function CourseContentPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Module State
    const [newModuleTitle, setNewModuleTitle] = useState("")
    const [editingModule, setEditingModule] = useState<any>(null)
    const [editModuleTitle, setEditModuleTitle] = useState("")

    // Lesson State
    const [editingLesson, setEditingLesson] = useState<any>(null)
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
    const [formKey, setFormKey] = useState(0)

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${courseId}`)
            setCourse(res.data)
        } catch (error) {
            console.error("Error fetching course", error)
            toast.error("Failed to fetch course details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (courseId) {
            fetchCourse()
        }
    }, [courseId])

    // --- Module Handlers ---

    const handleCreateModule = async () => {
        if (!newModuleTitle) return
        try {
            await api.post(`/courses/${courseId}/modules`, { title: newModuleTitle, order: course.modules.length + 1 })
            setNewModuleTitle("")
            toast.success("Module created")
            fetchCourse()
        } catch (error) {
            console.error("Error creating module", error)
            toast.error("Failed to create module")
        }
    }

    const handleUpdateModule = async () => {
        if (!editingModule || !editModuleTitle) return
        try {
            await api.post(`/modules/${editingModule.id}`, { title: editModuleTitle })
            setEditingModule(null)
            toast.success("Module updated")
            fetchCourse()
        } catch (error) {
            console.error("Error updating module", error)
            toast.error("Failed to update module")
        }
    }

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Delete this module?")) return
        try {
            await api.delete(`/modules/${moduleId}`)
            toast.success("Module deleted")
            fetchCourse()
        } catch (error) {
            console.error("Error deleting module", error)
            toast.error("Failed to delete module")
        }
    }

    // --- Lesson Handlers ---

    const handleCreateLesson = (moduleId: string) => {
        setActiveModuleId(moduleId)
        setEditingLesson(null) // Null means creating new
        setIsLessonDialogOpen(true)
    }

    const handleEditLesson = (lesson: any) => {
        setEditingLesson({
            ...lesson,
            videoUrl: lesson.videoId || lesson.videoUrl || ""
        })
        setIsLessonDialogOpen(true)
    }

    const handleSaveLesson = async (data: any, createAnother: boolean = false) => {
        try {
            if (editingLesson) {
                // Update
                await api.post(`/lessons/${editingLesson.id}`, data)
                toast.success("Lesson updated")
            } else {
                // Create
                if (!activeModuleId) {
                    toast.error("Erro interno: ID do módulo não encontrado.")
                    return
                }
                const module = course.modules.find((m: any) => m.id === activeModuleId)
                const order = module ? module.lessons.length + 1 : 1

                await api.post(`/modules/${activeModuleId}/lessons`, { ...data, order })
                toast.success("Lesson created")
            }

            if (createAnother) {
                // Reset interface for new lesson
                setEditingLesson(null)
                setFormKey(prev => prev + 1)
                toast.success("Ready for next lesson!")
            } else {
                setIsLessonDialogOpen(false)
            }

            fetchCourse()
        } catch (error) {
            console.error("Error saving lesson", error)
            toast.error("Failed to save lesson")
        }
    }

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Delete this lesson?")) return
        try {
            await api.delete(`/lessons/${lessonId}`)
            toast.success("Lesson deleted")
            fetchCourse()
        } catch (error) {
            console.error("Error deleting lesson", error)
            toast.error("Failed to delete lesson")
        }
    }

    // Course Settings State
    const [settingsForm, setSettingsForm] = useState<any>({
        title: "",
        description: "",
        slug: "",
        thumbnail: "",
        defaultAccessDays: 365,
        hasCertificate: false,
        totalHours: 0,
        certificateSettings: {}
    })

    useEffect(() => {
        if (course) {
            setSettingsForm({
                title: course.title || "",
                description: course.description || "",
                slug: course.slug || "",
                thumbnail: course.thumbnail || "",
                defaultAccessDays: course.defaultAccessDays || 365,
                hasCertificate: course.hasCertificate || false,
                totalHours: course.totalHours || 0,
                certificateSettings: course.certificateSettings || {}
            })
        }
    }, [course])

    const handleUpdateCourseSettings = async () => {
        try {
            await api.post(`/courses/${courseId}`, settingsForm)
            toast.success("Course settings updated")
            fetchCourse()
        } catch (error) {
            console.error("Error updating course settings", error)
            toast.error("Failed to update course settings")
        }
    }

    if (loading) return <div>Loading...</div>
    if (!course) return <div>Course not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-gray-500">Manage course content and settings</p>
                </div>
                <Link href="/dashboard/admin">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <Tabs defaultValue="content" className="w-full">
                <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="certificate">Certificate</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Modules</CardTitle>
                            <CardDescription>Add and organize course modules.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="New Module Title"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                />
                                <Button onClick={handleCreateModule}>Add Module</Button>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {course.modules.map((module: any) => (
                                    <AccordionItem key={module.id} value={module.id}>
                                        <AccordionTrigger className="hover:no-underline group">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{module.title}</span>
                                                    <span className="text-xs text-gray-400 font-normal">({module.lessons.length} lessons)</span>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div
                                                        role="button"
                                                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "cursor-pointer")}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingModule(module)
                                                            setEditModuleTitle(module.title)
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <div
                                                        role="button"
                                                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-red-500 hover:text-red-700 cursor-pointer")}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteModule(module.id)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4 bg-gray-50/50 p-4 rounded-b-lg">
                                            <div className="space-y-2">
                                                {module.lessons.map((lesson: any) => (
                                                    <div key={lesson.id} className="flex items-center justify-between border p-3 rounded bg-white shadow-sm group">
                                                        <div className="flex items-center gap-3">
                                                            <GripVertical className="h-4 w-4 text-gray-300" />
                                                            <div>
                                                                <p className="font-medium text-sm">{lesson.title}</p>
                                                                <div className="flex gap-2 text-xs text-gray-400">
                                                                    <span>{lesson.durationSeconds ? `${Math.round(lesson.durationSeconds / 60)} min` : '0 min'}</span>
                                                                    <span>•</span>
                                                                    <span className={lesson.isPublished ? "text-green-600" : "text-amber-600"}>
                                                                        {lesson.isPublished ? "Published" : "Draft"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditLesson(lesson)}
                                                            >
                                                                <Pencil className="h-4 w-4 text-gray-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500"
                                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2 border-dashed"
                                                    onClick={() => handleCreateLesson(module.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" /> Add Lesson
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Update course details and configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    value={settingsForm.title}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={settingsForm.slug}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={settingsForm.description}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                                <Input
                                    id="thumbnail"
                                    value={settingsForm.thumbnail}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, thumbnail: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="totalHours">Total Hours</Label>
                                    <Input
                                        id="totalHours"
                                        type="number"
                                        value={settingsForm.totalHours}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, totalHours: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="defaultAccessDays">Access Duration (Days)</Label>
                                    <Input
                                        id="defaultAccessDays"
                                        type="number"
                                        value={settingsForm.defaultAccessDays}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultAccessDays: parseInt(e.target.value) || 365 })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="hasCertificate"
                                    checked={settingsForm.hasCertificate}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, hasCertificate: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="hasCertificate">Includes Certificate?</Label>
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleUpdateCourseSettings}>Save Settings</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="certificate" className="h-[calc(100vh-200px)]">
                    <CertificateDesigner
                        initialSettings={settingsForm.certificateSettings || {}}
                        hasCertificate={settingsForm.hasCertificate}
                        courseTitle={settingsForm.title}
                        onToggleChange={(enabled) => setSettingsForm({ ...settingsForm, hasCertificate: enabled })}
                        onSettingsChange={(newSettings) => setSettingsForm({ ...settingsForm, certificateSettings: newSettings })}
                        onSave={handleUpdateCourseSettings}
                    />
                </TabsContent>
            </Tabs>

            {/* Edit Module Dialog */}
            <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Module Title</Label>
                            <Input value={editModuleTitle} onChange={(e) => setEditModuleTitle(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingModule(null)}>Cancel</Button>
                        <Button onClick={handleUpdateModule}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit/Create Lesson Dialog */}
            <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
                    </DialogHeader>
                    <LessonForm
                        key={formKey}
                        initialData={editingLesson || {}}
                        onSubmit={handleSaveLesson}
                        onCancel={() => setIsLessonDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div >
    )
}
