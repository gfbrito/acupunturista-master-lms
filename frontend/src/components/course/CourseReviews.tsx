"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/StarRating"
import { toast } from "sonner"

interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
        id: string
        name: string
        avatar: string | null
    }
}

interface CourseReviewsProps {
    courseId: string
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/courses/${courseId}/reviews`)
            setReviews(res.data)
        } catch (error) {
            console.error("Error fetching reviews", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [courseId])

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Por favor, selecione uma avaliação")
            return
        }

        setSubmitting(true)
        try {
            await api.post(`/courses/${courseId}/review`, { rating, comment: comment.trim() || undefined })
            toast.success("Avaliação enviada com sucesso!")
            setRating(0)
            setComment("")
            setShowForm(false)
            fetchReviews()
        } catch (error: any) {
            console.error("Error submitting review", error)
            toast.error(error?.response?.data?.message || "Erro ao enviar avaliação")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="text-center py-8 text-gray-500">Carregando avaliações...</div>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Avaliações do Curso</CardTitle>
                        {!showForm && (
                            <Button onClick={() => setShowForm(true)} size="sm">
                                Adicionar Avaliação
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Review Form */}
                    {showForm && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium mb-3">Sua Avaliação</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Nota:</label>
                                    <StarRating
                                        rating={rating}
                                        interactive
                                        onChange={setRating}
                                        size={32}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Comentário (opcional):</label>
                                    <Textarea
                                        placeholder="Compartilhe sua experiência com este curso..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
                                        {submitting ? "Enviando..." : "Enviar Avaliação"}
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setShowForm(false)
                                        setRating(0)
                                        setComment("")
                                    }}>
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Star size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Seja o primeiro a avaliar este curso!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {review.user.avatar ? (
                                                <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-gray-500">{review.user.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{review.user.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(review.createdAt))} atrás
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <StarRating rating={review.rating} size={16} />
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
