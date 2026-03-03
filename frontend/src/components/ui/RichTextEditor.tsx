"use client"

import { useState, useRef, useCallback } from 'react'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Quote } from 'lucide-react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value)
        // Update the value after command
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
        editorRef.current?.focus()
    }, [onChange])

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }, [onChange])

    const insertLink = () => {
        if (linkUrl) {
            execCommand('createLink', linkUrl)
            setLinkUrl('')
            setIsLinkDialogOpen(false)
        }
    }

    const toolbarButtons = [
        { icon: Bold, command: 'bold', title: 'Negrito' },
        { icon: Italic, command: 'italic', title: 'Itálico' },
        { icon: Underline, command: 'underline', title: 'Sublinhado' },
        { icon: List, command: 'insertUnorderedList', title: 'Lista' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Citação' },
    ]

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b">
                {toolbarButtons.map(({ icon: Icon, command, value, title }) => (
                    <Button
                        key={command}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.preventDefault()
                            if (value) {
                                execCommand(command, value)
                            } else {
                                execCommand(command)
                            }
                        }}
                        title={title}
                    >
                        <Icon size={16} />
                    </Button>
                ))}

                {/* Link button with popup */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.preventDefault()
                            setIsLinkDialogOpen(!isLinkDialogOpen)
                        }}
                        title="Link"
                    >
                        <LinkIcon size={16} />
                    </Button>

                    {isLinkDialogOpen && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-20 flex gap-2">
                            <input
                                type="url"
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="px-2 py-1 border rounded text-sm w-48"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        insertLink()
                                    }
                                }}
                            />
                            <Button size="sm" onClick={insertLink}>OK</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[120px] p-3 outline-none prose prose-sm max-w-none"
                onInput={handleInput}
                data-placeholder={placeholder}
                style={{
                    minHeight: '120px'
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                [contenteditable] blockquote {
                    border-left: 3px solid #d1d5db;
                    padding-left: 12px;
                    margin-left: 0;
                    color: #6b7280;
                    font-style: italic;
                }
                [contenteditable] a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    )
}
