"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { Award, Upload, Check, Type, Move, Trash2, Plus } from "lucide-react"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { cn } from "@/lib/utils"
// @ts-ignore
import Draggable from 'react-draggable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export interface CertificateElement {
    id: string
    type: 'text' | 'field'
    label: string
    content: string
    x: number
    y: number
    style: {
        fontSize: number
        fontFamily: string
        color: string
        fontWeight: string
        textAlign: 'left' | 'center' | 'right' | 'justify'
        width?: number
    }
}

const PDF_WIDTH = 842;
const PDF_HEIGHT = 595;

// Helper component to handle Draggable nodeRef strict mode compatibility
const DraggableItem = ({
    x,
    y,
    element,
    isSelected,
    onStop,
    onSelect
}: {
    x: number,
    y: number,
    element: CertificateElement,
    isSelected: boolean,
    onStop: (e: any, data: any) => void,
    onSelect: () => void
}) => {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            defaultPosition={{ x: x, y: y }}
            position={{ x: x, y: y }}
            onStop={onStop}
            onStart={onSelect}
        >
            <div
                ref={nodeRef}
                className={cn(
                    "absolute cursor-move hover:outline hover:outline-1 hover:outline-dashed hover:outline-gray-400 p-1",
                    isSelected ? "outline outline-2 outline-blue-500 z-50" : "z-10"
                )}
                style={{
                    fontSize: `${element.style.fontSize}px`,
                    fontFamily: element.style.fontFamily,
                    color: element.style.color,
                    fontWeight: element.style.fontWeight,
                    textAlign: element.style.textAlign as any,
                    minWidth: '100px',
                    whiteSpace: 'nowrap'
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect()
                }}
            >
                {element.type === 'field' ? element.content.replace(/{{|}}/g, '').toUpperCase() : element.content}
            </div>
        </Draggable>
    );
};

interface CertificateSettings {
    signerName?: string
    title?: string
    customText?: string
    templateId?: string
    backgroundImageUrl?: string
    elements?: CertificateElement[] // Custom elements for drag-and-drop mode
    isCustomMode?: boolean // Toggle state persistence
}

interface CertificateDesignerProps {
    initialSettings: CertificateSettings
    hasCertificate: boolean
    courseTitle: string
    onSettingsChange: (settings: CertificateSettings) => void
    onToggleChange: (enabled: boolean) => void
    onSave: () => void
}

interface Template {
    id: string
    name: string
    styles: {
        container?: React.CSSProperties
        border?: React.CSSProperties
        title?: React.CSSProperties
        body?: React.CSSProperties
        signature?: React.CSSProperties
    }
    previewColor: string
    decorations?: React.ReactNode
}

