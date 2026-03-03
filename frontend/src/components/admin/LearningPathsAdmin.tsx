"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { learningPathsService, LearningPath } from "@/services/learningPaths"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { toast } from "sonner"
import { Loader2, Plus, Trash, GripVertical } from "lucide-react"
import { api } from "@/lib/api"

export function LearningPathsAdmin() {
    const [paths, setPaths] = useState<LearningPath[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        fetchPaths()
        fetchCourses()
    }, [])

    const fetchPaths = async () => {
        try {
            const data = await learningPathsService.getAll()
            setPaths(data)
        } catch (error) {
            toast.error("Failed to fetch learning paths")
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses')
            setCourses(res.data)
        } catch (error) {
            console.error("Failed to fetch courses")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this path?")) return
        try {
            await learningPathsService.delete(id)
            setPaths(paths.filter(p => p.id !== id))
            toast.success("Learning path deleted")
        } catch (error) {
            toast.error("Failed to delete path")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Learning Paths</h2>
                    <p className="text-muted-foreground">Create and manage course playlists.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Path</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Learning Path</DialogTitle>
                        </DialogHeader>
                        <CreatePathForm
                            courses={courses}
                            onSuccess={(newPath) => {
                                setPaths([newPath, ...paths])
                                setIsCreateOpen(false)
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid gap-4">
                    {paths.map(path => (
                        <Card key={path.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{path.title}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(path.id)}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Courses ({path.courses.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {path.courses.map((pc, idx) => (
                                            <div key={pc.id} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center">
                                                <span className="mr-2 font-mono text-muted-foreground">{idx + 1}.</span>
                                                {pc.course.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {paths.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            No learning paths created yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function CreatePathForm({ courses, onSuccess }: { courses: any[], onSuccess: (path: LearningPath) => void }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [coverUrl, setCoverUrl] = useState("")
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const newPath = await learningPathsService.create({
                title,
                description,
                coverUrl,
                courseIds: selectedCourses
            })
            toast.success("Learning path created!")
            onSuccess(newPath)
        } catch (error) {
            toast.error("Failed to create path")
        } finally {
            setLoading(false)
        }
    }

    const toggleCourse = (courseId: string) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId))
        } else {
            setSelectedCourses([...selectedCourses, courseId])
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Full Stack Developer" />
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description of this track" />
            </div>

            <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload value={coverUrl} onChange={setCoverUrl} label="Upload Cover" />
            </div>

            <div className="space-y-2">
                <Label>Select Courses (In Order)</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className={`flex items-center p-2 rounded-md cursor-pointer border ${selectedCourses.includes(course.id) ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}`}
                            onClick={() => toggleCourse(course.id)}
                        >
                            <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedCourses.includes(course.id) ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                {selectedCourses.includes(course.id) && <span className="text-[10px] text-white font-bold">{selectedCourses.indexOf(course.id) + 1}</span>}
                            </div>
                            <span className="text-sm font-medium">{course.title}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Click to select. The order of selection determines the path order.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Path
            </Button>
        </form>
    )
}
