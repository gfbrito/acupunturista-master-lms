"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AdminUsersPage() {
    const { t } = useLanguage()
    const [users, setUsers] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Enrollment Dialog State
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [selectedCourseId, setSelectedCourseId] = useState("")
    const [durationDays, setDurationDays] = useState(365)
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)

    // Create User State
    const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        whatsapp: "",
        subscriptionEndsAt: ""
    })

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                api.get("/users"),
                api.get("/courses"),
            ])

            setUsers(usersRes.data)
            setCourses(coursesRes.data)
        } catch (error) {
            console.error("Error fetching data", error)
            toast.error("Failed to fetch users or courses")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEnroll = async () => {
        if (!selectedUser || !selectedCourseId) return

        try {
            await api.post("/enrollments", {
                userId: selectedUser.id,
                courseId: selectedCourseId,
                durationDays: Number(durationDays),
            })

            toast.success(`Enrolled ${selectedUser.name} successfully`)
            setIsEnrollDialogOpen(false)
        } catch (error) {
            console.error("Error enrolling user", error)
            toast.error("Failed to enroll user")
        }
    }

    const handleCreateUser = async () => {
        try {
            await api.post("/users", newUser)
            toast.success("User created successfully")
            setIsCreateUserDialogOpen(false)
            setNewUser({ name: "", email: "", password: "", whatsapp: "", subscriptionEndsAt: "" })
            fetchData()
        } catch (error) {
            console.error("Error creating user", error)
            toast.error("Failed to create user")
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('Users Management')}</h1>
                    <p className="text-gray-500">{t('View users and manage enrollments.')}</p>
                </div>
                <Button onClick={() => setIsCreateUserDialogOpen(true)}>{t('Create User')}</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('All Users')}</CardTitle>
                    <CardDescription>
                        {t('Total Users')}: {users.length}
                    </CardDescription>
                    <div className="pt-4">
                        <Input
                            placeholder={t('Search by name or email...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('Name')}</TableHead>
                                <TableHead>{t('Email')}</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>{t('Joined')}</TableHead>
                                <TableHead>{t('Subscription Ends')}</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setIsEnrollDialogOpen(true)
                                            }}
                                        >
                                            {t('Enroll')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={async () => {
                                                if (confirm(`Reset password for ${user.name} to 'estudando123'?`)) {
                                                    try {
                                                        await api.post(`/users/${user.id}/reset-password`)
                                                        toast.success(`Password reset for ${user.name}`)
                                                    } catch (error) {
                                                        console.error("Error resetting password", error)
                                                        toast.error("Failed to reset password")
                                                    }
                                                }
                                            }}
                                        >
                                            {t('Reset Pass')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Create New User')}</DialogTitle>
                        <DialogDescription>
                            {t('Manually create a user. Subscription Expiration Date is mandatory.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>{t('Name')}</Label>
                            <Input
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('Email')}</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('New Password')}</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('WhatsApp (Optional)')}</Label>
                            <Input
                                placeholder="+5511999999999"
                                value={newUser.whatsapp}
                                onChange={(e) => setNewUser({ ...newUser, whatsapp: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('Subscription Expiration Date')}</Label>
                            <Input
                                type="date"
                                value={newUser.subscriptionEndsAt}
                                onChange={(e) => setNewUser({ ...newUser, subscriptionEndsAt: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>{t('Cancel')}</Button>
                        <Button onClick={handleCreateUser} disabled={!newUser.subscriptionEndsAt}>{t('Create User')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Enroll User')}</DialogTitle>
                        <DialogDescription>
                            {t('Manually enroll')} <strong>{selectedUser?.name}</strong> {t('in a course.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>{t('Select Course')}</Label>
                            <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select a course')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('Duration (Days)')}</Label>
                            <Input
                                type="number"
                                value={durationDays}
                                onChange={(e) => setDurationDays(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>{t('Cancel')}</Button>
                        <Button onClick={handleEnroll}>{t('Confirm Enrollment')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
