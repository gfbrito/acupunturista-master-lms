import { useState, useEffect } from "react"
import { spacesService, SpaceGroup, Space } from "@/services/spaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Edit2, LayoutGrid } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import EmojiPicker from 'emoji-picker-react';

export function SpacesAdmin() {
    const [groups, setGroups] = useState<SpaceGroup[]>([])
    const [loading, setLoading] = useState(true)

    // Group Form State
    const [newGroupTitle, setNewGroupTitle] = useState("")
    const [newGroupSlug, setNewGroupSlug] = useState("")

    // Space Dialog State
    const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false)
    const [isEditSpaceDialogOpen, setIsEditSpaceDialogOpen] = useState(false)
    const [selectedGroupId, setSelectedGroupId] = useState<string>("")

    // Create/Edit Form State
    const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
    const [spaceTitle, setSpaceTitle] = useState("")
    const [spaceSlug, setSpaceSlug] = useState("")
    const [spaceType, setSpaceType] = useState<string>("DISCUSSION")
    const [spaceAccess, setSpaceAccess] = useState<string>("PUBLIC")
    const [spaceIcon, setSpaceIcon] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const fetchGroups = async () => {
        try {
            const data = await spacesService.getSpaceGroups()
            setGroups(data)
            if (data.length > 0 && !selectedGroupId) {
                setSelectedGroupId(data[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch groups", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const handleCreateGroup = async () => {
        if (!newGroupTitle) {
            alert("Digite um título para o grupo")
            return
        }
        const slug = newGroupSlug || newGroupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        try {
            await spacesService.createSpaceGroup({
                title: newGroupTitle,
                slug: slug,
            })
            setNewGroupTitle("")
            setNewGroupSlug("")
            fetchGroups()
            alert("Grupo criado com sucesso!")
        } catch (error) {
            console.error("Failed to create group", error)
            alert("Erro ao criar grupo. Verifique o console.")
        }
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Delete this group and all its spaces?")) return
        try {
            await spacesService.deleteSpaceGroup(id)
            fetchGroups()
        } catch (error) {
            console.error("Failed to delete group", error)
        }
    }

    const resetForm = () => {
        setSpaceTitle("")
        setSpaceSlug("")
        setSpaceType("DISCUSSION")
        setSpaceAccess("PUBLIC")
        setSpaceIcon("")
        setEditingSpaceId(null)
        setShowEmojiPicker(false)
    }

    const handleCreateSpace = async () => {
        if (!selectedGroupId || !spaceTitle || !spaceSlug) return
        try {
            await spacesService.createSpace({
                spaceGroupId: selectedGroupId,
                title: spaceTitle,
                slug: spaceSlug,
                type: spaceType as any,
                accessLevel: spaceAccess as any,
                icon: spaceIcon || undefined
            })
            resetForm()
            setIsSpaceDialogOpen(false)
            fetchGroups()
        } catch (error) {
            console.error("Failed to create space", error)
        }
    }

    const handleEditSpace = (space: Space) => {
        setEditingSpaceId(space.id)
        setSpaceTitle(space.title)
        setSpaceSlug(space.slug)
        setSpaceType(space.type)
        setSpaceAccess(space.accessLevel)
        setSpaceIcon(space.icon || "")
        setSelectedGroupId(space.spaceGroupId || "") // Assuming space has spaceGroupId, check service
        setIsEditSpaceDialogOpen(true)
    }

    const handleUpdateSpace = async () => {
        if (!editingSpaceId || !spaceTitle || !spaceSlug) return
        try {
            await spacesService.updateSpace(editingSpaceId, {
                title: spaceTitle,
                slug: spaceSlug,
                type: spaceType as any,
                accessLevel: spaceAccess as any,
                icon: spaceIcon || undefined,
                spaceGroupId: selectedGroupId
            })
            resetForm()
            setIsEditSpaceDialogOpen(false)
            fetchGroups()
        } catch (error) {
            console.error("Failed to update space", error)
        }
    }

    const handleDeleteSpace = async (id: string) => {
        if (!confirm("Delete this space?")) return
        try {
            await spacesService.deleteSpace(id)
            fetchGroups()
        } catch (error) {
            console.error("Failed to delete space", error)
        }
    }

    // Auto-generate slug from title (only for new spaces)
    useEffect(() => {
        if (spaceTitle && !editingSpaceId) {
            setSpaceSlug(spaceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        }
    }, [spaceTitle, editingSpaceId])

    const onEmojiClick = (emojiObject: any) => {
        setSpaceIcon(emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    if (loading) return <div>Loading spaces...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Community Structure</h2>
                <Dialog open={isSpaceDialogOpen} onOpenChange={(open) => {
                    setIsSpaceDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Space
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Space</DialogTitle>
                            <DialogDescription>
                                Add a new space to your community.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="group" className="text-right">Group</Label>
                                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" value={spaceTitle} onChange={(e) => setSpaceTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="slug" className="text-right">Slug</Label>
                                <Input id="slug" value={spaceSlug} onChange={(e) => setSpaceSlug(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select value={spaceType} onValueChange={setSpaceType}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DISCUSSION">Discussion</SelectItem>
                                        <SelectItem value="COURSE">Course</SelectItem>
                                        <SelectItem value="EVENT">Event</SelectItem>
                                        <SelectItem value="MEMBERS">Members</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="access" className="text-right">Access</Label>
                                <Select value={spaceAccess} onValueChange={setSpaceAccess}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                        <SelectItem value="PRIVATE">Private</SelectItem>
                                        <SelectItem value="SECRET">Secret</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">Icon</Label>
                                <div className="col-span-3 space-y-2">
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                            {spaceIcon || "Select Emoji"}
                                        </Button>
                                        {spaceIcon && <Button variant="ghost" onClick={() => setSpaceIcon("")}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                    {showEmojiPicker && (
                                        <div className="absolute z-10">
                                            <EmojiPicker onEmojiClick={onEmojiClick} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateSpace}>Create Space</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditSpaceDialogOpen} onOpenChange={(open) => {
                    setIsEditSpaceDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Space</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-group" className="text-right">Group</Label>
                                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">Title</Label>
                                <Input id="edit-title" value={spaceTitle} onChange={(e) => setSpaceTitle(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-slug" className="text-right">Slug</Label>
                                <Input id="edit-slug" value={spaceSlug} onChange={(e) => setSpaceSlug(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">Type</Label>
                                <Select value={spaceType} onValueChange={setSpaceType}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DISCUSSION">Discussion</SelectItem>
                                        <SelectItem value="COURSE">Course</SelectItem>
                                        <SelectItem value="EVENT">Event</SelectItem>
                                        <SelectItem value="MEMBERS">Members</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-access" className="text-right">Access</Label>
                                <Select value={spaceAccess} onValueChange={setSpaceAccess}>
                                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                        <SelectItem value="PRIVATE">Private</SelectItem>
                                        <SelectItem value="SECRET">Secret</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">Icon</Label>
                                <div className="col-span-3 space-y-2">
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                            {spaceIcon || "Select Emoji"}
                                        </Button>
                                        {spaceIcon && <Button variant="ghost" onClick={() => setSpaceIcon("")}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                    {showEmojiPicker && (
                                        <div className="absolute z-10">
                                            <EmojiPicker onEmojiClick={onEmojiClick} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdateSpace}>Update Space</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Create Group Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Create Space Group</CardTitle>
                    <CardDescription>Groups organize your spaces in the sidebar.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="groupTitle">Title</Label>
                        <Input
                            id="groupTitle"
                            value={newGroupTitle}
                            onChange={e => setNewGroupTitle(e.target.value)}
                            placeholder="e.g. General"
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="groupSlug">Slug</Label>
                        <Input
                            id="groupSlug"
                            value={newGroupSlug}
                            onChange={e => setNewGroupSlug(e.target.value)}
                            placeholder="e.g. general"
                        />
                    </div>
                    <Button onClick={handleCreateGroup}>Create Group</Button>
                </CardContent>
            </Card>

            {/* List Groups and Spaces */}
            <div className="space-y-6">
                {groups.map(group => (
                    <Card key={group.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <LayoutGrid size={20} className="text-gray-400" />
                                {group.title}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Spaces List */}
                                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                    {group.spaces.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No spaces in this group.</p>
                                    )}
                                    {group.spaces.map(space => (
                                        <div key={space.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{space.icon || "Hash"}</span>
                                                <div>
                                                    <div className="font-medium">{space.title}</div>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span className="bg-white px-1.5 py-0.5 rounded border">{space.type}</span>
                                                        <span className="bg-white px-1.5 py-0.5 rounded border">{space.accessLevel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditSpace(space)}>
                                                    <Edit2 className="h-4 w-4 text-gray-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSpace(space.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
