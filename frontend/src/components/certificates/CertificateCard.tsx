import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import Link from "next/link";

interface CertificateCardProps {
    courseTitle: string;
    courseImage?: string;
    issuedAt: string;
    code: string;
    pdfUrl?: string; // or id if using dynamic download
    id: string;
}

export function CertificateCard({ courseTitle, courseImage, issuedAt, code, id }: CertificateCardProps) {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/certificates/download/${id}`;
    const validationUrl = `${window.location.origin}/validate/${code}`;

    return (
        <Card className="overflow-hidden">
            <div className="aspect-video w-full bg-slate-100 relative">
                {/* Placeholder for certificate preview if we generated an image */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <span className="text-4xl font-serif">Certificate</span>
                </div>
                {courseImage && (
                    <img src={courseImage} alt={courseTitle} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                )}
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">{courseTitle}</CardTitle>
                <CardDescription>Emitido em {new Date(issuedAt).toLocaleDateString('pt-BR')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground p-2 bg-slate-50 rounded border font-mono text-center">
                    Código: {code}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button asChild className="w-full" variant="outline">
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                    navigator.clipboard.writeText(validationUrl);
                    // toast success
                }}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
