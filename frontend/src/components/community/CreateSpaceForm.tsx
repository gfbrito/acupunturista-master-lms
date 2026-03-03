"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { spacesService, SpaceGroup } from "@/services/spaces"
import { ImageUpload } from "@/components/ui/ImageUpload"
import EmojiPicker from 'emoji-picker-react'
import { Smile, Trash2 } from "lucide-react"

interface CreateSpaceFormProps {
    onSubmit: (data: any) => void
    onCancel: () => void
}

export function CreateSpaceForm({ onSubmit, onCancel }: CreateSpaceFormProps) {
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [type, setType] = useState("DISCUSSION")
    const [accessLevel, setAccessLevel] = useState("PUBLIC")
    const [spaceGroupId, setSpaceGroupId] = useState("")
    const [coverUrl, setCoverUrl] = useState("")
    const [isDynamicCover, setIsDynamicCover] = useState(false)
    const [groups, setGroups] = useState<SpaceGroup[]>([])
    const [icon, setIcon] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await spacesService.getSpaceGroups()
                setGroups(data)
                if (data.length > 0) {
                    setSpaceGroupId(data[0].id)
                }
            } catch (error) {
                console.error("Failed to fetch space groups", error)
            }
        }
        fetchGroups()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            title,
            slug,
            type,
            accessLevel,
            spaceGroupId,
            coverUrl: isDynamicCover ? undefined : coverUrl,
            isDynamicCover,
            icon: icon || undefined
        })
    }

    const onEmojiClick = (emojiObject: any) => {
        setIcon(emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon Selector */}
            <div className="space-y-2">
                <Label>Ícone do Espaço</Label>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="text-2xl h-12 w-12 p-0"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        {icon || <Smile size={20} className="text-gray-400" />}
                    </Button>
                    {icon && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIcon("")}
                        >
                            <Trash2 size={16} className="text-red-500" />
                        </Button>
                    )}
                    <span className="text-sm text-gray-500">
                        {icon ? "Clique para mudar" : "Selecione um emoji"}
                    </span>
                </div>
                {showEmojiPicker && (
                    <div className="absolute z-50 mt-2">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Nome</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="DISCUSSION">Discussão</option>
                    <option value="COURSE">Curso</option>
                    <option value="EVENT">Evento</option>
                    <option value="MEMBERS">Membros</option>
                    <option value="GALLERY">Galeria</option>
                    <option value="CHAT">Chat</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="group">Grupo do Espaço</Label>
                <select
                    id="group"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={spaceGroupId}
                    onChange={(e) => setSpaceGroupId(e.target.value)}
                    required
                >
                    <option value="" disabled>Selecione um grupo</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.title}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <Label>Capa (Opcional)</Label>
                {!isDynamicCover && (
                    <ImageUpload
                        value={coverUrl}
                        onChange={(url) => setCoverUrl(url)}
                        label="Upload Cover"
                        disabled={isDynamicCover}
                    />
                )}
                {isDynamicCover && (
                    <div className="p-4 border rounded-md bg-gray-50 text-gray-500 text-sm italic text-center">
                        Usando Gradiente Dinâmico
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isDynamicCover"
                    checked={isDynamicCover}
                    onChange={(e) => setIsDynamicCover(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDynamicCover">Usar Capa Dinâmica</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Criar Espaço</Button>
            </div>
        </form>
    )
}