const TEMPLATES: Template[] = [
    {
        id: "chinese-tradition",
        name: "Chinese Tradition",
        previewColor: "#fdfbf7",
        styles: {
            container: {
                backgroundColor: "#fdfbf7",
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                position: 'relative'
            },
            border: {}, // Handled by decorations
            title: { fontFamily: "'Cinzel', serif", color: "#8B0000", fontSize: "2.5rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase" },
            body: { fontFamily: "'Playfair Display', serif", color: "#333", fontSize: "1.1rem" },
            signature: { fontFamily: "'Great Vibes', cursive", color: "#8B0000", fontSize: "1.5rem" }
        },
        decorations: (
            <>
                {/* Font Imports - Scoped locally to avoid global pollution in a complex app structure if possible, but global is simpler here */}
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Noto+Serif+SC:wght@300;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                `}</style>

                {/* Border Ornament */}
                <div className="absolute inset-8 border-2 border-[#8B0000] outline outline-1 outline-[#C5A059] outline-offset-4 z-10 pointer-events-none"></div>

                {/* Corners */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#8B0000] z-20"></div>
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#8B0000] z-20"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#8B0000] z-20"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#8B0000] z-20"></div>

                {/* Seal Removed */}
            </>
        )
    },
    {
        id: "jade-dynasty",
        name: "Jade Dynasty",
        previewColor: "#f0fdf4",
        styles: {
            container: {
                backgroundColor: "#f0fdf4",
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                position: 'relative'
            },
            border: {},
            title: { fontFamily: "'Cinzel', serif", color: "#064e3b", fontSize: "2.5rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase" },
            body: { fontFamily: "'Playfair Display', serif", color: "#065f46", fontSize: "1.1rem" },
            signature: { fontFamily: "'Great Vibes', cursive", color: "#064e3b", fontSize: "1.5rem" }
        },
        decorations: (
            <>
                {/* Border Ornament */}
                <div className="absolute inset-8 border-2 border-[#064e3b] outline outline-1 outline-[#d97706] outline-offset-4 z-10 pointer-events-none"></div>

                {/* Corners */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#064e3b] z-20"></div>
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#064e3b] z-20"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#064e3b] z-20"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#064e3b] z-20"></div>
            </>
        )
    },
    {
        id: "blue-porcelain",
        name: "Blue Porcelain",
        previewColor: "#f8fafc",
        styles: {
            container: {
                backgroundColor: "#f8fafc",
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a8a' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                position: 'relative'
            },
            border: {},
            title: { fontFamily: "'Cinzel', serif", color: "#1e3a8a", fontSize: "2.5rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase" },
            body: { fontFamily: "'Playfair Display', serif", color: "#334155", fontSize: "1.1rem" },
            signature: { fontFamily: "'Great Vibes', cursive", color: "#1e3a8a", fontSize: "1.5rem" }
        },
        decorations: (
            <>
                {/* Border Ornament */}
                <div className="absolute inset-8 border-2 border-[#1e3a8a] outline outline-1 outline-[#94a3b8] outline-offset-4 z-10 pointer-events-none"></div>

                {/* Corners */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#1e3a8a] z-20"></div>
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#1e3a8a] z-20"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#1e3a8a] z-20"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#1e3a8a] z-20"></div>
            </>
        )
    },
    {
        id: "imperial-ink",
        name: "Imperial Ink",
        previewColor: "#fafafa",
        styles: {
            container: {
                backgroundColor: "#fafafa",
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23111827' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                position: 'relative'
            },
            border: {},
            title: { fontFamily: "'Cinzel', serif", color: "#000000", fontSize: "2.5rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase" },
            body: { fontFamily: "'Playfair Display', serif", color: "#1f2937", fontSize: "1.1rem" },
            signature: { fontFamily: "'Great Vibes', cursive", color: "#000000", fontSize: "1.5rem" }
        },
        decorations: (
            <>
                {/* Border Ornament */}
                <div className="absolute inset-8 border-2 border-black outline outline-1 outline-[#dc2626] outline-offset-4 z-10 pointer-events-none"></div>

                {/* Corners */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-black z-20"></div>
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-black z-20"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-black z-20"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-black z-20"></div>
            </>
        )
    }
]

export function CertificateDesigner({
    initialSettings,
    hasCertificate,
    courseTitle,
    onSettingsChange,
    onToggleChange,
    onSave
}: CertificateDesignerProps) {
    const { t } = useLanguage()
    const [settings, setSettings] = useState<CertificateSettings>(initialSettings)
    const [activeTab, setActiveTab] = useState<"design" | "content">("design")
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setSettings(initialSettings)
    }, [initialSettings])

    const handleChange = (key: keyof CertificateSettings, value: any) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        onSettingsChange(newSettings)
    }

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [settings.isCustomMode]);

    // Custom Mode Logic
    const toggleCustomMode = (enabled: boolean) => {
        let newSettings = { ...settings, isCustomMode: enabled };

        if (enabled && (!settings.elements || settings.elements.length === 0)) {
            // Initialize with default elements (using PDF Coordinates)
            const defaultElements: CertificateElement[] = [
                {
                    id: "title", type: "text", label: "Title", content: "CERTIFICADO DE MÉRITO", x: 421, y: 100, // Centered roughly in 842 width
                    style: { fontSize: 40, fontFamily: "'Cinzel', serif", color: "#000000", fontWeight: "700", textAlign: "center" }
                },
                {
                    id: "student_name", type: "field", label: "Student Base", content: "{{student_name}}", x: 421, y: 250,
                    style: { fontSize: 60, fontFamily: "'Great Vibes', cursive", color: "#000000", fontWeight: "400", textAlign: "center" }
                },
                {
                    id: "body", type: "text", label: "Body Text", content: "concluiu com êxito o curso", x: 421, y: 350,
                    style: { fontSize: 18, fontFamily: "'Playfair Display', serif", color: "#333333", fontWeight: "400", textAlign: "center" }
                }
            ]
            newSettings.elements = defaultElements;
        }

        setSettings(newSettings)
        onSettingsChange(newSettings)
    }

    const updateElement = (id: string, updates: Partial<CertificateElement> | Partial<CertificateElement['style']>) => {
        const newElements = settings.elements?.map(el => {
            if (el.id === id) {
                if ('color' in updates || 'fontSize' in updates || 'fontFamily' in updates || 'fontWeight' in updates || 'textAlign' in updates) {
                    return { ...el, style: { ...el.style, ...updates } }
                }
                return { ...el, ...updates } as CertificateElement
            }
            return el
        })
        handleChange("elements", newElements)
    }

    const handleDragStop = (id: string, e: any, data: { x: number, y: number }) => {
        if (containerSize.width > 0 && containerSize.height > 0) {
            const pdfX = (data.x / containerSize.width) * PDF_WIDTH;
            const pdfY = (data.y / containerSize.height) * PDF_HEIGHT;
            updateElement(id, { x: pdfX, y: pdfY });
        }
    }

    const addElement = (type: 'text' | 'field') => {
        const newElement: CertificateElement = {
            id: `el_${Date.now()}`,
            type,
            label: type === 'text' ? 'New Text' : 'New Field',
            content: type === 'text' ? 'Text Here' : '{{date}}',
            x: PDF_WIDTH / 2,
            y: PDF_HEIGHT / 2,
            style: {
                fontSize: 20,
                fontFamily: "sans-serif",
                color: "#000000",
                fontWeight: "normal",
                textAlign: "left"
            }
        }
        handleChange("elements", [...(settings.elements || []), newElement])
        setSelectedElementId(newElement.id)
    }

    const deleteElement = (id: string) => {
        const newElements = settings.elements?.filter(el => el.id !== id)
        handleChange("elements", newElements)
        if (selectedElementId === id) setSelectedElementId(null)
    }

    const handleSave = () => {
        // Capture current template styles to ensure backend can render background/theme
        const currentTemplate = TEMPLATES.find(t => t.id === settings.templateId) || TEMPLATES[0];

        const finalSettings = {
            ...settings,
            // Ensure templateId is explicitly saved
            templateId: settings.templateId || currentTemplate.id,
            backgroundColor: currentTemplate.styles.container?.backgroundColor || '#fdfbf7',
            // Use title color from template styles as it's the main accent color
            themeColor: currentTemplate.styles.title?.color || '#8B0000'
        };

        setSettings(finalSettings);
        onSettingsChange(finalSettings);

        // specific timeout to allow state propagation
        setTimeout(() => {
            onSave();
            toast.success(t('Changes saved successfully'));
        }, 100);
    }

    const currentTemplate = TEMPLATES.find(t => t.id === settings.templateId) || TEMPLATES[0]

    return (
        <div className="grid lg:grid-cols-12 gap-6 h-full">
            {/* Left Panel: Controls */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center space-x-2 pb-4 border-b">
                            <input
                                type="checkbox"
                                id="certToggle"
                                checked={hasCertificate}
                                onChange={(e) => onToggleChange(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <Label htmlFor="certToggle" className="text-base font-semibold cursor-pointer">{t('Enable Certificate')}</Label>
                                <p className="text-sm text-gray-500">{t('Issue automatically on completion')}</p>
                            </div>
                        </div>

                        {hasCertificate && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex border-b">
                                    <button
                                        className={cn("flex-1 pb-2 text-sm font-medium", activeTab === "design" ? "border-b-2 border-black text-black" : "text-gray-500")}
                                        onClick={() => setActiveTab("design")}
                                    >
                                        {t('Design')}
                                    </button>
                                    <button
                                        className={cn("flex-1 pb-2 text-sm font-medium", activeTab === "content" ? "border-b-2 border-black text-black" : "text-gray-500")}
                                        onClick={() => setActiveTab("content")}
                                    >
                                        {t('Content')}
                                    </button>
                                </div>

                                {activeTab === "design" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Custom Layout Mode</Label>
                                                <p className="text-xs text-muted-foreground">Enable drag & drop and full customization</p>
                                            </div>
                                            <Switch
                                                checked={settings.isCustomMode}
                                                onCheckedChange={toggleCustomMode}
                                            />
                                        </div>

                                        {!settings.isCustomMode ? (
                                            <div className="space-y-3">
                                                <Label>{t('Choose Template')}</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {TEMPLATES.map(template => (
                                                        <div
                                                            key={template.id}
                                                            className={cn(
                                                                "cursor-pointer rounded-lg border-2 p-2 transition-all hover:scale-105",
                                                                settings.templateId === template.id ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-gray-200"
                                                            )}
                                                            onClick={() => handleChange("templateId", template.id)}
                                                        >
                                                            <div
                                                                className="h-16 w-full rounded-md shadow-sm mb-2 flex items-center justify-center"
                                                                style={{ backgroundColor: template.previewColor }}
                                                            >
                                                                <div className="text-[10px] opacity-50 font-bold">Aa</div>
                                                            </div>
                                                            <p className="text-xs text-center font-medium truncate">{template.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => addElement('text')}>
                                                        <Type className="w-4 h-4 mr-2" /> Add Text
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => addElement('field')}>
                                                        <Plus className="w-4 h-4 mr-2" /> Add Field
                                                    </Button>
                                                </div>

                                                {selectedElementId ? (
                                                    <div className="space-y-4 border rounded p-4 bg-slate-50">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-semibold text-sm">Edit Element</h4>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteElement(selectedElementId)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        {(() => {
                                                            const el = settings.elements?.find(e => e.id === selectedElementId)
                                                            if (!el) return null
                                                            return (
                                                                <>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Content</Label>
                                                                        <Input
                                                                            value={el.content}
                                                                            onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Font</Label>
                                                                            <Select
                                                                                value={el.style.fontFamily}
                                                                                onValueChange={(val) => updateElement(el.id, { fontFamily: val })}
                                                                            >
                                                                                <SelectTrigger className="h-8">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="'Cinzel', serif">Cinzel</SelectItem>
                                                                                    <SelectItem value="'Great Vibes', cursive">Great Vibes</SelectItem>
                                                                                    <SelectItem value="'Playfair Display', serif">Playfair</SelectItem>
                                                                                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                                                                    <SelectItem value="serif">Serif</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Color</Label>
                                                                            <div className="flex gap-2">
                                                                                <Input
                                                                                    type="color"
                                                                                    className="h-8 w-full p-1 cursor-pointer"
                                                                                    value={el.style.color}
                                                                                    onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Font Size ({el.style.fontSize}px)</Label>
                                                                        <Slider
                                                                            value={[el.style.fontSize]}
                                                                            min={10}
                                                                            max={120}
                                                                            step={1}
                                                                            onValueChange={([val]) => updateElement(el.id, { fontSize: val })}
                                                                        />
                                                                    </div>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                                                        Select an element to edit
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-4 border-t">
                                            <Label>{t('Custom Background Image')}</Label>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-dashed">
                                                <ImageUpload
                                                    value={settings.backgroundImageUrl || ""}
                                                    onChange={(url) => handleChange("backgroundImageUrl", url)}
                                                    label={t("Upload Background")}
                                                />
                                                <p className="text-xs text-gray-400 mt-2 text-center">
                                                    {t('Overrides template background. Recommended: 2000x1414px')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "content" && (
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>{t('Certificate Title')}</Label>
                                            <Input
                                                placeholder="CERTIFICADO DE MÉRITO"
                                                value={settings.title || ""}
                                                onChange={(e) => handleChange("title", e.target.value)}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t('Body Text')}</Label>
                                            <Textarea
                                                placeholder={t('Completed the course successfully')}
                                                value={settings.customText || ""}
                                                onChange={(e) => handleChange("customText", e.target.value)}
                                                rows={3}
                                            />
                                            <p className="text-xs text-gray-500">{t('Appears after the student name.')}</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t('Signer Name')}</Label>
                                            <Input
                                                placeholder="John Doe, CEO"
                                                value={settings.signerName || ""}
                                                onChange={(e) => handleChange("signerName", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button onClick={handleSave} className="w-full mt-4">
                                    {t('Save Changes')}
                                </Button>
                            </div>
                        )}

                        {!hasCertificate && (
                            <div className="text-center py-8 text-gray-400">
                                <Award size={48} className="mx-auto mb-2 opacity-20" />
                                <p>{t('Enable certificates to configure the design.')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel: Preview */}
            <div className="lg:col-span-8 flex flex-col justify-center">
                <div className="sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('Live Preview')}</h3>
                        <span className="text-xs text-gray-400">A4 Landscape</span>
                    </div>

                    <div
                        className="w-full bg-white shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center transition-all duration-500"
                        style={{
                            aspectRatio: '1.414 / 1',
                            ...currentTemplate.styles.container,
                            ...(settings.backgroundImageUrl ? {
                                backgroundImage: `url(${settings.backgroundImageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {})
                        }}
                    >
                        {/* Border Layer */}
                        <div className="absolute inset-8 pointer-events-none" style={currentTemplate.styles.border}></div>

                        {/* Custom Decorations */}
                        {currentTemplate.decorations}

                        {/* Content Layer */}
                        {settings.isCustomMode ? (
                            <div className="w-full h-full absolute inset-0 text-left" ref={containerRef}>
                                {settings.elements?.map(element => (
                                    <DraggableItem
                                        key={element.id}
                                        x={containerSize.width > 0 ? (element.x / 842) * containerSize.width : element.x}
                                        y={containerSize.height > 0 ? (element.y / 595) * containerSize.height : element.y}
                                        element={element}
                                        isSelected={selectedElementId === element.id}
                                        onStop={(e, data) => handleDragStop(element.id, e, data)}
                                        onSelect={() => setSelectedElementId(element.id)}
                                    />
                                ))}
                                {/* Deselect on background click */}
                                <div className="absolute inset-0 z-0" onClick={() => setSelectedElementId(null)} />
                            </div>
                        ) : (
                            // Legacy Template Mode
                            <div className="w-full h-full z-10 relative flex flex-col justify-between" style={{ padding: '8% 10%' }}>
                                {/* Top Section: Title */}
                                <div className="flex flex-col items-center justify-end space-y-4 pt-8 w-full">
                                    <h1
                                        className="leading-tight w-full px-8 text-center"
                                        style={{
                                            ...currentTemplate.styles.title,
                                            fontSize: `${Math.min(2.5, 50 / (settings.title || "CERTIFICADO DE MÉRITO").length)}rem`,
                                            whiteSpace: 'nowrap',
                                            overflow: 'visible'
                                        }}
                                    >
                                        {settings.title || "CERTIFICADO DE MÉRITO"}
                                    </h1>
                                    <p className="text-lg italic opacity-70" style={currentTemplate.styles.body}>Este documento certifica que</p>
                                </div>

                                {/* Middle Section: Student Name & Course */}
                                <div className="flex flex-col items-center justify-center flex-grow py-4">
                                    <div className="border-b border-gray-300 w-full max-w-2xl mb-6">
                                        <p className="text-5xl md:text-6xl font-serif text-center mb-2" style={{ color: currentTemplate.styles.title?.color, fontFamily: "'Great Vibes', cursive" }}>
                                            Nome do Aluno
                                        </p>
                                    </div>
                                    <div className="text-center w-full max-w-2xl">
                                        <p className="text-lg mb-2 opacity-90 leading-relaxed" style={currentTemplate.styles.body}>
                                            {settings.customText || "Completou com êxito os requisitos teóricos e práticos do curso de"}
                                        </p>
                                        <p className="text-3xl font-bold mt-2" style={{ ...currentTemplate.styles.title, fontSize: '2rem', textTransform: 'none', letterSpacing: '0' }}>"{courseTitle}"</p>
                                        <p className="mt-4 italic opacity-70" style={{ ...currentTemplate.styles.body, fontSize: '1rem' }}>
                                            Carga Horária: 60 horas &bull; Aproveitamento: 100%
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Section: Footer & Signatures */}
                                <div className="w-full mt-auto">
                                    <div className="grid grid-cols-2 gap-20 items-end">
                                        <div className="text-center">
                                            <p className="text-xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>10 de Dezembro de 2025</p>
                                            <div className="border-t border-gray-400 pt-2 mx-8">
                                                <p className="text-xs uppercase tracking-widest font-bold opacity-60" style={currentTemplate.styles.body}>Data de Emissão</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl mb-1" style={{ fontFamily: "'Great Vibes', cursive", color: "#8B0000" }}>
                                                {settings.signerName || "Mestre Li Wei"}
                                            </div>
                                            <div className="border-t border-gray-400 pt-2 mx-8">
                                                <p className="text-xs uppercase tracking-widest font-bold opacity-60" style={currentTemplate.styles.body}>{settings.signerName ? "Instrutor Responsável" : "Instrutor Mestre"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Code */}
                                    <div className="pt-4 text-center opacity-50">
                                        <p className="text-[10px] font-mono tracking-widest uppercase">
                                            Código de Verificação: CERT-X7Y9-Z2W1
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
