"use client"

import { useState, useEffect } from "react"
import { usersService, User } from "@/services/users"
import { settingsService } from "@/services/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, User as UserIcon, Lock, CreditCard } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

import { countries } from "@/lib/countries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/ImageUpload"


export default function ProfilePage() {
    const { t } = useLanguage()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        notifyByWhatsapp: true,
        notifyByEmail: true
    })

    // WhatsApp specific state
    const [ddi, setDdi] = useState("Brazil")
    const [phone, setPhone] = useState("")

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const [renewalLink, setRenewalLink] = useState("")

    useEffect(() => {
        fetchProfile()
        fetchRenewalLink()
    }, [])

    const fetchRenewalLink = async () => {
        const link = await settingsService.getRenewalLink()
        setRenewalLink(link)
    }

    const fetchProfile = async () => {
        try {
            const data = await usersService.getProfile()
            setUser(data)
            setFormData({
                name: data.name || "",
                surname: data.surname || "",
                email: data.email || "",
                notifyByWhatsapp: data.notifyByWhatsapp ?? true,
                notifyByEmail: data.notifyByEmail ?? true
            })

            // WhatsApp specific state
            if (data.whatsapp) {
                // Try to find matching DDI
                const matchingCountry = countries.find(c => data.whatsapp!.startsWith(c.code))
                if (matchingCountry) {
                    setDdi(matchingCountry.name)
                    setPhone(data.whatsapp.replace(matchingCountry.code, ""))
                } else {
                    setDdi("Brazil") // Default to Brazil if unknown
                    setPhone(data.whatsapp)
                }
            } else {
                setDdi("Brazil")
            }
        } catch (error) {
            toast.error("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const selectedCountry = countries.find(c => c.name === ddi)
            const code = selectedCountry ? selectedCountry.code : "+55"
            const fullWhatsapp = code + phone
            const updatedUser = await usersService.updateProfile({
                name: formData.name,
                surname: formData.surname,
                whatsapp: fullWhatsapp,
                notifyByWhatsapp: formData.notifyByWhatsapp,
                notifyByEmail: formData.notifyByEmail
            })
            setUser(updatedUser)
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        setSaving(true)
        try {
            await usersService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            toast.success("Password changed successfully")
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error) {
            toast.error("Failed to change password")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">{t('Profile')}</h1>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                        <UserIcon size={16} /> {t('Personal Information')}
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="flex items-center gap-2">
                        <CreditCard size={16} /> {t('Subscription')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Personal Information')}</CardTitle>
                            <CardDescription>{t('Update your personal details and password.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleProfileUpdate} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label>Profile Picture</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={user?.avatar || ""} />
                                                <AvatarFallback>{user?.name?.[0]}{user?.surname?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <ImageUpload
                                                    value={user?.avatar || ""}
                                                    onChange={async (url) => {
                                                        // Immediate update for avatar
                                                        try {
                                                            await usersService.updateProfile({ ...formData, avatar: url })
                                                            setUser(prev => prev ? { ...prev, avatar: url } : null)
                                                            toast.success(t("Avatar updated"))
                                                        } catch (e) {
                                                            toast.error(t("Failed to update avatar"))
                                                        }
                                                    }}
                                                    label={t("Change Avatar")}
                                                    className="h-32 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('Name')}</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="surname">{t('Surname')}</Label>
                                        <Input
                                            id="surname"
                                            value={formData.surname}
                                            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('Email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('Phone')}</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={ddi}
                                                onValueChange={(value) => setDdi(value)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue placeholder="Country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={`${country.code} -${country.name} `} value={country.name}>
                                                            <span className="flex items-center gap-2">
                                                                <span>{country.flag}</span>
                                                                <span>{country.code}</span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="123456789"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold">{t('Notifications')}</h3>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyByWhatsapp" className="flex flex-col gap-1">
                                            <span>{t('Notify by WhatsApp')}</span>
                                            <span className="font-normal text-sm text-muted-foreground">{t('Receive updates and reminders via WhatsApp')}</span>
                                        </Label>
                                        <Switch
                                            id="notifyByWhatsapp"
                                            checked={formData.notifyByWhatsapp}
                                            onCheckedChange={(checked) => setFormData({ ...formData, notifyByWhatsapp: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifyByEmail" className="flex flex-col gap-1">
                                            <span>{t('Notify by Email')}</span>
                                            <span className="font-normal text-sm text-muted-foreground">{t('Receive updates and newsletters via Email')}</span>
                                        </Label>
                                        <Switch
                                            id="notifyByEmail"
                                            checked={formData.notifyByEmail}
                                            onCheckedChange={(checked) => setFormData({ ...formData, notifyByEmail: checked })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('Save Changes')}
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold">Change Password</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">{t('Current Password')}</Label>
                                        <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">{t('New Password')}</Label>
                                        <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">{t('Confirm New Password')}</Label>
                                        <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handlePasswordChange} disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('Change Password')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Subscription')}</CardTitle>
                            <CardDescription>{t('View your active enrollments and plans.')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Global Subscription Status */}
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <h3 className="font-semibold mb-2">{t('Platform Access')}</h3>
                                    {user?.subscriptionEndsAt ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">{t('Subscription expires on')}</p>
                                                    <p className="text-lg font-medium">
                                                        {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${new Date(user.subscriptionEndsAt) > new Date()
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {new Date(user.subscriptionEndsAt) > new Date() ? t('Active') : t('Expired')}
                                                </div>
                                            </div>

                                            {/* Renewal Button Logic */}
                                            {(() => {
                                                const end = new Date(user.subscriptionEndsAt)
                                                const now = new Date()
                                                const diffTime = end.getTime() - now.getTime()
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                                                // Show if expired or expiring within 45 days
                                                if ((diffDays <= 45 || diffDays < 0) && renewalLink) {
                                                    return (
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                                                            onClick={() => window.open(renewalLink, '_blank')}
                                                        >
                                                            {t('Renew now with discount!')}
                                                        </Button>
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">{t('No active platform subscription.')}</p>
                                    )}
                                </div>

                                {/* Course Enrollments */}
                                <div>
                                    <h3 className="font-semibold mb-4">{t('Course Enrollments')}</h3>
                                    {user?.enrollments && user.enrollments.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.enrollments.map((enrollment: any) => (
                                                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold">{enrollment.course.title}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t('Enrolled on')} {new Date(enrollment.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {enrollment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {t('No active course enrollments found.')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

