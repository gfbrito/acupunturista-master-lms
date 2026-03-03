"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink } from "lucide-react"
import { format } from "date-fns"

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get("/events")
                setEvents(res.data)
            } catch (error) {
                console.error("Error fetching events", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    if (loading) return <div>Loading events...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Upcoming Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Card key={event.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <p className="text-gray-600">{event.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(event.startAt), "PPP")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(event.startAt), "p")} - {format(new Date(event.endAt), "p")}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {event.link && (
                                <Button asChild className="w-full">
                                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Join Event
                                    </a>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {events.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    No upcoming events found.
                </div>
            )}
        </div>
    )
}
