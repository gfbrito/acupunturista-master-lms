"use client"

import { Search, Bell, MessageCircle, Bookmark, LogOut, User as UserIcon, LifeBuoy, Settings, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useUser } from '@/contexts/UserContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from '@/contexts/LanguageContext';
import { searchService, SearchResult } from '@/services/search';
import { SearchResults } from './SearchResults';
import { useRouter } from 'next/navigation';

import { usersService, User } from '@/services/users';
import { notificationsService, Notification } from '@/services/notifications';

export function Header() {
    const { settings } = useAppSettings();
    const { user, points, gamificationEnabled } = useUser();
    const { language, setLanguage, t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const router = useRouter()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await notificationsService.getAll()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            }
        }
        if (user) {
            fetchNotifications()
        }
    }, [user])

    const handleNotificationClick = async (n: Notification) => {
        if (!n.read) {
            await notificationsService.markAsRead(n.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
        }
        if (n.link) router.push(n.link)
    }

    const handleMarkAllRead = async () => {
        await notificationsService.markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(item => ({ ...item, read: true })))
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true)
                try {
                    const results = await searchService.search(searchQuery)
                    setSearchResults(results)
                } catch (error) {
                    console.error("Search failed", error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults(null)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    const calculateLevel = (points: number) => {
        return Math.floor(points / 100) + 1
    }

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 px-4 flex items-center justify-between">
            {/* Left: App Name */}
            <div className="flex items-center gap-4">
                <div className="font-bold text-xl text-black">{settings.appName}</div>
            </div>

            {/* Center: Home Pill (Hidden for now or placeholder) */}
            <div className="hidden md:flex flex-1 justify-center">
                {/* Search Bar - Positioned slightly left or center based on Circle style */}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative hidden md:block w-64 mr-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('Search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 rounded-full text-sm outline-none transition-all"
                    />
                    {searchResults && (
                        <SearchResults results={searchResults} onSelect={() => {
                            setSearchQuery("")
                            setSearchResults(null)
                        }} />
                    )}
                </div>

                {/* Gamification Display */}
                {gamificationEnabled && points > 0 && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-100 mr-2">
                        <Trophy size={14} className="text-yellow-600" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Lvl {calculateLevel(points)}</span>
                            <span className="text-xs font-medium text-yellow-800">{points} XP</span>
                        </div>
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 text-xl" suppressHydrationWarning>
                        {language === 'PT-BR' ? '🇧🇷' : language === 'ES' ? '🇪🇸' : '🇺🇸'}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage("PT-BR")}>
                            <span className="mr-2">🇧🇷</span> Português (Brasil) {language === "PT-BR" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage("EN")}>
                            <span className="mr-2">🇺🇸</span> English {language === "EN" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage("ES")}>
                            <span className="mr-2">🇪🇸</span> Español {language === "ES" && "✓"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>



                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none" suppressHydrationWarning>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center justify-between px-2 py-1.5 sticky top-0 bg-white z-10 border-b">
                            <span className="text-sm font-semibold">{t('Notifications')}</span>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                    {t('Mark all as read')}
                                </button>
                            )}
                        </div>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">{t('No notifications')}</div>
                        ) : (
                            notifications.map(n => (
                                <DropdownMenuItem key={n.id} onClick={() => handleNotificationClick(n)} className={`cursor-pointer flex flex-col items-start gap-1 p-3 border-b last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                    <div className="flex w-full justify-between items-start">
                                        <span className={`text-sm ${!n.read ? 'font-semibold text-blue-700' : 'font-medium'}`}>{n.title}</span>
                                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />}
                                    </div>
                                    <span className="text-xs text-gray-600 line-clamp-2">{n.message}</span>
                                    <span className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><MessageCircle size={20} /></button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('Messages')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bookmark size={20} /></button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('Bookmarks')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                    <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs ml-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none" suppressHydrationWarning>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        {user?.surname ? user.surname.charAt(0).toUpperCase() : ''}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span>{t('My Account')}</span>
                                {user?.subscriptionEndsAt && (
                                    <span className="text-xs font-normal text-muted-foreground mt-1">
                                        {(() => {
                                            const end = new Date(user.subscriptionEndsAt)
                                            const now = new Date()
                                            const diffTime = end.getTime() - now.getTime()
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                            return diffDays > 0
                                                ? `${t('You still have')} ${diffDays} ${t('days of access')}`
                                                : t('Access expired')
                                        })()}
                                    </span>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{t('Profile')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t('Settings')}</span>
                        </DropdownMenuItem>
                        {settings.supportLink && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(settings.supportLink, '_blank')}>
                                <LifeBuoy className="mr-2 h-4 w-4" />
                                <span className="truncate max-w-[150px]">{t('Support')}</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('Logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
