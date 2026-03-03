"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Reply, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Comment {
    id: string
    content: string
    createdAt: string
    likes: number
    user: {
        id: string
        name: string
        avatar: string | null
    }
    replies: Comment[]
}

interface LessonCommentsProps {
    lessonId: string
}

export function LessonComments({ lessonId }: LessonCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchComments = async () => {
        try {
            const res = await api.get(`/lessons/${lessonId}/comments`)
            setComments(res.data)
        } catch (error) {
            console.error("Error fetching comments", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [lessonId])

    const handleCreateComment = async () => {
        if (!newComment.trim()) return
        try {
            await api.post(`/lessons/${lessonId}/comments`, { content: newComment })
            setNewComment("")
            toast.success("Comentário criado com sucesso!")
            fetchComments()
        } catch (error: any) {
            console.error("Error creating comment", error)
            toast.error(error?.response?.data?.message || "Erro ao criar comentário")
        }
    }

    const handleReply = async (parentId: string) => {
        if (!replyContent.trim()) return
        try {
            await api.post(`/lessons/${lessonId}/comments`, { content: replyContent, parentId })
            setReplyContent("")
            setReplyingTo(null)
            fetchComments()
        } catch (error) {
            console.error("Error creating reply", error)
        }
    }

    const handleLikeComment = async (commentId: string) => {
        try {
            await api.post(`/lessons/comments/${commentId}/like`, {})
            fetchComments()
        } catch (error) {
            console.error("Error liking comment", error)
        }
    }

    if (loading) return <div className="text-center py-8 text-gray-500">Loading comments...</div>

    return (
        <div className="space-y-6">
            {/* Create Comment */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle size={20} />
                    Comentários
                </h3>
                <div className="space-y-3">
                    <Textarea
                        placeholder="Compartilhe sua dúvida ou comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleCreateComment} disabled={!newComment.trim()}>
                            Comentar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Seja o primeiro a comentar!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {comment.user.avatar ? (
                                        <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-500">{comment.user.name[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{comment.user.name}</span>
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(comment.createdAt))} atrás
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>

                            {/* Actions (Like & Reply) */}
                            <div className="ml-13 mb-3 flex items-center gap-4">
                                <button
                                    onClick={() => handleLikeComment(comment.id)}
                                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <ThumbsUp size={14} className={comment.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                                    {comment.likes > 0 && <span className="font-medium">{comment.likes}</span>}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(comment.id)}
                                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <Reply size={14} />
                                    Responder
                                </button>
                            </div>

                            {/* Reply Input */}
                            {replyingTo === comment.id && (
                                <div className="ml-13 space-y-2 border-l-2 border-gray-200 pl-4">
                                    <Textarea
                                        placeholder="Escreva sua resposta..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyContent.trim()}>
                                            Responder
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); setReplyContent("") }}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                                <div className="ml-13 space-y-4 mt-4 border-l-2 border-gray-100 pl-4">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {reply.user.avatar ? (
                                                    <img src={reply.user.avatar} alt={reply.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-sm text-gray-500">{reply.user.name[0]}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-gray-900">{reply.user.name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(reply.createdAt))} atrás
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
