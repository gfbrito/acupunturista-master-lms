"use client"

import { useState, useEffect } from "react"
import { rolesService, CustomRole } from "@/services/roles"
import { coursesService } from "@/services/courses"
import { spacesService } from "@/services/spaces"
import { pagesService } from "@/services/pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RolesAdmin() {
    const [roles, setRoles] = useState<CustomRole[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<CustomRole | null>(null)

    // Selection Data
    const [allCourses, setAllCourses] = useState<any[]>([])
    const [allSpaces, setAllSpaces] = useState<any[]>([])
    const [allPages, setAllPages] = useState<any[]>([])

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hasFullAccess: false,
        courseIds: [] as string[],
        spaceIds: [] as string[],
        pageIds: [] as string[]
    })

    const fetchData = async () => {
        try {
            const [rolesData, coursesData, spacesData, pagesData] = await Promise.all([
                rolesService.getAll(),
                coursesService.getCourses(),
                spacesService.getAllSpaces(),
                pagesService.getAll(false)
            ])
            setRoles(rolesData)
            setAllCourses(coursesData)
            setAllSpaces(spacesData)
            setAllPages(pagesData)
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingRole) {
                await rolesService.update(editingRole.id, formData)
            } else {
                await rolesService.create(formData)
            }
            setIsDialogOpen(false)
            setEditingRole(null)
            resetForm()
            fetchData()
        } catch (error) {
            console.error("Failed to save role", error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            hasFullAccess: false,
            courseIds: [],
            spaceIds: [],
            pageIds: []
        })
    }

    const handleEdit = (role: CustomRole) => {
        setEditingRole(role)
        setFormData({
            name: role.name,
            description: role.description || "",
            hasFullAccess: role.hasFullAccess,
            courseIds: role.courses.map(c => c.id),
            spaceIds: role.spaces.map(s => s.id),
            pageIds: role.pages.map(p => p.id)
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return
        try {
            await rolesService.delete(id)
            fetchData()
        } catch (error) {
            console.error("Failed to delete role", error)
        }
    }

    const toggleSelection = (id: string, type: 'courseIds' | 'spaceIds' | 'pageIds') => {
        setFormData(prev => {
            const current = prev[type]
            const updated = current.includes(id)
                ? current.filter(item => item !== id)
                : [...current, id]
            return { ...prev, [type]: updated }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Roles & Permissions</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingRole(null)
                            resetForm()
                        }}>
                            <Plus size={16} className="mr-2" /> Create Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
                                <Switch
                                    id="full-access"
                                    checked={formData.hasFullAccess}
                                    onCheckedChange={checked => setFormData({ ...formData, hasFullAccess: checked })}
                                />
                                <Label htmlFor="full-access" className="font-medium cursor-pointer">
                                    Full Access (Admin Level)
                                </Label>
                            </div>

                            {!formData.hasFullAccess && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Courses Selection */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Courses Access</Label>
                                        <ScrollArea className="h-[200px] border rounded-md p-2">
                                            {allCourses.map(course => (
                                                <div key={course.id} className="flex items-center space-x-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`course-${course.id}`}
                                                        checked={formData.courseIds.includes(course.id)}
                                                        onChange={() => toggleSelection(course.id, 'courseIds')}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label htmlFor={`course-${course.id}`} className="text-sm cursor-pointer truncate">
                                                        {course.title}
                                                    </label>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>

                                    {/* Spaces Selection */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Spaces Access</Label>
                                        <ScrollArea className="h-[200px] border rounded-md p-2">
                                            {allSpaces.map(space => (
                                                <div key={space.id} className="flex items-center space-x-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`space-${space.id}`}
                                                        checked={formData.spaceIds.includes(space.id)}
                                                        onChange={() => toggleSelection(space.id, 'spaceIds')}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label htmlFor={`space-${space.id}`} className="text-sm cursor-pointer truncate">
                                                        {space.title}
                                                    </label>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>

                                    {/* Pages Selection */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Pages Access</Label>
                                        <ScrollArea className="h-[200px] border rounded-md p-2">
                                            {allPages.map(page => (
                                                <div key={page.id} className="flex items-center space-x-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`page-${page.id}`}
                                                        checked={formData.pageIds.includes(page.id)}
                                                        onChange={() => toggleSelection(page.id, 'pageIds')}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label htmlFor={`page-${page.id}`} className="text-sm cursor-pointer truncate">
                                                        {page.title}
                                                    </label>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Role</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Access Level</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map(role => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-xs text-gray-500">{role.description}</div>
                                </TableCell>
                                <TableCell>
                                    {role.hasFullAccess ? (
                                        <Badge className="bg-green-600">Full Access</Badge>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {role.courses.length > 0 && <Badge variant="outline">{role.courses.length} Courses</Badge>}
                                            {role.spaces.length > 0 && <Badge variant="outline">{role.spaces.length} Spaces</Badge>}
                                            {role.pages.length > 0 && <Badge variant="outline">{role.pages.length} Pages</Badge>}
                                            {role.courses.length === 0 && role.spaces.length === 0 && role.pages.length === 0 && (
                                                <span className="text-gray-400 text-sm">No specific access</span>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <UserIcon size={14} />
                                        <span>{role._count?.users || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                        <Pencil size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id)} className="text-red-600">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function UserIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
