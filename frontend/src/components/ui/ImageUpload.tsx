"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import imageCompression from 'browser-image-compression';
import axios from "axios";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, onRemove, disabled, label = "Upload Image", className }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            // 1. Compress Image
            const options = {
                maxSizeMB: 0.2, // Max 200KB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            let compressedFile = file;
            // Only compress images
            if (file.type.startsWith('image/')) {
                try {
                    compressedFile = await imageCompression(file, options);
                    console.log(`Compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
                } catch (error) {
                    console.warn("Compression failed, using original file", error);
                }
            }

            // 2. Upload to Backend
            const formData = new FormData();
            formData.append('file', compressedFile);

            const token = localStorage.getItem('token');
            const endpoint = file.type.startsWith('image/')
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/image`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/file`;

            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            onChange(response.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file");
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (value) {
        return (
            <div className={`relative w-full h-48 rounded-md overflow-hidden border ${className}`}>
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                            onChange("");
                            if (onRemove) onRemove();
                        }}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                disabled={disabled || loading}
            />
            <Button
                type="button"
                variant="outline"
                className="w-full h-32 flex flex-col gap-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || loading}
            >
                {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <Upload className="h-6 w-6" />
                )}
                <span>{loading ? "Optimizing & Uploading..." : label}</span>
                <span className="text-xs text-gray-500 font-normal">
                    Max 200KB (Auto-compressed)
                </span>
            </Button>
        </div>
    );
}
