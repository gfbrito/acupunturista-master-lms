import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LeaderboardWidget() {
    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get("/gamification/leaderboard")
                setUsers(res.data)
            } catch (error) {
                console.error("Error fetching leaderboard", error)
            }
        }
        fetchLeaderboard()
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🏆 Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold w-6 ${index < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    #{index + 1}
                                </span>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{user.name}</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{user.points} pts</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
