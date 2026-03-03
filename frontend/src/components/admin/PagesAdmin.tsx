"use client"

import { useState, useEffect } from "react"
import { pagesService, CustomPage } from "@/services/pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"

export function PagesAdmin() {
    const [pages, setPages] = useState<CustomPage[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPage, setEditingPage] = useState<CustomPage | null>(null)
    const [formData, setFormData] = useState({ title: "", slug: "", content: "", isVisible: true })

    const fetchPages = async () => {
        try {
            const data = await pagesService.getAll(false)
            setPages(data)
        } catch (error) {
            console.error("Failed to fetch pages", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPages()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPage) {
                await pagesService.update(editingPage.id, formData)
            } else {
                await pagesService.create(formData)
            }
            setIsDialogOpen(false)
            setEditingPage(null)
            setFormData({ title: "", slug: "", content: "", isVisible: true })
            fetchPages()
            window.dispatchEvent(new Event('sidebar:refresh'))
        } catch (error) {
            console.error("Failed to save page", error)
        }
    }

    const handleEdit = (page: CustomPage) => {
        setEditingPage(page)
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            isVisible: page.isVisible
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page?")) return
        try {
            await pagesService.delete(id)
            fetchPages()
            window.dispatchEvent(new Event('sidebar:refresh'))
        } catch (error) {
            console.error("Failed to delete page", error)
        }
    }

    const handleToggleVisibility = async (page: CustomPage) => {
        try {
            await pagesService.update(page.id, { isVisible: !page.isVisible })
            fetchPages()
            window.dispatchEvent(new Event('sidebar:refresh'))
        } catch (error) {
            console.error("Failed to update visibility", error)
        }
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Custom Pages</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingPage(null)
                            setFormData({ title: "", slug: "", content: "", isVisible: true })
                        }}>
                            <Plus size={16} className="mr-2" /> Create Page
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={e => {
                                        const newTitle = e.target.value
                                        setFormData(prev => ({
                                            ...prev,
                                            title: newTitle,
                                            slug: !editingPage ? generateSlug(newTitle) : prev.slug
                                        }))
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Slug</label>
                                <Input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Content (HTML)</label>
                                <Textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="h-64 font-mono"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isVisible"
                                    checked={formData.isVisible}
                                    onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                />
                                <label htmlFor="isVisible" className="text-sm">Visible in Sidebar</label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map(page => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium">{page.title}</TableCell>
                                <TableCell>{page.slug}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleVisibility(page)}
                                        className={page.isVisible ? "text-green-600" : "text-gray-400"}
                                    >
                                        {page.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                                        <Pencil size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)} className="text-red-600">
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
