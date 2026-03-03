"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DOMPurify from 'dompurify'
import { pagesService, CustomPage } from "@/services/pages"

export default function PageViewer() {
    const params = useParams()
    const slug = params.slug as string
    const [page, setPage] = useState<CustomPage | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await pagesService.getBySlug(slug)
                setPage(data)
            } catch (error) {
                console.error("Failed to fetch page", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [slug])

    if (loading) return <div>Loading page...</div>
    if (!page) return <div>Page not found</div>

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
            <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
            />
        </div>
    )
}
