"use client"

import React, { useState } from 'react'
import { useUpload, Upload } from '@/contexts/UploadContext'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X, Minimize2, Maximize2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

export function UploadWidget() {
    const { uploads, cancelUpload, removeUpload } = useUpload()
    const [isMinimized, setIsMinimized] = useState(false)

    const activeUploads = Object.values(uploads)

    if (activeUploads.length === 0) return null

    const uploadingCount = activeUploads.filter(u => u.status === 'UPLOADING' || u.status === 'PENDING').length
    const completedCount = activeUploads.filter(u => u.status === 'COMPLETED').length
    const errorCount = activeUploads.filter(u => u.status === 'ERROR').length

    return (
        <div className={cn(
            "fixed bottom-4 left-4 z-50 w-80 bg-white border rounded-lg shadow-xl transition-all duration-300",
            isMinimized ? "w-64" : "w-96"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <h4 className="text-sm font-medium text-gray-900">
                        Uploads ({uploadingCount})
                    </h4>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* List */}
            {!isMinimized && (
                <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                    {activeUploads.map((upload) => (
                        <div key={upload.id} className="p-3 bg-gray-50 rounded border text-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium truncate max-w-[180px]" title={upload.title}>
                                    {upload.title}
                                </span>
                                <div className="flex gap-1">
                                    {upload.status === 'COMPLETED' ? (
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-gray-600" onClick={() => removeUpload(upload.id)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:text-red-600" onClick={() => cancelUpload(upload.id)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span className={cn(
                                    upload.status === 'ERROR' && "text-red-500",
                                    upload.status === 'COMPLETED' && "text-green-600"
                                )}>
                                    {upload.status === 'PENDING' && "Iniciando..."}
                                    {upload.status === 'UPLOADING' && `${upload.progress}%`}
                                    {upload.status === 'COMPLETED' && "Concluído"}
                                    {upload.status === 'ERROR' && "Erro"}
                                </span>
                                {upload.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                {upload.status === 'ERROR' && <AlertCircle className="h-3 w-3 text-red-500" />}
                            </div>

                            <Progress
                                value={upload.progress}
                                className={cn(
                                    "h-1.5",
                                    upload.status === 'ERROR' && "bg-red-100 [&>div]:bg-red-500",
                                    upload.status === 'COMPLETED' && "bg-green-100 [&>div]:bg-green-500"
                                )}
                            />
                            {upload.error && (
                                <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Minimized Summary */}
            {isMinimized && (
                <div className="p-3 text-xs text-gray-600 flex justify-between items-center bg-white rounded-b-lg">
                    <span>
                        {uploadingCount > 0 ? `${uploadingCount} enviando...` : 'Todos concluídos'}
                    </span>
                    {errorCount > 0 && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errorCount} erro(s)</span>}
                </div>
            )}
        </div>
    )
}
