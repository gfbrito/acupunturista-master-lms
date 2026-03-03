"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notificationsService } from "@/services/notifications"

export function NotificationsAdmin() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [link, setLink] = useState("")
    const [sendToAll, setSendToAll] = useState(true)
    const [userId, setUserId] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!title || !message) {
            alert("Title and Message are required")
            return
        }

        if (!sendToAll && !userId) {
            alert("User ID is required when not sending to all")
            return
        }

        setLoading(true)
        try {
            await notificationsService.sendNotification({
                title,
                message,
                link,
                sendToAll,
                userId: sendToAll ? undefined : userId,
                type: 'SYSTEM'
            })
            alert("Notification sent successfully!")
            setTitle("")
            setMessage("")
            setLink("")
            setUserId("")
        } catch (error) {
            console.error("Failed to send notification", error)
            alert("Failed to send notification")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Send Notifications</CardTitle>
                    <CardDescription>Send system notifications to users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="notifTitle">Title</Label>
                        <Input
                            id="notifTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="New Update Available!"
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="notifMessage">Message</Label>
                        <Textarea
                            id="notifMessage"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Check out the new features..."
                        />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="notifLink">Link (Optional)</Label>
                        <Input
                            id="notifLink"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="/dashboard/courses/new-course"
                        />
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <input
                            type="checkbox"
                            id="sendToAll"
                            checked={sendToAll}
                            onChange={(e) => setSendToAll(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="sendToAll">Send to All Users</Label>
                    </div>

                    {!sendToAll && (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="UUID"
                            />
                        </div>
                    )}

                    <Button onClick={handleSend} disabled={loading}>
                        {loading ? "Sending..." : "Send Notification"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Notifications received by you (including system broadcasts).</CardDescription>
                </CardHeader>
                <CardContent>
                    <NotificationList />
                </CardContent>
            </Card>
        </div>
    )
}

function NotificationList() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await notificationsService.getAll()
                setNotifications(data.notifications)
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    if (loading) return <div>Loading history...</div>
    if (notifications.length === 0) return <div className="text-gray-500">No notifications found.</div>

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div key={notif.id} className="border p-4 rounded-lg flex justify-between items-start bg-gray-50">
                    <div>
                        <h4 className="font-semibold">{notif.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        {notif.link && (
                            <a href={notif.link} className="text-xs text-primary hover:underline mt-2 block">
                                {notif.link}
                            </a>
                        )}
                        <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-white border px-1.5 py-0.5 rounded text-gray-500 uppercase">{notif.type}</span>
                            <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
