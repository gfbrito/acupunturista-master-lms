"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { useLanguage } from "@/contexts/LanguageContext"

interface CreateCourseModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateCourseModal({ open, onOpenChange, onSuccess }: CreateCourseModalProps) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [bannerUrl, setBannerUrl] = useState("")
    const [hasCertificate, setHasCertificate] = useState(false)
    const { t } = useLanguage()

    const handleCreate = async () => {
        setLoading(true)
        try {
            await api.post('/courses', {
                title,
                slug,
                description,
                thumbnail,
                bannerUrl,
                hasCertificate
            })

            // Reset form
            setTitle("")
            setSlug("")
            setDescription("")
            setThumbnail("")
            setBannerUrl("")
            setHasCertificate(false)

            onSuccess()
            onOpenChange(false)
            alert(t("Course created successfully!"))
        } catch (error: any) {
            console.error("Failed to create course", error)
            alert(t("Failed to create course: ") + (error.response?.data?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('Create Course')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">{t('Title')}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to React"
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="slug">{t('Slug (URL)')}</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. intro-to-react"
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="description">{t('Description')}</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label>{t('Thumbnail')}</Label>
                        <ImageUpload
                            value={thumbnail}
                            onChange={(url) => setThumbnail(url)}
                            label="Upload Thumbnail"
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label>{t('Banner')}</Label>
                        <ImageUpload
                            value={bannerUrl}
                            onChange={(url) => setBannerUrl(url)}
                            label="Upload Banner"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="hasCertificate"
                            checked={hasCertificate}
                            onChange={(e) => setHasCertificate(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="hasCertificate">{t('Includes Certificate')}</Label>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCreate} disabled={loading}>
                        {loading ? "Creating..." : t('Create Course')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
