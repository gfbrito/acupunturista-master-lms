import React from 'react';

interface VideoPlayerProps {
    provider: 'YOUTUBE' | 'VIMEO' | 'BUNNY';
    videoId: string; // ID or URL
    title: string;
}

export function VideoPlayer({ provider, videoId, title }: VideoPlayerProps) {
    if (!videoId) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center text-white">
                <p>Video not available</p>
            </div>
        );
    }

    // Helper to extract URL if user pasted full iframe code
    const getCleanUrl = (input: string) => {
        if (!input) return '';
        const trimmed = input.trim();

        // Handle iframe tags (supports both single and double quotes)
        if (trimmed.includes('<iframe')) {
            const match = trimmed.match(/src=["']([^"']+)["']/);
            return match ? match[1] : trimmed;
        }
        return trimmed;
    };

    let embedUrl = '';
    const cleanId = getCleanUrl(videoId);

    switch (provider) {
        case 'YOUTUBE':
            const ytId = cleanId.includes('v=') ? cleanId.split('v=')[1].split('&')[0] : cleanId;
            // Handle specific YouTube embed/short URLs if pasted directly
            if (cleanId.includes('embed/')) {
                embedUrl = cleanId;
            } else if (cleanId.includes('youtu.be/')) {
                const shortId = cleanId.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${shortId}`;
            } else {
                embedUrl = `https://www.youtube.com/embed/${ytId}`;
            }
            break;
        case 'VIMEO':
            if (cleanId.startsWith('http')) {
                // Try to extract ID from various Vimeo URL formats
                const vimeoId = cleanId.split('/').pop();
                embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            } else {
                embedUrl = `https://player.vimeo.com/video/${cleanId}`;
            }
            break;
        case 'BUNNY':
            // Bunny logic: Use full URL if provided (preferred)
            // Handle both embed URLs and direct play URLs
            if (cleanId.includes('bunnycdn.com') || cleanId.includes('mediadelivery.net')) {
                embedUrl = cleanId;

                // If user pasted a direct play URL (anywhere with /play/), try to convert to embed
                // This covers video.bunnycdn.com/play/..., specialized domains, etc.
                if (cleanId.includes('/play/')) {
                    const parts = cleanId.split('/play/');
                    if (parts.length > 1) {
                        // Always use the standard iframe domain for consistency
                        embedUrl = `https://iframe.mediadelivery.net/embed/${parts[1]}`;
                    }
                }
            } else {
                // If just an ID is provided, we treat it as the URL for now (or it might be a partial path)
                // Without a configured Library ID, we can't construct the full URL from just a Video ID.
                embedUrl = cleanId;
            }
            break;
        default:
            return (
                <div className="aspect-video bg-gray-900 flex items-center justify-center text-white">
                    <p>Unsupported Provider</p>
                </div>
            );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <iframe
                src={embedUrl}
                title={title}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
