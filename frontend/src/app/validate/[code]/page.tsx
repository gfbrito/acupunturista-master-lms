"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ValidateCertificatePage({ params }: { params: { code?: string } }) {
    const [code, setCode] = useState(params.code || "");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async (searchCode: string) => {
        if (!searchCode) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.get(`/certificates/validate/${searchCode}`);
            setResult(res.data);
        } catch (err) {
            setError("Certificado não encontrado ou inválido.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Validar Certificado</CardTitle>
                    <CardDescription>Insira o código de autenticidade para verificar um certificado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Código do certificado (ex: ABCD-1234)"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="uppercase font-mono"
                        />
                        <Button onClick={() => handleValidate(code)} disabled={loading}>
                            {loading ? "Verificando..." : <Search className="h-4 w-4" />}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-600 rounded-lg border border-red-100">
                            <XCircle className="h-12 w-12 mb-2" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="flex flex-col items-center justify-center p-6 bg-green-50 text-green-700 rounded-lg border border-green-100 space-y-2">
                            <CheckCircle2 className="h-16 w-16 mb-4 text-green-600" />
                            <h3 className="text-lg font-bold">Certificado Válido!</h3>
                            <div className="text-center text-sm space-y-1">
                                <p><strong>Aluno:</strong> {result.user.name}</p>
                                <p><strong>Curso:</strong> {result.course.title}</p>
                                <p><strong>Carga Horária:</strong> {result.course.totalHours} horas</p>
                                <p><strong>Emitido em:</strong> {new Date(result.issuedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground mt-8">
                        MasterLMS &copy; 2025
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
