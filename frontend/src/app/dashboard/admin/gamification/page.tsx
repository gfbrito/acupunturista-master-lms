"use client"

import { useEffect, useState } from "react"
import { gamificationService } from "@/services/gamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

export default function GamificationSettingsPage() {
    const { t } = useLanguage()
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await gamificationService.getSettings()
            setSettings(data)
        } catch (error) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            await gamificationService.updateSettings(settings)
            toast.success("Settings saved successfully")
            // Force reload to update header state if needed, or rely on context/re-fetch
            window.location.reload()
        } catch (error) {
            toast.error("Failed to save settings")
        }
    }

    const updateSetting = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    if (loading) return <div>Loading...</div>

    const isEnabled = settings.gamification_enabled === 'true'

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gamification Settings</h1>
                <p className="text-muted-foreground">Manage points and rewards configuration.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Status</CardTitle>
                    <CardDescription>Enable or disable the entire gamification system.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center space-x-2">
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => updateSetting('gamification_enabled', String(checked))}
                    />
                    <Label>Enable Gamification</Label>
                </CardContent>
            </Card>

            {isEnabled && (
                <Card>
                    <CardHeader>
                        <CardTitle>Point Values</CardTitle>
                        <CardDescription>Configure how many points users earn for specific actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Points per Post</Label>
                                <Input
                                    type="number"
                                    value={settings.gamification_points_post || '0'}
                                    onChange={(e) => updateSetting('gamification_points_post', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Points per Comment</Label>
                                <Input
                                    type="number"
                                    value={settings.gamification_points_comment || '0'}
                                    onChange={(e) => updateSetting('gamification_points_comment', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Points per Lesson Completed</Label>
                                <Input
                                    type="number"
                                    value={settings.gamification_points_lesson || '0'}
                                    onChange={(e) => updateSetting('gamification_points_lesson', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Points per Course Completed</Label>
                                <Input
                                    type="number"
                                    value={settings.gamification_points_course || '0'}
                                    onChange={(e) => updateSetting('gamification_points_course', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Points per Like Received</Label>
                                <Input
                                    type="number"
                                    value={settings.gamification_points_like || '0'}
                                    onChange={(e) => updateSetting('gamification_points_like', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    )
}
