"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { settingsService } from "@/services/settings"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function WhatsAppSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState({
        baseUrl: "",
        apiKey: "",
        instanceName: ""
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await settingsService.getEvolutionConfig()
            setConfig(data)
        } catch (error) {
            console.error("Failed to load WhatsApp settings", error)
            toast.error("Failed to load WhatsApp settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await settingsService.updateEvolutionConfig(config)
            toast.success("WhatsApp configuration saved")
        } catch (error) {
            console.error("Failed to save WhatsApp settings", error)
            toast.error("Failed to save configuration")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading WhatsApp settings...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>WhatsApp Integration (Evolution API)</CardTitle>
                <CardDescription>
                    Configure your Evolution API instance to send WhatsApp messages.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="evolution-url">API Base URL</Label>
                    <Input
                        id="evolution-url"
                        placeholder="https://api.yourdomain.com"
                        value={config.baseUrl}
                        onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="evolution-key">Global API Key</Label>
                    <Input
                        id="evolution-key"
                        type="password"
                        placeholder="Expected global api key"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="evolution-instance">Instance Name</Label>
                    <Input
                        id="evolution-instance"
                        placeholder="masterlms"
                        value={config.instanceName}
                        onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Configuration
                </Button>
            </CardFooter>
        </Card>
    )
}
