"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import * as tus from 'tus-js-client'
import { api } from '@/lib/api'
import { toast } from 'sonner' // Assuming sonner is used for toasts

export interface Upload {
    id: string; // Internal ID for the upload handling
    file: File;
    title: string;
    progress: number;
    status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ERROR';
    videoId?: string;
    error?: string;
    tusUpload?: tus.Upload; // Reference to the TUS upload instance
}

interface UploadContextType {
    uploads: { [id: string]: Upload };
    startUpload: (file: File, title: string) => Promise<{ videoId: string, uploadId: string }>;
    cancelUpload: (id: string) => void;
    retryUpload: (id: string) => void;
    removeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [uploads, setUploads] = useState<{ [id: string]: Upload }>({})

    const startUpload = useCallback(async (file: File, title: string) => {
        const uploadId = Math.random().toString(36).substring(7)

        // Optimistic update
        setUploads(prev => ({
            ...prev,
            [uploadId]: {
                id: uploadId,
                file,
                title,
                progress: 0,
                status: 'PENDING'
            }
        }))

        try {
            // 1. Init Upload via Backend to get Signature
            const initRes = await api.post('/uploads/bunny/init', { title })
            const { videoId, authorizationSignature, authorizationExpire, libraryId, uploadEndpoint, embedUrl } = initRes.data

            // Update with video ID immediately so frontend can use it even while uploading
            setUploads(prev => ({
                ...prev,
                [uploadId]: { ...prev[uploadId], videoId, status: 'UPLOADING' }
            }))

            // 2. Start TUS Upload
            const upload = new tus.Upload(file, {
                endpoint: uploadEndpoint,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    filetype: file.type,
                    title: title,
                    collection: 'course-lessons'
                },
                headers: {
                    AuthorizationSignature: authorizationSignature,
                    AuthorizationExpire: authorizationExpire,
                    VideoId: videoId,
                    LibraryId: String(libraryId),
                },
                onError: (error) => {
                    console.error("TUS Upload Failed:", error)
                    setUploads(prev => ({
                        ...prev,
                        [uploadId]: {
                            ...prev[uploadId],
                            status: 'ERROR',
                            error: 'Falha no upload. Tente novamente.'
                        }
                    }))
                    toast.error(`Falha no upload de: ${title}`)
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(0)
                    setUploads(prev => ({
                        ...prev,
                        [uploadId]: {
                            ...prev[uploadId],
                            progress: parseInt(percentage)
                        }
                    }))
                },
                onSuccess: () => {
                    setUploads(prev => ({
                        ...prev,
                        [uploadId]: {
                            ...prev[uploadId],
                            status: 'COMPLETED',
                            progress: 100
                        }
                    }))
                    toast.success(`Upload concluído: ${title}`)
                }
            })

            // Store TUS instance for cancellation/retries
            // Note: We can't store complex objects like classes in some state managers easily, 
            // but React state is fine if we don't need persistence across reloads (yet)
            // For now, we attach it to the object but handle carefully.
            setUploads(prev => ({
                ...prev,
                [uploadId]: { ...prev[uploadId], tusUpload: upload }
            }))

            upload.start()

            return { videoId, uploadId, embedUrl }

        } catch (err) {
            console.error("Failed to start upload:", err)
            const errorMsg = err instanceof Error ? err.message : "Erro ao iniciar upload"
            setUploads(prev => ({
                ...prev,
                [uploadId]: {
                    ...prev[uploadId],
                    status: 'ERROR',
                    error: errorMsg
                }
            }))
            toast.error(`Erro ao iniciar upload: ${errorMsg}`)
            throw err
        }
    }, [])

    const cancelUpload = useCallback((id: string) => {
        setUploads(prev => {
            const upload = prev[id]
            if (upload && upload.tusUpload) {
                upload.tusUpload.abort()
            }
            // Remove from state
            const newUploads = { ...prev }
            delete newUploads[id]
            return newUploads
        })
        toast.info("Upload cancelado")
    }, [])

    const removeUpload = useCallback((id: string) => {
        setUploads(prev => {
            const newUploads = { ...prev }
            delete newUploads[id]
            return newUploads
        })
    }, [])

    const retryUpload = useCallback((id: string) => {
        // Logic to restart an existing upload entry
        // For simplicity, we might just need to find the file and call startUpload again
        // But the previous startUpload creates a new ID. 
        // We'll leave this simple for now: valid for "Error" state users can just re-add the file or we implement retry logic later.
        // Actually, TUS supports resume, but for now let's rely on auto-retry of TUS.
        // This function is a placeholder if we need manual retry.
        console.log("Retry functionality to be implemented")
    }, [])

    return (
        <UploadContext.Provider value={{ uploads, startUpload, cancelUpload, retryUpload, removeUpload }}>
            {children}
        </UploadContext.Provider>
    )
}

export function useUpload() {
    const context = useContext(UploadContext)
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider')
    }
    return context
}
