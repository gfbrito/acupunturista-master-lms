"use client"

import { Feed } from "@/components/community/Feed"
import { Zap, ChevronDown, Pin, Bookmark, MoreHorizontal, ThumbsUp, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { communityService } from "@/services/community"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CommunityPage() {
    const { t } = useLanguage()
    const [trendingPosts, setTrendingPosts] = useState<any[]>([])
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendingRes, eventsRes] = await Promise.all([
                    communityService.getTrendingPosts(),
                    api.get("/events")
                ])
                setTrendingPosts(trendingRes)
                setEvents(eventsRes.data)
            } catch (error) {
                console.error("Failed to fetch community data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex gap-8">
            {/* Main Feed Area */}
            <div className="flex-1 min-w-0">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Header Title */}
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{t('Feed')}</h1>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black hover:bg-gray-50">
                                <Zap size={20} fill="currentColor" />
                            </button>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-600 cursor-pointer">
                                {t('Likes')} <ChevronDown size={14} />
                            </div>
                            <button className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                                {t('New post')}
                            </button>
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div className="w-full aspect-[3/1] bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden relative shadow-sm group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-4xl font-extrabold tracking-tighter mb-2">Master <span className="bg-white text-black px-2 rounded">LMS</span></h2>
                                <p className="opacity-80 text-sm">{t('Community Hub')}</p>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                    </div>

                    {/* Pinned Post Card */}
                    <article className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{t('COMMUNITY RULES')} 🔵</h2>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Pin size={18} className="text-black fill-black" />
                                <Bookmark size={20} className="hover:text-gray-600 cursor-pointer" />
                                <MoreHorizontal size={20} className="hover:text-gray-600 cursor-pointer" />
                            </div>
                        </div>

                        <div className="prose prose-gray max-w-none mb-6">
                            <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3">1. {t('BE RESPECTFUL')}</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('This community is built on integrity and mutual support. Treat everyone with respect.')}
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                {t('No spam, no hate speech, and no self-promotion without permission.')}
                            </p>
                        </div>

                        <div className="flex gap-4 border-t border-gray-100 pt-4">
                            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                                <ThumbsUp size={18} /> {t('Like')}
                            </button>
                            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                                <MessageCircle size={18} /> {t('Comment')}
                            </button>
                        </div>
                    </article>

                    {/* Feed Component */}
                    <Feed />
                </div>
            </div>

            {/* Right Sidebar (Widgets) */}
            <aside className="hidden lg:block w-[340px] flex-shrink-0 sticky top-4 h-[calc(100vh-100px)] overflow-y-auto">
                <div className="space-y-6">
                    {/* Events Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">{t('Upcoming events')}</h3>
                        {events.length > 0 ? (
                            <div className="space-y-4">
                                {events.slice(0, 3).map((event: any) => (
                                    <div key={event.id} className="flex items-start gap-4 hover:bg-gray-50 p-2 rounded-xl transition-colors cursor-pointer -mx-2">
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 w-14 h-14 flex flex-col items-center justify-center flex-shrink-0 text-center">
                                            <span className="text-xs font-bold text-gray-900 block">
                                                {new Date(event.startAt).getDate()}
                                            </span>
                                            <span className="text-[10px] uppercase text-gray-500 font-medium">
                                                {new Date(event.startAt).toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{event.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">{t('No upcoming events.')}</p>
                        )}
                    </div>

                    {/* Trending Posts Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">{t('Trending posts')}</h3>
                        {trendingPosts.length > 0 ? (
                            <div className="space-y-5">
                                {trendingPosts.map((post: any) => (
                                    <div key={post.id} className="flex gap-3 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                                            {post.user.avatar ? (
                                                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                post.user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:underline transition-colors mb-1 line-clamp-2">
                                                {post.title || post.content.substring(0, 50)}
                                            </h4>
                                            <p className="text-xs text-gray-500">{post.user.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">{t('No trending posts yet.')}</p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}
