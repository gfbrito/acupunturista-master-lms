"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Lock, Mail } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { settingsService } from "@/services/settings"
import { API_URL } from "@/lib/api"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [appName, setAppName] = useState("Master LMS")
    const router = useRouter()

    useEffect(() => {
        const fetchAppName = async () => {
            const name = await settingsService.getAppName()
            setAppName(name)
        }
        fetchAppName()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            console.log("Attempting login to:", `${API_URL}/auth/login`)
            const res = await axios.post(`${API_URL}/auth/login`, { email, password })
            localStorage.setItem("token", res.data.access_token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            router.push("/dashboard")
        } catch (error) {
            console.error("Login failed", error)
            alert("Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex font-sans text-gray-900">

            {/* --- LEFT SIDE (Brand/Hero) --- */}
            <div className="hidden md:flex md:w-1/2 bg-black relative flex-col justify-between p-12 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-black to-black"></div>

                {/* Logo Area */}
                <div className="relative z-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">{appName}</span>
                </div>

                {/* Main Text */}
                <div className="relative z-10 max-w-lg mt-auto mb-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-6 leading-tight">
                        Aprenda com <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
                            os melhores
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Acesse sua área exclusiva de aprendizado e conecte-se com os maiores especialistas da área.
                    </p>
                </div>

                {/* Footer Area */}
                <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-700"></div>
                            ))}
                        </div>
                        <p className="text-white text-sm font-medium">+2.000 alunos ativos</p>
                    </div>
                    <p className="text-gray-500 text-xs">© 2024 {appName}. Todos os direitos reservados.</p>
                </div>
            </div>

            {/* --- RIGHT SIDE (Login Form) --- */}
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-24 relative">

                {/* Mobile Header */}
                <div className="md:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-black font-bold text-xl">{appName}</span>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="text-center md:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
                        <p className="text-gray-500">Por favor, insira seus dados para entrar.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700">Senha</label>
                                <a href="#" className="text-sm font-medium text-gray-500 hover:text-black hover:underline">
                                    Esqueceu a senha?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-900 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : "Entrar na Plataforma"} <ArrowRight size={20} />
                        </button>

                    </form>


                    <div className="mt-10 text-center text-sm text-gray-500">
                        Quer se tornar um Acupunturista Master? <Link href="/register" className="font-bold text-black hover:underline">Inscreva-se</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
