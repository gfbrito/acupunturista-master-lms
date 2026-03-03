"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState({
        name: "",
        email: "",
        avatar: "",
        bio: "",
        company: "",
        role: "",
        createdAt: ""
    })
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })
    const [notifications, setNotifications] = useState({
        email: true,
        push: false
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me")
                setUser(response.data)
            } catch (error) {
                console.error("Error fetching profile", error)
            }
        }
        fetchProfile()
    }, [])

    const handleProfileUpdate = async () => {
        setLoading(true)
        try {
            await api.patch("/users/profile", {
                name: user.name,
                email: user.email // Note: Usually email change requires verification
            })
            toast.success(t("Profile updated successfully"))
        } catch (error) {
            console.error("Error updating profile", error)
            toast.error(t("Error updating profile"))
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error(t("Passwords do not match"))
            return
        }
        if (passwords.new.length < 6) {
            toast.error(t("New password must be at least 6 characters"))
            return
        }

        try {
            await api.post("/auth/change-password", {
                currentPassword: passwords.current,
                newPassword: passwords.new
            })
            toast.success(t("Password changed successfully!"))
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (error) {
            console.error("Error changing password", error)
            toast.error(t("Error changing password"))
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h3 className="text-2xl font-medium">{t("Settings")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("Update your personal details and password.")}
                </p>
            </div>
            <Separator />

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">{t("Personal Information")}</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("Name")}</Label>
                            <Input
                                id="name"
                                value={user.name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("Email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                    <Button onClick={handleProfileUpdate} disabled={loading}>
                        {loading ? t("Saving...") : t("Save Changes")}
                    </Button>
                </div>

                <Separator />

                {/* Password Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">{t("Password")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Change your access password")}</p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">{t("Current Password")}</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">{t("New Password")}</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">{t("Confirm New Password")}</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button onClick={handlePasswordChange}>{t("Change Password")}</Button>
                </div>

                <Separator />

                {/* Language Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">{t("Language / Idioma")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Choose interface language")}</p>
                    <div className="w-[200px]">
                        <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("Select language")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PT-BR">🇧🇷 {t("Portuguese")}</SelectItem>
                                <SelectItem value="EN">🇺🇸 {t("English")}</SelectItem>
                                <SelectItem value="ES">🇪🇸 {t("Spanish")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                {/* Notifications Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">{t("Notifications")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Configure your notification preferences")}</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t("Email Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Receive updates via email")}
                                </p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t("Push Notifications")}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t("Receive browser notifications")}
                                </p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
