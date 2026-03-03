"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpacesAdmin } from "@/components/admin/SpacesAdmin"
import { PagesAdmin } from "@/components/admin/PagesAdmin"
import { RolesAdmin } from "@/components/admin/RolesAdmin"
import { settingsService } from "@/services/settings"
import { WhatsAppSettings } from "./WhatsAppSettings"
import { ClientOnly } from "@/components/ClientOnly"
import { NotificationsAdmin } from "@/components/admin/NotificationsAdmin"
import { LearningPathsAdmin } from "@/components/admin/LearningPathsAdmin"
import { ImageUpload } from "@/components/ui/ImageUpload"

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([])

    const [newEventTitle, setNewEventTitle] = useState("")
    const [newEventDate, setNewEventDate] = useState("")

    useEffect(() => {
        // fetchCourses() removed
    }, [])

    // Removed course fetch/create/delete logic

    const handleCreateEvent = async () => {
        console.log("Create event", newEventTitle, newEventDate)
        // TODO: Implement event creation
        setNewEventTitle("")
        setNewEventDate("")
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <ClientOnly>
                <Tabs defaultValue="events">
                    <TabsList>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="spaces">Community Spaces</TabsTrigger>
                        <TabsTrigger value="pages">Pages</TabsTrigger>
                        <TabsTrigger value="roles">Roles</TabsTrigger>
                        <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="events" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Event</CardTitle>
                                <CardDescription>Schedule a new event for the community.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        value={newEventTitle}
                                        onChange={(e) => setNewEventTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="date">Date & Time</Label>
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        value={newEventDate}
                                        onChange={(e) => setNewEventDate(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleCreateEvent}>Create Event</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="spaces">
                        <SpacesAdmin />
                    </TabsContent>

                    <TabsContent value="spaces">
                        <SpacesAdmin />
                    </TabsContent>

                    <TabsContent value="pages">
                        <PagesAdmin />
                    </TabsContent>

                    <TabsContent value="roles">
                        <RolesAdmin />
                    </TabsContent>

                    <TabsContent value="learning-paths">
                        <LearningPathsAdmin />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <NotificationsAdmin />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Settings</CardTitle>
                                <CardDescription>Configure global application settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="appName">Application Name</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="appName"
                                            placeholder="Master LMS"
                                            defaultValue="Master LMS"
                                            onChange={(e) => {
                                                // We'll handle save on button click, but for now just let it be uncontrolled or use local state if we want instant feedback
                                                // For simplicity, let's make it controlled in a real implementation, but here I'll just use a ref or local state
                                            }}
                                            onBlur={async (e) => {
                                                try {
                                                    await settingsService.updateAppName(e.target.value)
                                                    alert("App Name updated!")
                                                    window.location.reload() // Simple reload to reflect changes
                                                } catch (err) {
                                                    alert("Failed to update App Name")
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        This name will be displayed in the top bar.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Logo do Sistema</CardTitle>
                                <CardDescription>Faça upload do logo que aparecerá no topo da plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <LogoSettings />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Business Model</CardTitle>
                                <CardDescription>Choose how users access content on your platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <BusinessModelSettings />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Support Link</CardTitle>
                                <CardDescription>Link for user support.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <SupportLinkSettings />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Renewal Link</CardTitle>
                                <CardDescription>Link where users can renew their subscription.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RenewalLinkSettings />
                                <WhatsAppSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </ClientOnly>
        </div >
    )

}

function RenewalLinkSettings() {
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLink = async () => {
            const value = await settingsService.getRenewalLink()
            setLink(value)
            setLoading(false)
        }
        fetchLink()
    }, [])

    const handleSave = async () => {
        try {
            await settingsService.updateRenewalLink(link)
            alert("Renewal Link updated!")
        } catch (error) {
            alert("Failed to update Renewal Link")
        }
    }

    if (loading) return <div>Loading settings...</div>

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="renewalLink">Renewal URL</Label>
                <Input
                    id="renewalLink"
                    placeholder="https://example.com/renew"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
                <p className="text-sm text-gray-500">This link will be shown to users when their subscription expires.</p>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}

function SupportLinkSettings() {
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLink = async () => {
            const value = await settingsService.getSupportLink()
            setLink(value)
            setLoading(false)
        }
        fetchLink()
    }, [])

    const handleSave = async () => {
        try {
            await settingsService.updateSupportLink(link)
            alert("Support Link updated!")
        } catch (error) {
            alert("Failed to update Support Link")
        }
    }

    if (loading) return <div>Loading settings...</div>

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="supportLink">Support URL</Label>
                <Input
                    id="supportLink"
                    placeholder="https://example.com/support"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
                <p className="text-sm text-gray-500">This link will be accessible from the user profile menu.</p>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}

function BusinessModelSettings() {
    const [model, setModel] = useState<"SUBSCRIPTION" | "MARKETPLACE">("MARKETPLACE")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchModel = async () => {
            const value = await settingsService.getBusinessModel()
            setModel(value as any)
            setLoading(false)
        }
        fetchModel()
    }, [])

    const handleSave = async () => {
        try {
            await settingsService.updateBusinessModel(model)
            alert("Business Model updated!")
        } catch (error) {
            alert("Failed to update Business Model")
        }
    }

    if (loading) return <div>Loading settings...</div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setModel("SUBSCRIPTION")}>
                    <input
                        type="radio"
                        id="subscription"
                        name="businessModel"
                        value="SUBSCRIPTION"
                        checked={model === "SUBSCRIPTION"}
                        onChange={() => setModel("SUBSCRIPTION")}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                        <Label htmlFor="subscription" className="font-medium cursor-pointer">Subscription (All Access)</Label>
                        <p className="text-sm text-gray-500">Users pay a recurring fee to access all courses and content.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setModel("MARKETPLACE")}>
                    <input
                        type="radio"
                        id="marketplace"
                        name="businessModel"
                        value="MARKETPLACE"
                        checked={model === "MARKETPLACE"}
                        onChange={() => setModel("MARKETPLACE")}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                        <Label htmlFor="marketplace" className="font-medium cursor-pointer">Individual Sales (Marketplace)</Label>
                        <p className="text-sm text-gray-500">Users verify and purchase courses individually.</p>
                    </div>
                </div>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}

function LogoSettings() {
    const [logoUrl, setLogoUrl] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const value = await settingsService.getSettingValue('logo')
                setLogoUrl(value || "")
            } catch (e) {
                console.error("Failed to fetch logo", e)
            }
            setLoading(false)
        }
        fetchLogo()
    }, [])

    const handleUpload = async (url: string) => {
        try {
            await settingsService.updateSettingValue('logo', url)
            setLogoUrl(url)
            alert("Logo atualizado com sucesso!")
        } catch (error) {
            alert("Erro ao salvar logo")
        }
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div className="space-y-4">
            <ImageUpload
                value={logoUrl}
                onChange={handleUpload}
                label="Upload do Logo"
            />
            {logoUrl && (
                <div className="flex items-center gap-4 mt-4">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleUpload("")}>
                        Remover Logo
                    </Button>
                </div>
            )}
            <p className="text-sm text-gray-500">
                Este logo será exibido no topo da plataforma.
            </p>
        </div>
    )
}

