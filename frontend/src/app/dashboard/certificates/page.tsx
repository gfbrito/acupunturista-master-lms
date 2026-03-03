"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { toast } from "sonner";

interface Certificate {
    id: string;
    validationCode: string;
    issuedAt: string;
    course: {
        title: string;
        thumbnail?: string;
    }
}

export default function MyCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCertificates() {
            try {
                const res = await api.get('/certificates/my-certificates');
                setCertificates(res.data);
            } catch (error) {
                console.error("Failed to load certificates", error);
                toast.error("Não foi possível carregar seus certificados.");
            } finally {
                setLoading(false);
            }
        }
        loadCertificates();
    }, []);

    if (loading) return <div className="p-8">Carregando certificados...</div>;

    if (certificates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Nenhum certificado ainda</h3>
                <p className="text-muted-foreground mb-4">Complete seus cursos para ganhar certificados!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Meus Certificados</h2>
                <p className="text-muted-foreground">Veja e baixe seus certificados de conclusão.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                    <CertificateCard
                        key={cert.id}
                        id={cert.id}
                        code={cert.validationCode}
                        issuedAt={cert.issuedAt}
                        courseTitle={cert.course.title}
                        courseImage={cert.course.thumbnail}
                    />
                ))}
            </div>
        </div>
    );
}
