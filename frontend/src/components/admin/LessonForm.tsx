import React, { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useUpload } from "@/contexts/UploadContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, FileText, Link as LinkIcon, Download } from "lucide-react";

interface Material {
    title: string;
    type: 'PDF' | 'LINK' | 'DOWNLOAD';
    url: string;
}

interface LessonFormData {
    title: string;
    content: string;
    videoType: 'YOUTUBE' | 'VIMEO' | 'BUNNY';
    videoUrl: string;
    durationSeconds: number;
    isPublished: boolean;
    materials: Material[];
}



interface LessonFormProps {
    initialData?: Partial<LessonFormData>;
    onSubmit: (data: LessonFormData, createAnother: boolean) => void;
    onCancel: () => void;
}

export function LessonForm({ initialData, onSubmit, onCancel }: LessonFormProps) {
    // Reset form when initialData changes (important for "Create Another" flow)
    useEffect(() => {
        setFormData({
            title: initialData?.title || "",
            content: initialData?.content || "",
            videoType: initialData?.videoType || "YOUTUBE",
            videoUrl: initialData?.videoUrl || "",
            durationSeconds: initialData?.durationSeconds || 0,
            isPublished: initialData?.isPublished ?? false,
            materials: initialData?.materials || []
        });
    }, [initialData]);

    const [formData, setFormData] = useState<LessonFormData>({
        title: initialData?.title || "",
        content: initialData?.content || "",
        videoType: initialData?.videoType || "YOUTUBE",
        videoUrl: initialData?.videoUrl || "",
        durationSeconds: initialData?.durationSeconds || 0,
        isPublished: initialData?.isPublished ?? false,
        materials: initialData?.materials || []
    });

    const [newMaterial, setNewMaterial] = useState<Material>({ title: "", type: "PDF", url: "" });
    const { startUpload } = useUpload();
    const [createAnother, setCreateAnother] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic: Set valid bunny URL immediately
        setUploading(true);
        try {
            const { embedUrl } = await startUpload(file, formData.title || file.name);

            // Set the full embed URL for immediate use
            setFormData(prev => ({
                ...prev,
                videoType: 'BUNNY',
                videoUrl: embedUrl
            }));

        } catch (error) {
            // handled by context
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (field: keyof LessonFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddMaterial = () => {
        if (!newMaterial.title || !newMaterial.url) return;
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, newMaterial]
        }));
        setNewMaterial({ title: "", type: "PDF", url: "" });
    };

    const handleRemoveMaterial = (index: number) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, createAnother);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título da Aula</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={e => handleChange("title", e.target.value)}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="content">Descrição / Conteúdo</Label>
                    <Textarea
                        id="content"
                        value={formData.content}
                        onChange={e => handleChange("content", e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="videoType">Provedor de Vídeo</Label>
                        <Select
                            value={formData.videoType}
                            onValueChange={(val: any) => handleChange("videoType", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                <SelectItem value="VIMEO">Vimeo</SelectItem>
                                <SelectItem value="BUNNY">Bunny.net</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="videoUrl">ID ou URL do Vídeo</Label>
                        <div className="flex gap-2">
                            <Input
                                id="videoUrl"
                                value={formData.videoUrl}
                                onChange={e => handleChange("videoUrl", e.target.value)}
                                placeholder={formData.videoType === 'BUNNY' ? "ID do vídeo ou Upload" : "URL do vídeo"}
                            />
                        </div>
                        {formData.videoType === 'BUNNY' && (
                            <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                                <Label className="mb-2 block">Upload Direto (Bunny.net)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">O upload continuará em segundo plano se você salvar.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duração (segundos)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={formData.durationSeconds}
                            onChange={e => handleChange("durationSeconds", parseInt(e.target.value))}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={e => handleChange("isPublished", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isPublished">Publicada?</Label>
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Materiais de Apoio</h3>

                <div className="space-y-2 mb-4">
                    {formData.materials.map((mat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center gap-2">
                                {mat.type === 'PDF' && <FileText className="h-4 w-4 text-red-500" />}
                                {mat.type === 'LINK' && <LinkIcon className="h-4 w-4 text-blue-500" />}
                                {mat.type === 'DOWNLOAD' && <Download className="h-4 w-4 text-green-500" />}
                                <span className="text-sm font-medium">{mat.title}</span>
                                <span className="text-xs text-gray-400">({mat.type})</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMaterial(idx)}
                                className="text-red-500 h-6 w-6 p-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {formData.materials.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Nenhum material adicionado.</p>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-gray-50/50">
                    <div className="col-span-3">
                        <Label className="text-xs">Tipo</Label>
                        <Select
                            value={newMaterial.type}
                            onValueChange={(val: any) => setNewMaterial(prev => ({ ...prev, type: val }))}
                        >
                            <SelectTrigger className="h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="LINK">Link</SelectItem>
                                <SelectItem value="DOWNLOAD">Download</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-4">
                        <Label className="text-xs">Título</Label>
                        <Input
                            value={newMaterial.title}
                            onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                            className="h-8"
                            placeholder="Ex: Apostila"
                        />
                    </div>
                    <div className="col-span-4">
                        <Label className="text-xs">URL</Label>
                        <Input
                            value={newMaterial.url}
                            onChange={e => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                            className="h-8"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="col-span-1">
                        <Button type="button" size="sm" className="h-8 w-full" onClick={handleAddMaterial}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="create-another"
                        checked={createAnother}
                        onCheckedChange={setCreateAnother}
                    />
                    <Label htmlFor="create-another" className="text-sm">Criar outra aula</Label>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-500">
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="text-gray-600 border-gray-300 hover:bg-gray-100"
                        onClick={() => {
                            const draftData = { ...formData, isPublished: false };
                            onSubmit(draftData, createAnother);
                        }}
                    >
                        Salvar Rascunho
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => handleChange("isPublished", true)}
                    >
                        Publicar
                    </Button>
                </div>
            </div>
        </form>
    );
}
