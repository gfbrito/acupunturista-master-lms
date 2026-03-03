"use client"

import Link from "next/link"
import { SearchResult } from "@/services/search"
import { GraduationCap, Hash, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface SearchResultsProps {
    results: SearchResult | null;
    onSelect: () => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
    const { t } = useLanguage()

    if (!results) return null;

    const hasResults = results.spaces.length > 0 || results.courses.length > 0 || results.pages.length > 0;

    if (!hasResults) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-50">
                {t('No results found.')}
            </div>
        )
    }

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {results.spaces.length > 0 && (
                <div className="p-2">
                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('Spaces')}</h3>
                    {results.spaces.map(space => (
                        <Link
                            key={space.id}
                            href={`/dashboard/spaces/${space.slug}`}
                            onClick={onSelect}
                            className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                                <Hash size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{space.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {results.courses.length > 0 && (
                <div className="p-2 border-t border-gray-50">
                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1">{t('Courses')}</h3>
                    {results.courses.map(course => (
                        <Link
                            key={course.id}
                            href={`/dashboard/courses/${course.id}`}
                            onClick={onSelect}
                            className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                                <GraduationCap size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{course.title}</span>
                        </Link>
                    ))}
                </div>
            )}

            {results.pages.length > 0 && (
                <div className="p-2 border-t border-gray-50">
                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-1">{t('Pages')}</h3>
                    {results.pages.map(page => (
                        <Link
                            key={page.id}
                            href={`/dashboard/pages/${page.slug}`}
                            onClick={onSelect}
                            className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                                <FileText size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{page.title}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
